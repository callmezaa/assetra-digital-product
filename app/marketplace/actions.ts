'use server'

import { createClient } from '@/lib/supabase/server'

export interface MarketplaceFilters {
  search?: string
  category?: string
  priceRange?: [number, number]
  sortBy?: 'newest' | 'price_asc' | 'price_desc'
  feedMode?: 'all' | 'following'
  followingIds?: string[]
}

export async function fetchMarketplaceProducts(
  filters: MarketplaceFilters, 
  page: number = 1, 
  limit: number = 12
) {
  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('products')
    .select('*, profiles(id, full_name, avatar_url, username)', { count: 'exact' })

  // Apply Filters
  if (filters.category && filters.category !== 'All') {
    query = query.eq('category', filters.category)
  }
  
  if (filters.search && filters.search.trim() !== '') {
    query = query.ilike('title', `%${filters.search}%`)
  }

  if (filters.priceRange && filters.priceRange.length === 2) {
    query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1])
  }

  if (filters.feedMode === 'following' && filters.followingIds && filters.followingIds.length > 0) {
    query = query.in('user_id', filters.followingIds)
  } else if (filters.feedMode === 'following' && (!filters.followingIds || filters.followingIds.length === 0)) {
    // If following mode but no following IDs, return empty
    return { data: [], count: 0 }
  }

  // Apply Sorting
  if (filters.sortBy === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (filters.sortBy === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else {
    // Default: newest
    query = query.order('created_at', { ascending: false })
  }

  // Apply Pagination
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching marketplace products:', error)
    return { data: [], count: 0 }
  }

  return { data, count: count || 0 }
}
