import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ShoppingBag, 
  Clock, 
  Package, 
  LayoutGrid,
  ExternalLink,
  Heart,
  Zap,
  HardDrive
} from 'lucide-react'
import DashboardSidebar from '@/components/DashboardSidebar'
import LibraryClient from './LibraryClient'

export default async function MyLibrary({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'purchased' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch purchased products
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      products (
        id,
        title,
        description,
        thumbnail_url,
        category,
        price
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  // Fetch wishlisted products
  const { data: wishlist } = await supabase
    .from('wishlist')
    .select(`
      id,
      products (
        id,
        title,
        description,
        thumbnail_url,
        category,
        price
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate Library Stats
  const totalAssets = orders?.length || 0
  const lastPurchase = orders && orders.length > 0 ? new Date(orders[0].created_at).toLocaleDateString() : 'None'
  
  const categoriesMap: Record<string, number> = {}
  orders?.forEach((o: any) => {
    const cat = o.products.category || 'Other'
    categoriesMap[cat] = (categoriesMap[cat] || 0) + 1
  })
  const favCategory = Object.entries(categoriesMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
  const estimatedStorage = (totalAssets * 120 / 1024).toFixed(1)

  return (
    <div className="flex bg-muted/5 min-h-[calc(100vh-64px)]">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        <LibraryClient 
          initialOrders={orders || []} 
          initialWishlist={wishlist || []} 
          currentTab={tab}
          stats={{
            totalAssets,
            favCategory,
            lastPurchase,
            estimatedStorage
          }}
        />
      </main>
    </div>
  )
}
