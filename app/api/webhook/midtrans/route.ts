import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { resend } from '@/lib/resend'
import { ReceiptEmail } from '@/components/emails/ReceiptEmail'
import React from 'react'

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Midtrans Webhook endpoint is active' }, { status: 200 })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      order_id, 
      status_code, 
      gross_amount, 
      signature_key, 
      transaction_status,
      custom_field1, // productIds joined by comma
      custom_field2  // user.id
    } = body

    // 1. Verify Signature to ensure it's actually from Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const hashString = `${order_id}${status_code}${gross_amount}${serverKey}`
    const expectedSignature = crypto.createHash('sha512').update(hashString).digest('hex')

    if (signature_key !== expectedSignature) {
      console.error('Invalid Midtrans Signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. Process Successful Payment
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      const productIds = custom_field1 ? custom_field1.split(',') : []
      const userId = custom_field2

      if (!userId || productIds.length === 0) {
        return NextResponse.json({ error: 'Missing metadata in webhook' }, { status: 400 })
      }

      const supabase = await createClient()

      // Fetch purchased products
      const { data: products } = await supabase
        .from('products')
        .select('id, title, price, user_id')
        .in('id', productIds)

      if (!products || products.length === 0) {
        return NextResponse.json({ error: 'Products not found' }, { status: 404 })
      }

      // Check if order already exists to prevent duplicate webhook processing
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', products[0].id)
        .eq('status', 'completed')
        .single()
        
      if (existingOrder) {
         return NextResponse.json({ message: 'Order already processed' }, { status: 200 })
      }

      // Insert orders into DB
      const ordersToInsert = products.map(p => ({
        user_id: userId,
        product_id: p.id,
        amount: p.price,
        status: 'completed'
      }))

      const { error: insertError } = await supabase.from('orders').insert(ordersToInsert)
      if (insertError) {
        console.error('Order insert error:', insertError)
        return NextResponse.json({ error: 'Failed to insert order' }, { status: 500 })
      }

      // Clean up user's wishlist
      await supabase.from('wishlist').delete().eq('user_id', userId).in('product_id', productIds)

      // Get buyer info for emails and notifications
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single()
        
      const buyerName = profile?.full_name || 'Someone'
      const buyerEmail = profile?.email || ''

      // Notify sellers
      const notifs = products
        .filter(p => p.user_id !== userId) // don't notify if buying own product
        .map(p => ({
          user_id: p.user_id,
          type: 'purchase',
          title: '💰 New Sale!',
          message: `${buyerName} just purchased "${p.title}"`,
          metadata: { product_id: p.id, buyer_id: userId }
        }))
      
      if (notifs.length > 0) {
        await supabase.from('notifications').insert(notifs)
      }

      // Send Receipt Email to buyer
      if (buyerEmail) {
        const total = products.reduce((sum, p) => sum + Number(p.price), 0)
        resend.emails.send({
          from: 'Assetra <onboarding@resend.dev>',
          to: buyerEmail,
          subject: 'Your Assetra Receipt',
          react: React.createElement(ReceiptEmail, {
            customerName: buyerName,
            items: products.map(p => ({ title: p.title, price: Number(p.price) })),
            total: total
          }),
        }).catch(err => console.error('Failed to send receipt email:', err))
      }
    }

    // Return 200 OK to acknowledge receipt to Midtrans
    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 })

  } catch (error: any) {
    console.error('Midtrans webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
