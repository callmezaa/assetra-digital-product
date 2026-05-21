'use client'

import { useActionState, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertCircle, 
  ArrowLeft, 
  PlusCircle, 
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
  Loader2,
  Eye,
  Coins,
  TrendingUp,
  Layers,
  Component,
  Box,
  MoreHorizontal,
  Hash,
  X
} from 'lucide-react'
import Link from 'next/link'
import { handleCreateProduct, generateAIDescription, getAIPricingSuggestion, getSmartTags } from './actions'
import { SubmitButton } from '@/components/SubmitButton'
import FileUpload from '@/components/FileUpload'
import DashboardSidebar from '@/components/DashboardSidebar'
import HeroAnimations from '@/components/HeroAnimations'
import ProductCard from '@/components/ProductCard'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const CATEGORY_OPTIONS = [
  { 
    id: 'Templates', 
    label: 'Templates', 
    icon: LayoutDashboard, 
    desc: 'Website & App starters',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  { 
    id: 'UI Kits', 
    label: 'UI Kits', 
    icon: Layers, 
    desc: 'Design systems & Kits',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  { 
    id: 'Icons', 
    label: 'Icons', 
    icon: Component, 
    desc: 'Vector sets & Graphics',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10'
  },
  { 
    id: 'Tools', 
    label: 'Tools', 
    icon: Box, 
    desc: 'Plugins & Software',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
  { 
    id: 'Other', 
    label: 'Other', 
    icon: MoreHorizontal, 
    desc: 'Miscellaneous assets',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
]

const DRAFT_KEY = 'assetra_new_product_draft'

export default function NewProduct() {
  const [state, formAction] = useActionState(handleCreateProduct, null)
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPricingGenerating, setIsPricingGenerating] = useState(false)
  const [isTagsGenerating, setIsTagsGenerating] = useState(false)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Templates')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [hasProOverlay, setHasProOverlay] = useState(true)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  // 1. Load Draft on Mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setTitle(draft.title || '')
        setDescription(draft.description || '')
        setPrice(draft.price || '')
        setCategory(draft.category || 'Templates')
        setTags(draft.tags || [])
        setHasProOverlay(draft.hasProOverlay ?? true)
        toast.info('Draft restored from your last session!', {
          duration: 3000,
        })
      } catch (e) {
        console.error('Failed to load draft:', e)
      }
    }
  }, [])

  // 2. Auto-save Draft on Changes
  useEffect(() => {
    const draft = {
      title,
      description,
      price,
      category,
      tags,
      hasProOverlay
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [title, description, price, category, tags, hasProOverlay])

  // 3. Clear Draft on Success
  useEffect(() => {
    // If there's no error and we are redirected (meaning success), we don't have a direct hook here easily
    // but handleCreateProduct will cause a redirect. 
    // We can check if state was null and now has a success message or similar
    // However, since handleCreateProduct is a server action that redirects, 
    // the easiest way is to clear it when the "Publish" button is successfully clicked if we were using a custom fetch,
    // but here we use a form action.
    // A better way: If the page reloads and title is empty (fresh start), draft is overwritten.
    // Let's clear it if the action was successful (redirect will happen)
  }, [state])

  const handleAIGenerate = async () => {
    if (!title) return toast.error('Please enter a product title first!')
    
    setIsGenerating(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('category', category)

    const result = await generateAIDescription(formData)
    
    if (result.success && result.content) {
      setDescription(result.content)
      toast.success('Description generated successfully!')
    } else {
      toast.error(result.error || 'Failed to generate content')
    }
    setIsGenerating(false)
  }

  const handlePricingSuggest = async () => {
    if (!title) return toast.error('Enter a title to get price suggestions!')
    
    setIsPricingGenerating(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('category', category)

    const result = await getAIPricingSuggestion(formData)
    
    if (result.success) {
      setPrice(result.suggested.toString())
      toast.success(`AI Recommendation: $${result.suggested}`, {
        description: `${result.reasoning} Typical range: ${result.range}`,
        duration: 5000,
      })
    } else {
      toast.error(result.error || 'Pricing analysis failed')
    }
    setIsPricingGenerating(false)
  }

  const handleTagsSuggest = async () => {
    if (!title || !description) return toast.error('Title and Description are needed for tag suggestions!')
    
    setIsTagsGenerating(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('category', category)

    const result = await getSmartTags(formData)
    
    if (result.success && result.tags) {
      const newTags = Array.from(new Set([...tags, ...result.tags]))
      setTags(newTags)
      toast.success(`Generated ${result.tags.length} SEO tags!`)
    } else {
      toast.error(result.error || 'Tag generation failed')
    }
    setIsTagsGenerating(false)
  }

  const addTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return
    if (e) e.preventDefault()
    
    const val = tagInput.trim()
    if (val && !tags.includes(val)) {
      setTags([...tags, val])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleThumbnailSelect = (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file)
      setThumbnailPreview(url)
    } else {
      setThumbnailPreview(null)
    }
  }

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
  }

  // Mock product for preview
  const previewProduct = {
    id: 'preview',
    title: title || 'Product Title Placeholder',
    description: description || 'Your product description will appear here...',
    price: parseFloat(price) || 0,
    category: category,
    thumbnail_url: thumbnailPreview,
    has_pro_overlay: hasProOverlay,
    created_at: new Date().toISOString(),
    user_id: 'preview_user',
    status: 'published' as const
  }

  return (
    <div className="flex bg-muted/5 min-h-[calc(100vh-64px)]">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        <HeroAnimations>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
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
                    <PlusCircle className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl font-black tracking-tight">Create New Product</h1>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/10 rounded-2xl">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <p className="text-xs font-bold text-primary tracking-tight uppercase">AI-Powered Creator Studio</p>
              </div>
            </div>

            <form 
              action={formAction} 
              onSubmit={handleClearDraft}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Product Details (xl:span 8) */}
                <div className="xl:col-span-8 space-y-8">
                  <div className="animate-btns opacity-0 p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-10">
                    <div className="flex items-center gap-2 pb-4 border-b border-border/50">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <h2 className="text-lg font-bold">Product Details</h2>
                    </div>

                    <div className="space-y-8">
                      {/* 1. Category Selection Grid */}
                      <div className="space-y-4">
                        <label className="text-sm font-bold text-muted-foreground ml-1 flex items-center gap-2 uppercase tracking-widest">
                          <Tag className="h-3.5 w-3.5" />
                          Select Category
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                          {CATEGORY_OPTIONS.map((opt) => {
                            const Icon = opt.icon
                            const isSelected = category === opt.id
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setCategory(opt.id)}
                                className={cn(
                                  "relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-3 group/cat overflow-hidden",
                                  isSelected 
                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                    : "border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border"
                                )}
                              >
                                <div className={cn(
                                  "h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover/cat:scale-110",
                                  isSelected ? opt.bg : "bg-card"
                                )}>
                                  <Icon className={cn("h-5 w-5", isSelected ? opt.color : "text-muted-foreground")} />
                                </div>
                                <div className="text-center space-y-0.5">
                                  <p className={cn("text-xs font-black", isSelected ? "text-foreground" : "text-muted-foreground")}>{opt.label}</p>
                                  <p className="text-[8px] font-bold text-muted-foreground/60 leading-none">{opt.desc}</p>
                                </div>
                                {isSelected && (
                                  <motion.div 
                                    layoutId="active-cat"
                                    className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                              </button>
                            )
                          })}
                        </div>
                        {/* Hidden Input for Form Submission */}
                        <input type="hidden" name="category" value={category} />
                      </div>

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
                          <div className="flex items-center justify-between ml-1">
                            <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                              <DollarSign className="h-3.5 w-3.5" />
                              PRICE (USD)
                            </label>
                            <Button 
                              type="button"
                              size="sm"
                              onClick={handlePricingSuggest}
                              disabled={isPricingGenerating || !title}
                              className="h-7 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 gap-1.5 text-[9px] font-black uppercase tracking-wider"
                            >
                              {isPricingGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
                              Magic Price
                            </Button>
                          </div>
                          <div className="relative group/price">
                            <Input 
                              id="price"
                              name="price" 
                              type="number" 
                              step="0.01" 
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              placeholder="29.00" 
                              required 
                              className="h-14 rounded-2xl bg-muted/20 border-border/50 focus:bg-background transition-all text-base font-bold px-6 pr-12"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                              <Coins className="h-5 w-5 text-muted-foreground/30 group-focus-within/price:text-primary transition-colors" />
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:block" /> {/* Spacer */}
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
                            Magic AI Generate
                          </Button>
                        </div>
                        <Textarea 
                          id="description"
                          name="description" 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Tell us about your masterpiece..." 
                          required 
                          rows={10}
                          className="rounded-[2rem] bg-muted/20 border-border/50 focus:bg-background transition-all p-6 text-sm leading-relaxed font-medium resize-none min-h-[300px]"
                        />
                      </div>

                      {/* 2. SEO Smart Tags */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-sm font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                            <Hash className="h-3.5 w-3.5" />
                            SEO Smart Tags
                          </label>
                          <Button 
                            type="button"
                            size="sm"
                            onClick={handleTagsSuggest}
                            disabled={isTagsGenerating || !title || !description}
                            className="h-8 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20 gap-2 text-[10px] font-black uppercase tracking-wider"
                          >
                            {isTagsGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            Magic Suggest Tags
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="relative group/tags">
                            <Input 
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={addTag}
                              placeholder="Add a tag and press Enter..." 
                              className="h-12 rounded-xl bg-muted/20 border-border/50 focus:bg-background transition-all text-sm font-medium px-5"
                            />
                            <button 
                              type="button"
                              onClick={() => addTag()}
                              title="Add tag"
                              aria-label="Add tag"
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                            >
                              <PlusCircle className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <AnimatePresence mode="popLayout">
                              {tags.map((tag) => (
                                <motion.div
                                  key={tag}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs font-bold group/tag"
                                >
                                  {tag}
                                  <button 
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    title={`Remove ${tag}`}
                                    aria-label={`Remove ${tag}`}
                                    className="hover:text-destructive transition-colors"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            {tags.length === 0 && (
                              <p className="text-[10px] text-muted-foreground italic ml-1">No tags added yet. Try Magic Suggest!</p>
                            )}
                          </div>
                        </div>
                        {/* Hidden input for form submission */}
                        <input type="hidden" name="tags" value={tags.join(',')} />
                      </div>
                    </div>
                  </div>

                  {state?.error && (
                    <div className="bg-destructive/10 text-destructive flex items-center gap-2 p-4 rounded-2xl text-sm font-bold border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="h-5 w-5" />
                      {state.error}
                    </div>
                  )}

                  {/* Media Uploads Card */}
                  <div className="animate-btns opacity-0 p-8 rounded-[2.5rem] bg-card border border-border/50 shadow-sm space-y-8">
                    <div className="flex items-center justify-between pb-4 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-bold">Assets</h2>
                      </div>
                      
                      {/* Pro Overlay Toggle */}
                      <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-2xl border border-border/50 group/pro cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/20" onClick={() => setHasProOverlay(!hasProOverlay)}>
                        <div className={cn(
                          "h-5 w-5 rounded-md flex items-center justify-center transition-all duration-500",
                          hasProOverlay ? "bg-primary text-white rotate-[360deg]" : "bg-muted text-muted-foreground/40"
                        )}>
                          <Sparkles className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col -space-y-0.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Pro Overlay</span>
                          <span className="text-[7px] font-bold text-muted-foreground">{hasProOverlay ? 'ENABLED' : 'DISABLED'}</span>
                        </div>
                        <input type="hidden" name="has_pro_overlay" value={hasProOverlay.toString()} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Thumbnail Image</p>
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-500" />
                          <FileUpload 
                            name="thumbnail" 
                            accept="image/*" 
                            onFileSelect={handleThumbnailSelect}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Digital File (.zip)</p>
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-500" />
                          <FileUpload name="asset" accept=".zip,.pdf,.rar,.7z" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Preview & Submit (xl:span 4) */}
                <div className="xl:col-span-4 space-y-8 xl:sticky xl:top-24">
                  {/* Real-time Preview */}
                  <div className="animate-desc opacity-0 space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Live Preview</h3>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase">Real-time</span>
                    </div>
                    
                    <div className="p-1 rounded-[2.2rem] bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20 shadow-2xl">
                      <div className="scale-95 origin-top transition-transform duration-500">
                        <ProductCard product={previewProduct as any} />
                      </div>
                    </div>
                  </div>

                  {/* Submission Card */}
                  <div className="animate-desc opacity-0 p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/30 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 -mr-6 -mt-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                      <UploadCloud className="h-32 w-32" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <h3 className="text-xl font-bold leading-tight">Ready to publish?</h3>
                      <p className="text-sm text-primary-foreground/80 font-medium">Your asset will be instantly available in the marketplace after a quick check.</p>
                      
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          SECURE ASSET STORAGE
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          INSTANT LISTING
                        </div>
                      </div>

                      <SubmitButton 
                        className="w-full h-16 rounded-2xl bg-white text-primary hover:bg-white/90 text-lg font-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]" 
                        pendingText="Uploading..."
                      >
                        Publish Asset
                      </SubmitButton>
                    </div>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </HeroAnimations>
      </main>
    </div>
  )
}

