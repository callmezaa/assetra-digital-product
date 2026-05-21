import { CheckCircle2, Layers, Moon, Zap, RefreshCw, PenTool, Gem } from 'lucide-react'

interface ProductFeaturesProps {
  category: string
}

export default function ProductFeatures({ category }: ProductFeaturesProps) {
  // Generate dynamic features based on category to make it look realistic
  const getFeatures = () => {
    const baseFeatures = [
      { icon: Gem, title: "Premium Quality", desc: "Pixel-perfect design & organized layers" },
      { icon: RefreshCw, title: "Lifetime Updates", desc: "Get all future versions for free" },
    ]

    if (category === 'UI Kits' || category === 'Templates') {
      return [
        { icon: Layers, title: "50+ Pre-built Screens", desc: "Ready to use layouts & components" },
        { icon: Moon, title: "Dark & Light Mode", desc: "Seamless theme switching built-in" },
        { icon: Zap, title: "Interactive Components", desc: "Hover states & micro-interactions" },
        ...baseFeatures
      ]
    }
    
    if (category === 'Icons') {
      return [
        { icon: Layers, title: "1,000+ Vector Icons", desc: "Scalable without quality loss" },
        { icon: PenTool, title: "Fully Customizable", desc: "Change colors and stroke width easily" },
        { icon: Zap, title: "Multiple Formats", desc: "SVG, PNG, EPS, and Figma ready" },
        ...baseFeatures
      ]
    }

    return [
      { icon: Layers, title: "Organized Source Files", desc: "Clean and easy to navigate structure" },
      { icon: PenTool, title: "Easily Editable", desc: "Adapt it to your brand in minutes" },
      { icon: Zap, title: "High Resolution", desc: "Crisp exports for all devices" },
      ...baseFeatures
    ]
  }

  const features = getFeatures()

  return (
    <div className="animate-desc opacity-0 p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-transparent border border-border/20 shadow-sm space-y-8">
      <div className="flex items-center gap-2 pb-6 border-b border-border/20">
        <CheckCircle2 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold tracking-tight">What's Inside</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feat, idx) => (
          <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/30 hover:border-primary/30 transition-colors shadow-sm">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <feat.icon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-1">{feat.title}</h4>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                {feat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
