'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { toggleFollow } from '@/app/seller/[username]/actions'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'

interface FollowButtonProps {
  creatorId: string
  initialIsFollowing: boolean
  isLoggedIn: boolean
}

export default function FollowButton({ creatorId, initialIsFollowing, isLoggedIn }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  const handleToggle = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to follow creators')
      return
    }

    setIsLoading(true)
    // Optimistic UI update
    setIsFollowing(!isFollowing)

    try {
      await toggleFollow(creatorId, pathname)
      toast.success(isFollowing ? 'Unfollowed creator' : 'Following creator!')
    } catch (error: any) {
      // Revert if failed
      setIsFollowing(isFollowing)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleToggle} 
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      className={`rounded-xl font-bold shadow-sm transition-all duration-300 w-full md:w-auto px-8 ${
        isFollowing 
          ? 'border-primary text-primary hover:bg-primary/5' 
          : 'shadow-primary/20 hover:scale-105 active:scale-95'
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? 'Following' : 'Follow Creator'}
    </Button>
  )
}
