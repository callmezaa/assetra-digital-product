'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, ExternalLink, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

interface LivePreviewModalProps {
  demoUrl?: string
  title: string
}

export default function LivePreviewModal({ demoUrl, title }: LivePreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Use a simulated preview URL if none exists in the DB
  const actualDemoUrl = demoUrl || "https://example.com"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        render={
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-14 text-base font-bold rounded-xl border-border/20 bg-card hover:bg-muted/50 text-foreground gap-2 transition-all shadow-sm group"
          />
        }
      >
        <Eye className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        Live Preview
      </DialogTrigger>
      
      <DialogContent 
        className="max-w-[98vw] h-[95vh] p-0 overflow-hidden bg-background border-border/20 rounded-[2rem] shadow-xl flex flex-col"
        showCloseButton={false}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-card z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="h-4 w-[1px] bg-border/50" />
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
              Previewing: <span className="text-muted-foreground">{title}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
              onClick={() => window.open(actualDemoUrl, '_blank')}
            >
              Open in New Tab
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 bg-muted/20 relative w-full h-full">
          {/* Skeleton/Loading State Background */}
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="flex flex-col items-center gap-4 text-muted-foreground/50">
              <Eye className="h-12 w-12 animate-pulse" />
              <p className="text-sm font-bold animate-pulse">Loading Environment...</p>
            </div>
          </div>
          
          <iframe 
            src={actualDemoUrl} 
            className="w-full h-full border-none bg-background rounded-b-[2rem]"
            title={`Live Preview of ${title}`}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
