/* eslint-disable */
/** @jsxImportSource react */
import * as React from 'react'

interface ReceiptEmailProps {
  customerName: string
  items: { title: string; price: number }[]
  total: number
}

export const ReceiptEmail: React.FC<Readonly<ReceiptEmailProps>> = ({
  customerName,
  items,
  total
}) => {
  const styles = {
    container: {
      fontFamily: 'sans-serif',
      backgroundColor: '#f9f9f9',
      padding: '40px 20px',
      color: '#333'
    },
    card: {
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '24px',
      padding: '40px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    },
    header: { textAlign: 'center' as const, marginBottom: '30px' },
    brand: { fontSize: '28px', fontWeight: '900', margin: '0' },
    subtitle: { fontSize: '14px', color: '#666', marginTop: '5px' },
    greeting: { fontSize: '16px', marginBottom: '20px' },
    intro: { fontSize: '16px', marginBottom: '30px' },
    receiptBox: { 
      backgroundColor: '#fdfdfd', 
      borderRadius: '16px', 
      padding: '20px', 
      border: '1px solid #f0f0f0' 
    },
    receiptTitle: { 
      margin: '0 0 15px 0', 
      fontSize: '12px', 
      color: '#999', 
      textTransform: 'uppercase' as const, 
      letterSpacing: '1px' 
    },
    itemRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
    itemTitle: { flex: 1, fontWeight: 'bold' as const },
    itemPrice: { fontWeight: 'bold' as const },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '15px 0' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '900' as const },
    buttonContainer: { textAlign: 'center' as const, marginTop: '40px' },
    button: {
      display: 'inline-block',
      backgroundColor: '#000',
      color: '#fff',
      padding: '14px 30px',
      borderRadius: '14px',
      textDecoration: 'none',
      fontWeight: 'bold' as const
    },
    footer: { fontSize: '14px', color: '#666', textAlign: 'center' as const, marginTop: '40px' }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.brand}>ASSETRA</h1>
          <p style={styles.subtitle}>Purchase Confirmation</p>
        </div>

        <p style={styles.greeting}>Hi <strong>{customerName}</strong>,</p>
        <p style={styles.intro}>Thank you for your purchase! Your digital assets are now available in your library.</p>
        
        <div style={styles.receiptBox}>
          <h3 style={styles.receiptTitle}>Order Details</h3>
          {items.map((item, index) => (
            <div key={index} style={styles.itemRow}>
              <span style={styles.itemTitle}>{item.title}</span>
              <span style={styles.itemPrice}>${item.price.toFixed(2)}</span>
            </div>
          ))}
          <hr style={styles.hr} />
          <div style={styles.totalRow}>
            <span style={{ flex: 1 }}>Total Paid</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <a href="http://localhost:3000/library" style={styles.button}>
            Access Your Library
          </a>
        </div>

        <p style={styles.footer}>
          If you have any questions, just reply to this email. We&apos;re here to help!
        </p>
      </div>
    </div>
  )
}
