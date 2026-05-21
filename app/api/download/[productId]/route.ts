import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const SIGNED_URL_DURATION_SECONDS = 900 // 15 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const supabase = await createClient()

    // 1. Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to download.' },
        { status: 401 }
      )
    }

    // 2. Fetch the product (file_url and owner)
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, title, file_url, user_id')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      )
    }

    const isOwner = product.user_id === user.id

    // 3. If not the owner, verify a completed purchase exists
    if (!isOwner) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('status', 'completed')
        .single()

      if (orderError || !order) {
        return NextResponse.json(
          { error: 'Access denied. You have not purchased this product.' },
          { status: 403 }
        )
      }
    }

    // 4. Ensure file_url is a valid storage path (not a full URL)
    const filePath = product.file_url.startsWith('http')
      ? new URL(product.file_url).pathname.split('/assets/')[1]
      : product.file_url

    if (!filePath) {
      return NextResponse.json(
        { error: 'Invalid file path stored for this product.' },
        { status: 500 }
      )
    }

    // 5. Use the service role client to generate a signed URL
    // This bypasses RLS on storage so both buyer and owner can get a signed URL
    const { createClient: createAdminClient } = await import('@/lib/supabase/admin')
    const adminSupabase = createAdminClient()

    const { data: signedData, error: signedError } = await adminSupabase.storage
      .from('assets')
      .createSignedUrl(filePath, SIGNED_URL_DURATION_SECONDS, {
        download: product.title || 'download',
      })

    if (signedError || !signedData?.signedUrl) {
      console.error('[Download API] Signed URL Error:', signedError)
      return NextResponse.json(
        { error: 'Failed to generate download link. Please try again.' },
        { status: 500 }
      )
    }

    // 6. Redirect the user directly to the signed URL
    // The browser will download the file automatically
    return NextResponse.redirect(signedData.signedUrl)

  } catch (err: any) {
    console.error('[Download API] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
