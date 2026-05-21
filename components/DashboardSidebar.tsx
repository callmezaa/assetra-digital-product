'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Wallet,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Wallet, label: 'Wallet', href: '/dashboard/wallet' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/chat' },
  { icon: PlusCircle, label: 'Add Product', href: '/dashboard/new' },
  { icon: Package, label: 'My Products', href: '/dashboard/products' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border/50 bg-muted/20 hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
      <div className="p-6 space-y-8 flex-1">
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground px-3">Main menu</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                  pathname === item.href 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {pathname === item.href && <ChevronRight className="h-3 w-3" />}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-border/50 space-y-2">
          <p className="text-xs font-bold text-muted-foreground px-3">System</p>
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
              pathname === '/dashboard/settings' 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      <div className="p-6 mt-auto">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-2xl border border-primary/10">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-bold">Pro tips</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Upload high-quality thumbnails to increase your sales by up to 40%.
          </p>
        </div>
      </div>
    </aside>
  )
}
