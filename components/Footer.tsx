import Link from 'next/link'
import { Store, Send, Camera, Globe, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/40">
      <div className="container mx-auto px-4 max-w-7xl pt-12 md:pt-24 pb-8 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 mb-12 md:mb-20">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-9 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <img src="/logo.png" alt="Assetra Logo" className="h-9 w-auto object-contain drop-shadow-sm" />
              </div>
              <span className="font-black text-2xl tracking-tighter">Assetra</span>
            </Link>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs font-medium">
              The world's leading marketplace for high-quality digital assets. Curated by professionals, for professionals.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link href="#" className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                <Send className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                <Camera className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                <Globe className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h4 className="text-[14px] font-bold text-foreground">Marketplace</h4>
              <ul className="space-y-4">
                <li><Link href="/marketplace" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">All Assets</Link></li>
                <li><Link href="/marketplace?category=ui-kits" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">UI Kits</Link></li>
                <li><Link href="/marketplace?category=templates" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">Templates</Link></li>
                <li><Link href="/marketplace?category=icons" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">Icons</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[14px] font-bold text-foreground">Resources</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">Sell on Assetra</Link></li>
                <li><Link href="#" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">Affiliate Program</Link></li>
                <li><Link href="#" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">Help Center</Link></li>
                <li><Link href="#" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">Contact Us</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[14px] font-bold text-foreground">Company</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">About Us</Link></li>
                <li><Link href="#" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">Careers</Link></li>
                <li><Link href="/privacy" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-[13px] text-muted-foreground hover:text-primary transition-colors font-medium">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 md:pt-8 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground/60 font-medium" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Assetra Digital. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors font-medium">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors font-medium">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
