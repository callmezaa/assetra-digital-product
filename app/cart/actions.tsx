'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { resend } from '@/lib/resend'
import { ReceiptEmail } from '@/components/emails/ReceiptEmail'
import midtransClient from 'midtrans-client'

export async function processCheckout(productIds: string[]) {
  if (!productIds || productIds.length === 0) {
    return { error: 'Cart is empty' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be logged in to checkout.' }
  }

  try {
    // 1. Fetch product details to get current prices
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, title, price, user_id')
      .in('id', productIds)

    if (fetchError || !products) {
      throw new Error('Failed to fetch product details for checkout.')
    }

    // 2. Prepare order objects with historical price (amount)
    const ordersToInsert = products.map(product => ({
      user_id: user.id,
      product_id: product.id,
      amount: product.price, // Save price at the time of purchase
      status: 'completed' 
    }))

    // 3. Batch insert into 'orders' table
    const { error: insertError } = await supabase
      .from('orders')
      .insert(ordersToInsert)

    if (insertError) {
      console.error('Checkout insert error:', insertError)
      throw new Error('Failed to process orders in database.')
    }

    // 4. Optional: Remove these items from user's wishlist
    await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .in('product_id', productIds)

    if (products) {
      // Get buyer's profile name
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const buyerName = buyerProfile?.full_name || 'Someone'

      const notifs = products
        .filter(p => p.user_id !== user.id) // Don't notify yourself
        .map(p => ({
          user_id: p.user_id,
          type: 'purchase' as const,
          title: '💰 New Sale!',
          message: `${buyerName} just purchased "${p.title}"`,
          metadata: { product_id: p.id, buyer_id: user.id }
        }))

      if (notifs.length > 0) {
        await supabase.from('notifications').insert(notifs)
      }
    }

    // Send Receipt Email (Non-blocking)
    if (products) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const total = products.reduce((sum, p) => sum + Number(p.price), 0)

      resend.emails.send({
        from: 'Assetra <onboarding@resend.dev>',
        to: user.email!,
        subject: 'Your Assetra Receipt',
        react: <ReceiptEmail
          customerName={profile?.full_name || 'Valued Customer'}
          items={products.map(p => ({ title: p.title, price: Number(p.price) }))}
          total={total}
        />,
      }).catch(err => console.error('Failed to send receipt email:', err))
    }

    // Revalidate paths so the library updates instantly
    revalidatePath('/library')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error: any) {
    console.error('Checkout error:', error)
    return { error: error.message || 'An unexpected error occurred during checkout.' }
  }
}

export async function createMidtransTransaction(productIds: string[]) {
  if (!productIds || productIds.length === 0) {
    return { error: 'Cart is empty' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be logged in to checkout.' }
  }

  try {
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, title, price, user_id, category')
      .in('id', productIds)

    if (fetchError || !products) {
      throw new Error('Failed to fetch product details.')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .single()

    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    })

    const EXCHANGE_RATE = 16000 // 1 USD = 16,000 IDR
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    let grossAmount = 0
    const itemDetails = products.map(p => {
      const priceIDR = Math.round(Number(p.price) * EXCHANGE_RATE)
      grossAmount += priceIDR
      return {
        id: p.id,
        price: priceIDR,
        quantity: 1,
        name: p.title.substring(0, 50),
        category: p.category || 'Digital Product'
      }
    })

    const totalUSD = products.reduce((acc, p) => acc + Number(p.price), 0)
    const MILESTONE_TARGET = 30.00
    const platformFeeUSD = totalUSD > 0 && totalUSD < MILESTONE_TARGET ? 2.50 : 0
    if (platformFeeUSD > 0) {
      const platformFeeIDR = Math.round(platformFeeUSD * EXCHANGE_RATE)
      grossAmount += platformFeeIDR
      itemDetails.push({
        id: 'platform-fee',
        price: platformFeeIDR,
        quantity: 1,
        name: 'Platform Fee',
        category: 'Fee'
      })
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount
      },
      item_details: itemDetails,
      customer_details: {
        first_name: profile?.full_name || 'Assetra',
        last_name: 'Customer',
        email: user.email || 'customer@assetra.com'
      },
      custom_field1: productIds.join(','),
      custom_field2: user.id,
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/success`
      }
    }

    const transaction = await snap.createTransaction(parameter)

    return { 
      success: true, 
      token: transaction.token, 
      redirect_url: transaction.redirect_url 
    }
  } catch (error: any) {
    console.error('Midtrans transaction error:', error)
    return { error: error.message || 'Failed to initialize payment gateway.' }
  }
}

export async function checkPaymentStatus(orderId: string) {
  try {
    const coreApi = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    })

    const statusResponse = await coreApi.transaction.status(orderId)
    
    if (statusResponse.transaction_status === 'settlement' || statusResponse.transaction_status === 'capture') {
      // Re-use the webhook logic manually here for localhost fallback
      const productIds = statusResponse.custom_field1 ? statusResponse.custom_field1.split(',') : []
      const userId = statusResponse.custom_field2

      if (!userId || productIds.length === 0) return { success: false, reason: 'missing_metadata' }

      const supabase = await createClient()
      
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productIds[0])
        .eq('status', 'completed')
        .single()
        
      if (existingOrder) return { success: true, message: 'Already fulfilled' }

      const { data: products } = await supabase.from('products').select('id, price').in('id', productIds)
      if (!products) return { success: false }

      const ordersToInsert = products.map(p => ({
        user_id: userId,
        product_id: p.id,
        amount: p.price,
        status: 'completed'
      }))

      await supabase.from('orders').insert(ordersToInsert)
      await supabase.from('wishlist').delete().eq('user_id', userId).in('product_id', productIds)

      revalidatePath('/library')
      revalidatePath('/dashboard')

      return { success: true, message: 'Fulfilled via fallback' }
    }
    return { success: false, status: statusResponse.transaction_status }
  } catch (error) {
    console.error('Check status error:', error)
    return { success: false, error: 'Failed to check status' }
  }
}
