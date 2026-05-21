import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditProductForm from '@/app/dashboard/edit/[id]/EditProductForm'

export default async function EditProduct({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 max-w-3xl py-12">
      <EditProductForm product={product} />
    </div>
  )
}
