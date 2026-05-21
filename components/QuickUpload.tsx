'use client'

import FileUpload from '@/components/FileUpload'

export default function QuickUpload() {
  const handleFileSelect = (file: File | null) => {
    console.log("Selected file:", file)
    // Nanti di sini kita tambahkan logika upload ke Supabase
  }

  return (
    <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
      <h3 className="font-semibold mb-4">Quick Upload</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Need to update a file or upload a quick asset? Use the dropzone below.
      </p>
      <FileUpload onFileSelect={handleFileSelect} />
    </div>
  )
}
