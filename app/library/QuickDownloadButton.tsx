'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function QuickDownloadButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      // The API route handles all auth verification + signed URL generation server-side
      const response = await fetch(`/api/download/${productId}`)

      if (response.redirected) {
        // Success: browser was redirected to the signed download URL
        window.location.href = response.url
        toast.success('Download started! Your file is downloading.')
        return
      }

      // Handle error responses
      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Download failed. Please try again.')
        return
      }

      // Fallback: open the URL
      window.location.href = response.url
      toast.success('Download started!')

    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="w-full md:w-auto h-11 px-6 rounded-full gap-2 shadow-sm"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating Link...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Asset
        </>
      )}
    </Button>
  )
}
