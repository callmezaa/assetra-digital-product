'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { UploadCloud, File, X, Check, Loader2, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect?: (file: File | null) => void
  accept?: string
  label?: string
  name?: string
}

export default function FileUpload({ onFileSelect, accept, label = "Upload file", name }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysis, setAnalysis] = useState<{
    type: string;
    size: string;
    details: string;
  } | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const analyzeFile = (file: File) => {
    setIsAnalyzing(true)
    setProgress(0)
    
    // Simulate high-tech analysis
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    setTimeout(() => {
      setIsAnalyzing(false)
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE'
      
      let details = 'Standard Digital Asset'
      if (ext === 'ZIP') details = 'Multi-file Archive detected'
      if (ext === 'PDF') details = 'Document with high-res assets'
      if (ext === 'PNG' || ext === 'JPG' || ext === 'SVG') details = 'High-quality Visual Asset'

      setAnalysis({
        type: ext,
        size: `${sizeMB} MB`,
        details: details
      })
    }, 2500)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      analyzeFile(file)
      onFileSelect?.(file)
      
      if (inputRef.current) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        inputRef.current.files = dataTransfer.files
      }
    }
  }, [onFileSelect])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      analyzeFile(file)
      onFileSelect?.(file)
    }
  }, [onFileSelect])

  const handleRemove = () => {
    setSelectedFile(null)
    setAnalysis(null)
    setProgress(0)
    onFileSelect?.(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 ml-1">{label}</label>
      
      <input
        ref={inputRef}
        type="file"
        name={name}
        className="hidden"
        onChange={handleChange}
        accept={accept}
        title={label}
        aria-label={label}
      />

      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-44 rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer group overflow-hidden",
              dragActive ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <UploadCloud className={cn("w-12 h-12 mb-4 transition-transform duration-500 group-hover:-translate-y-1", dragActive ? 'text-primary' : 'text-muted-foreground/60')} />
            <p className="mb-1 text-sm text-foreground font-bold">
              <span className="text-primary underline underline-offset-4 decoration-primary/30 group-hover:decoration-primary">Click to upload</span> or drag
            </p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Supports ZIP, PDF, RAR (Max 10MB)</p>
          </motion.div>
        ) : (
          <motion.div
            key="analysis-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-6 rounded-3xl border border-primary/20 bg-card shadow-2xl shadow-primary/5 overflow-hidden group/card"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full transition-transform group-hover/card:scale-110" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-5">
                {/* Circular Progress / Icon */}
                <div className="relative h-16 w-16 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="30"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-muted/10"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="30"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray="188.49"
                      initial={{ strokeDashoffset: 188.49 }}
                      animate={{ strokeDashoffset: 188.49 - (188.49 * progress) / 100 }}
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isAnalyzing ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="h-6 w-6 text-emerald-500" />
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black truncate max-w-[180px]">{selectedFile.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                      {analysis?.type || '---'}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {analysis?.size || 'Scanning...'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRemove}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/5"
                type="button"
                aria-label="Remove asset"
                title="Remove asset"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analysis Result Box */}
            <AnimatePresence>
              {!isAnalyzing && analysis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 pt-4 border-t border-border/50"
                >
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
                    <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Security Analysis</p>
                      <p className="text-[11px] font-bold text-emerald-500">{analysis.details}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight">No malicious threats found. Integrity verified.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scanning Line Overlay (Only during analysis) */}
            {isAnalyzing && (
              <motion.div 
                className="absolute inset-x-0 top-0 h-1 bg-primary/40 z-20"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

