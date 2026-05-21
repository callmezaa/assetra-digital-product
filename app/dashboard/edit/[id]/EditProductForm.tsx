'use client'

import { useActionState, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  AlertCircle, 
  ArrowLeft, 
  Edit, 
  Type, 
  DollarSign, 
  Tag, 
  LayoutDashboard, 
  FileText,
  Image as ImageIcon,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Wand2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { handleUpdateProduct, generateAIDescription } from './actions'
import { SubmitButton } from '@/components/SubmitButton'
import FileUpload from '@/components/FileUpload'
import HeroAnimations from '@/components/HeroAnimations'
import { Product } from '@/types'

export default function EditProductForm({ product }: { product: Product }) {
  const [state, formAction] = useActionState(handleUpdateProduct, null)
  const [description, setDescription] = useState(product.description || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [title, setTitle] = useState(product.title || '')
  const [category, setCategory] = useState(product.category || 'Templates')

  const handleAIGenerate = async () => {
    if (!title) return alert('Please enter a product title first!')
    
    setIsGenerating(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('category', category)

    const result = await generateAIDescription(formData)
    
    if (result.success && result.content) {
      setDescription(result.content)
    } else {
      alert(result.error || 'Failed to generate content')
    }
    setIsGenerating(false)
  }

  return (
    <HeroAnimations>
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="animate-title opacity-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-1">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors gap-1 mb-2 group"
            >
              <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
              BACK TO DASHBOARD
            </Link>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/5">
                <Edit className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">Edit Product</h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/10 rounded-2xl">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <p className="text-xs font-bold text-primary tracking-tight uppercase">AI Optimization Mode</p>
          </div>
        </div>

        <form action={formAction} className="space-y-8">
          <input type="hidden" name="id" value={product.id} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Product Details */}
            <div className="lg:col-span-2 space-y-8">
              <div className="animate-btns opacity-0 p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-8">
                <div className="flex items-center gap-2 pb-4 border-b border-border/50">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-bold">Product Information</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-sm font-bold text-muted-foreground ml-1 flex items-center gap-2">
                      <Type className="h-3.5 w-3.5" />
                      TITLE
                    </label>
                    <Input 
                      id="title"
                      name="title" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Premium SaaS UI Kit" 
                      required 
                      className="h-14 rounded-2xl bg-muted/20 border-border/50 focus:bg-background focus:ring-primary/20 focus:border-primary transition-all text-base font-medium px-6"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground ml-1 flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5" />
                        PRICE (USD)
                      </label>
                      <Input 
                        id="price"
                        name="price" 
                        type="number" 
                        step="0.01" 
                        defaultValue={product.price}
                        placeholder="29.00" 
                        required 
                        className="h-14 rounded-2xl bg-muted/20 border-border/50 focus:bg-background transition-all text-base font-bold px-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground ml-1 flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" />
                        CATEGORY
                      </label>
                      <select 
                        id="category"
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        title="Select product category"
                        className="w-full h-14 rounded-2xl bg-muted/20 border-border/50 focus:bg-background focus:border-primary outline-none px-6 text-base font-medium transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="Templates">Templates</option>
                        <option value="UI Kits">UI Kits</option>
                        <option value="Icons">Icons</option>
                        <option value="Tools">Tools</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        DESCRIPTION
                      </label>
                      <Button 
                        type="button"
                        size="sm"
                        onClick={handleAIGenerate}
                        disabled={isGenerating || !title}
                        className="h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 gap-2 text-[10px] font-black uppercase tracking-wider"
                      >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                        Magic AI Rewriting
                      </Button>
                    </div>
                    <Textarea 
                      id="description"
                      name="description" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what makes your product unique..." 
                      required 
                      rows={10}
                      className="rounded-[2rem] bg-muted/20 border-border/50 focus:bg-background transition-all p-6 text-sm leading-relaxed font-medium resize-none min-h-[300px]"
                    />
                  </div>
                </div>
              </div>

              {state?.error && (
                <div className="bg-destructive/10 text-destructive flex items-center gap-2 p-4 rounded-2xl text-sm font-bold border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5" />
                  {state.error}
                </div>
              )}
            </div>

            {/* Right Column: Media & Submission */}
            <div className="animate-desc opacity-0 space-y-8">
              {/* Media Card */}
              <div className="p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-8">
                <div className="flex items-center gap-2 pb-4 border-b border-border/50">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-bold">Assets</h2>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Thumbnail Image</p>
                    <div className="flex items-center gap-4 mb-2 p-2 bg-muted/30 rounded-2xl border border-border/50">
                      <img src={product.thumbnail_url} alt="Current" className="h-10 w-10 rounded-lg object-cover shadow-sm" />
                      <span className="text-[10px] font-bold text-muted-foreground">CURRENT PREVIEW</span>
                    </div>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-500" />
                      <FileUpload name="thumbnail" accept="image/*" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Product File (.zip)</p>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-500" />
                      <FileUpload name="asset" accept=".zip,.pdf,.rar,.7z" />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic ml-2">Upload to replace current asset file</p>
                  </div>
                </div>
              </div>

              {/* Submission Card */}
              <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/30 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 -mr-6 -mt-6 opacity-10">
                  <UploadCloud className="h-32 w-32" />
                </div>
                <div className="relative z-10 space-y-4">
                  <h3 className="text-xl font-bold leading-tight">Save changes?</h3>
                  <p className="text-sm text-primary-foreground/80 font-medium">Updates will be applied immediately across the entire marketplace.</p>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      SECURE UPDATE SYNC
                    </div>
                  </div>

                  <SubmitButton 
                    className="w-full h-16 rounded-2xl bg-white text-primary hover:bg-white/90 text-lg font-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]" 
                    pendingText="Saving..."
                  >
                    Update Product
                  </SubmitButton>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </HeroAnimations>
  )
}
