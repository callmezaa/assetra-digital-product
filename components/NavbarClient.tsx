'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Store, 
  User, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronDown,
  Package,
  Library,
  Menu,
  X,
  Wallet,
  MessageSquare,
  PlusCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import CartButton from './CartButton'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'

interface NavbarClientProps {
  user: any
  profile: any
  signoutAction: () => Promise<void>
}

export default function NavbarClient({ user, profile, signoutAction }: NavbarClientProps) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Marketplace', href: '/marketplace', icon: Store },
    ...(user ? [{ name: 'My Library', href: '/library', icon: Library }] : []),
  ]

  const dashboardLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Messages', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Add Product', href: '/dashboard/new', icon: PlusCircle },
    { name: 'My Products', href: '/dashboard/products', icon: Package },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 px-2 sm:px-4 py-2 sm:py-4 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="container mx-auto max-w-7xl h-14 sm:h-16 pointer-events-auto"
        >
          <div className="h-full bg-background/60 dark:bg-background/40 backdrop-blur-2xl border border-border/50 rounded-2xl px-3 sm:px-6 flex items-center justify-between shadow-2xl shadow-black/5 ring-1 ring-white/5">
            
            {/* Left: Logo & Links */}
            <div className="flex items-center gap-4 sm:gap-8">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative h-8 sm:h-9 flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all">
                  <img src="/logo.png" alt="Assetra Logo" className="h-8 sm:h-9 w-auto object-contain drop-shadow-sm" />
                </div>
                <span className="font-black text-lg sm:text-xl tracking-tighter">Assetra</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className="relative px-4 py-2 text-sm font-bold transition-colors"
                    onMouseEnter={() => setIsHovered(link.href)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <span className={pathname === link.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}>
                      {link.name}
                    </span>
                    
                    {/* Hover/Active Indicator */}
                    <AnimatePresence>
                      {(isHovered === link.href || pathname === link.href) && (
                        <motion.div
                          layoutId="nav-indicator"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`absolute inset-0 z-[-1] rounded-xl ${
                            pathname === link.href ? 'bg-primary/10' : 'bg-muted/50'
                          }`}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center bg-muted/30 p-1 rounded-xl gap-0.5 sm:gap-1 border border-border/30">
                <ThemeToggle />
                <div className="w-px h-4 bg-border/50 mx-0.5 sm:mx-1" />
                <CartButton />
                {user && (
                  <>
                    <div className="w-px h-4 bg-border/50 mx-0.5 sm:mx-1" />
                    <NotificationBell userId={user.id} />
                  </>
                )}
              </div>

              {/* Desktop user menu */}
              <div className="hidden md:block ml-2">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button title="User Menu" aria-label="User Menu" className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all outline-none">
                          <div className="h-8 w-8 rounded-lg overflow-hidden border border-border shadow-sm relative">
                            <Image 
                              src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || user.email}`} 
                              alt="Avatar" 
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 bg-background/90 backdrop-blur-xl border-border/50 shadow-2xl">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm truncate">{profile?.full_name || 'Creator'}</span>
                            <span className="text-[10px] text-muted-foreground font-medium truncate">{user.email}</span>
                          </div>
                        </DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="my-1 bg-border/50" />
                      <DropdownMenuGroup>
                        <DropdownMenuItem render={
                          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="font-bold text-sm">Dashboard</span>
                          </Link>
                        } />
                        <DropdownMenuItem render={
                          <Link href="/dashboard/products" className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                            <Package className="h-4 w-4" />
                            <span className="font-bold text-sm">Manage Products</span>
                          </Link>
                        } />
                        <DropdownMenuItem render={
                          <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                            <Settings className="h-4 w-4" />
                            <span className="font-bold text-sm">Settings</span>
                          </Link>
                        } />
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="my-1 bg-border/50" />
                      <DropdownMenuItem 
                        onClick={() => signoutAction()}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-xl focus:bg-destructive/10 focus:text-destructive text-destructive transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="font-bold text-sm">Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" className="rounded-xl font-bold h-10 px-5 hover:bg-muted/50">Log in</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="rounded-xl font-bold h-10 px-6 shadow-lg shadow-primary/20">Sign up</Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button 
                className="md:hidden ml-1 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/50 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-background border-l border-border/50 z-[201] flex flex-col shadow-2xl"
            >
              {/* Mobile menu header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <span className="font-bold text-sm">Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/50 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User info */}
              {user && (
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl overflow-hidden border border-border shadow-sm relative">
                      <Image 
                        src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || user.email}`} 
                        alt="Avatar" 
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{profile?.full_name || 'Creator'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      pathname === link.href 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                ))}

                {user && (
                  <>
                    <div className="pt-6 pb-2">
                      <p className="px-4 text-[11px] font-bold text-muted-foreground mb-2">Main menu</p>
                      <div className="space-y-1">
                        {dashboardLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                              pathname === link.href 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }`}
                          >
                            <link.icon className="h-5 w-5" />
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 pb-2">
                      <p className="px-4 text-[11px] font-bold text-muted-foreground mb-2">System</p>
                      <Link 
                        href="/dashboard/settings" 
                        onClick={() => setMobileMenuOpen(false)} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                          pathname === '/dashboard/settings'
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                      >
                        <Settings className="h-5 w-5" />
                        Settings
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom actions */}
              <div className="p-4 border-t border-border/50 space-y-2">
                {user ? (
                  <button 
                    onClick={() => { signoutAction(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                      <Button variant="outline" className="w-full rounded-xl h-11 font-semibold">Log in</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                      <Button className="w-full rounded-xl h-11 font-semibold shadow-lg shadow-primary/20">Sign up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
