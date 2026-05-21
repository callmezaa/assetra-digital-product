import { fetchMarketplaceProducts } from '../../marketplace/actions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'All'
    const minPrice = Number(searchParams.get('minPrice') || '0')
    const maxPrice = Number(searchParams.get('maxPrice') || '1000')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const feedMode = searchParams.get('feedMode') || 'all'
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '12')
    
    // Convert comma-separated followingIds to string[]
    const followingIdsStr = searchParams.get('followingIds') || ''
    const followingIds = followingIdsStr ? followingIdsStr.split(',') : []

    const res = await fetchMarketplaceProducts({
      search,
      category,
      priceRange: [minPrice, maxPrice],
      sortBy: sortBy as any,
      feedMode: feedMode as any,
      followingIds
    }, page, limit)

    return NextResponse.json({ success: true, ...res })
  } catch (err: any) {
    console.error('Error in marketplace API route:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
