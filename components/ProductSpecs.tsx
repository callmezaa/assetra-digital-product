import { MonitorSmartphone, LayoutTemplate, Shapes, FileImage, Cpu, Glasses } from 'lucide-react'

interface ProductSpecsProps {
  category: string
}

export default function ProductSpecs({ category }: ProductSpecsProps) {
  // We'll dynamically show specs based on category (mocked for visual storytelling)
  const isCode = category === 'UI Kits' || category === 'Templates'
  const isDesign = category === 'Icons' || category === 'UI Kits'
  
  return (
    <div className="animate-desc opacity-0 p-10 rounded-[2.5rem] bg-card border border-border/20 shadow-sm space-y-8">
      <div className="flex items-center gap-2 pb-6 border-b border-border/20">
        <Cpu className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Tech Stack & Specs</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {/* Spec 1 */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/20 hover:border-primary/20 transition-colors">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <MonitorSmartphone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground ">Platform</p>
            <p className="text-sm font-bold text-foreground">Responsive Web</p>
          </div>
        </div>

        {/* Spec 2 */}
        {isDesign && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/20 hover:border-primary/20 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Shapes className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground ">Software</p>
              <p className="text-sm font-bold text-foreground">Figma Ready</p>
            </div>
          </div>
        )}

        {/* Spec 3 */}
        {isCode && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/20 hover:border-primary/20 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
              <LayoutTemplate className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground ">Framework</p>
              <p className="text-sm font-bold text-foreground">React / Next.js</p>
            </div>
          </div>
        )}

        {/* Spec 4 */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/20 hover:border-primary/20 transition-colors">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <FileImage className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground ">Formats</p>
            <p className="text-sm font-bold text-foreground">.fig, .tsx, .png</p>
          </div>
        </div>

        {/* Spec 5 */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/20 hover:border-primary/20 transition-colors">
          <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Glasses className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground ">Resolution</p>
            <p className="text-sm font-bold text-foreground">4K Retina</p>
          </div>
        </div>
      </div>
    </div>
  )
}
