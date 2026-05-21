'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getWalletData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // 1. Fetch all completed sales for user's products (with buyer and product details)
  const { data: sales } = await supabase
    .from('orders')
    .select(`
      id,
      amount,
      created_at,
      product_id,
      buyer_id:user_id,
      products!inner(id, title, user_id, image_url),
      profiles:user_id(full_name, avatar_url)
    `)
    .eq('products.user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  // 2. Fetch all payouts (withdrawals)
  const { data: payouts } = await supabase
    .from('payouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalEarnings = sales?.reduce((sum, s) => sum + Number(s.amount), 0) || 0
  const withdrawnAmount = payouts
    ?.filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0
  
  const pendingPayouts = payouts
    ?.filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const availableBalance = totalEarnings - withdrawnAmount - pendingPayouts

  // 3. Build per-product breakdown for the Donut Chart
  const productMap: Record<string, { name: string; revenue: number; salesCount: number }> = {}
  sales?.forEach((order: any) => {
    const pid = order.product_id
    const name = order.products?.title ?? 'Unknown Product'
    if (!productMap[pid]) {
      productMap[pid] = { name, revenue: 0, salesCount: 0 }
    }
    productMap[pid].revenue += Number(order.amount)
    productMap[pid].salesCount += 1
  })

  // Sort by revenue desc, keep top 5, group rest as "Other"
  const sorted = Object.values(productMap).sort((a, b) => b.revenue - a.revenue)
  let productBreakdown: { name: string; revenue: number; salesCount: number }[]
  if (sorted.length > 5) {
    const top4 = sorted.slice(0, 4)
    const others = sorted.slice(4)
    const otherRevenue = others.reduce((s, p) => s + p.revenue, 0)
    const otherSales = others.reduce((s, p) => s + p.salesCount, 0)
    productBreakdown = [...top4, { name: 'Other Products', revenue: otherRevenue, salesCount: otherSales }]
  } else {
    productBreakdown = sorted
  }

  // 4. Build cumulative Lifetime Earnings Timeline with milestone detection
  const salesChronological = [...(sales || [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const MILESTONE_THRESHOLDS = [100, 500, 1000, 5000, 10000]
  const reachedMilestones = new Set<number>()
  let runningTotal = 0
  let isFirstSale = true

  // First withdrawal date for milestone injection
  const firstWithdrawal = payouts?.find(p => p.status === 'completed')
  const firstWithdrawalDate = firstWithdrawal
    ? new Date(firstWithdrawal.created_at).toDateString()
    : null

  const earningsTimeline = salesChronological.map((order) => {
    runningTotal += Number(order.amount)

    const milestones: string[] = []

    if (isFirstSale) {
      milestones.push('🎉 First Sale!')
      isFirstSale = false
    }

    for (const threshold of MILESTONE_THRESHOLDS) {
      if (!reachedMilestones.has(threshold) && runningTotal >= threshold) {
        reachedMilestones.add(threshold)
        milestones.push(`💰 Reached $${threshold.toLocaleString()}!`)
      }
    }

    const orderDateStr = new Date(order.created_at).toDateString()
    if (firstWithdrawalDate && orderDateStr === firstWithdrawalDate) {
      milestones.push('🏦 First Withdrawal!')
    }

    return {
      date: new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      fullDate: new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      cumulative: parseFloat(runningTotal.toFixed(2)),
      milestone: milestones.length > 0 ? milestones.join(' · ') : null,
    }
  })

  // 5. Build Heatmap Data (Daily Earnings for the last 6 months)
  const heatmapMap: Record<string, number> = {}
  sales?.forEach((order: any) => {
    const date = new Date(order.created_at).toISOString().split('T')[0]
    heatmapMap[date] = (heatmapMap[date] || 0) + Number(order.amount)
  })

  // Generate the last 6 months of dates
  const heatmapData = []
  const today = new Date()
  for (let i = 180; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    heatmapData.push({
      date: dateStr,
      amount: heatmapMap[dateStr] || 0,
    })
  }

  return {
    totalEarnings,
    withdrawnAmount,
    pendingPayouts,
    availableBalance,
    payouts: payouts || [],
    productBreakdown,
    earningsTimeline,
    heatmapData,
    salesTransactions: sales || [],
  }
}

export async function requestPayout(prevState: any, formData: FormData) {
  const amount = Number(formData.get('amount'))
  const method = formData.get('method') as string
  const details = formData.get('details') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Validate balance before request
  const wallet = await getWalletData()
  if (amount > wallet.availableBalance) {
    return { error: 'Insufficient balance' }
  }

  if (amount < 10) {
    return { error: 'Minimum payout is $10' }
  }

  const { error } = await supabase
    .from('payouts')
    .insert({
      user_id: user.id,
      amount,
      payment_method: method,
      account_details: details,
      status: 'pending'
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/wallet')
  return { success: true }
}
