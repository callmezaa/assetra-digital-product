'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitReview } from '@/app/product/[id]/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string
  }
}

interface ReviewSectionProps {
  productId: string
  reviews: Review[]
  isPurchased: boolean
}

export default function ReviewSection({ productId, reviews, isPurchased }: ReviewSectionProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a star rating')
      return
    }

    setIsSubmitting(true)
    try {
      await submitReview(productId, rating, comment)
      toast.success('Thank you for your review!')
      setShowForm(false)
      setComment('')
      setRating(0)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-border/20 pb-6">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-[2rem] bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <Star className="h-8 w-8 fill-yellow-500" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              {avgRating} <span className="text-lg text-muted-foreground font-medium">/ 5.0</span>
            </h2>
            <p className="text-sm font-bold text-muted-foreground ">{reviews.length} Verified Reviews</p>
          </div>
        </div>
        
        {isPurchased && !showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            Write a Review
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/30 border border-border/20 p-6 rounded-[2.5rem] space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-3 block">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  title={`Rate ${star} stars`}
                  aria-label={`Rate ${star} stars`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    className={cn(
                      "h-8 w-8 transition-colors",
                      (hoverRating || rating) >= star 
                        ? "fill-yellow-500 text-yellow-500" 
                        : "text-muted-foreground/30"
                    )} 
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground ">Share your experience</label>
            <Textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about this product?"
              className="min-h-[120px] rounded-2xl bg-background border-border/20 resize-none focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl font-bold">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold px-8">
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 opacity-50 space-y-3">
            <MessageSquareQuote className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="font-medium">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6 rounded-[2rem] bg-card border border-border/20 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-muted relative">
                    <Image 
                      src={review.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${review.profiles?.full_name}`} 
                      alt={review.profiles?.full_name || 'Reviewer'}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold flex items-center gap-1.5">
                      {review.profiles?.full_name}
                      <span title="Verified Purchase">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground font-bold tracking-wider">
                      {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(review.created_at))}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={cn(
                        "h-4 w-4", 
                        review.rating >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/20"
                      )} 
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed text-muted-foreground font-medium pl-13">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
