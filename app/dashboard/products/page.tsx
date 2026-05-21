import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  PlusCircle, 
  Package, 
  Search, 
  Filter, 
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  Download,
  Eye,
  Settings2,
  DollarSign
} from 'lucide-react'
import DeleteProductButton from '../DeleteProductButton'
import DashboardSidebar from '@/components/DashboardSidebar'
import HeroAnimations from '@/components/HeroAnimations'
import StatusToggleButton from './StatusToggleButton'
import ProductInventory from './ProductInventory'

export default async function MyProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all user's products with their sales data
  const { data: products } = await supabase
    .from('products')
    .select('*, orders(amount)')
    .eq('user_id', user.id)
    .eq('orders.status', 'completed')
    .order('created_at', { ascending: false })

  const totalProducts = products?.length || 0

  return (
    <div className="flex bg-muted/5 min-h-[calc(100vh-64px)]">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        <HeroAnimations>
          <div className="max-w-6xl mx-auto space-y-10">
            
            {/* Header Section */}
            <div className="animate-title opacity-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase mb-1">
                  <Package className="h-3 w-3" />
                  Inventory Management
                </div>
                <h1 className="text-4xl font-black tracking-tight">My Products</h1>
                <p className="text-muted-foreground text-sm font-medium">Control, edit, and track every digital asset you&apos;ve published.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-2xl h-12 px-6 border-border/50 font-bold gap-2 hover:bg-muted/50">
                  <Settings2 className="h-4 w-4" />
                  Manage All
                </Button>
                <Link href="/dashboard/new">
                  <Button className="rounded-2xl h-12 px-6 shadow-xl shadow-primary/25 gap-2 font-bold transition-all hover:scale-105 active:scale-95">
                    <PlusCircle className="h-5 w-5" />
                    Add Product
                  </Button>
                </Link>
              </div>
            </div>

            {/* Client-Side Inventory Logic (Search, Select, Batch) */}
            <div className="animate-desc opacity-0">
              <ProductInventory initialProducts={products || []} />
            </div>
          </div>
        </HeroAnimations>
      </main>
    </div>
  )
}

