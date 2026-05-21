/* eslint-disable */
/** @jsxImportSource react */
import * as React from 'react'

interface WelcomeEmailProps {
  fullName: string
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  fullName,
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
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' },
    text: { fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' },
    list: { paddingLeft: '20px' },
    button: {
      display: 'inline-block',
      backgroundColor: '#000',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '12px',
      textDecoration: 'none',
      fontWeight: 'bold'
    },
    hr: { border: 'none', borderTop: '1px solid #eee', margin: '40px 0' },
    footer: { fontSize: '12px', color: '#999', textAlign: 'center' as const }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Assetra, {fullName}! 🚀</h1>
        <p style={styles.text}>
          We&apos;re thrilled to have you join our community of digital creators and collectors. 
          Assetra is designed to help you monetize your digital assets with ease and style.
        </p>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={styles.sectionTitle}>What&apos;s next?</h2>
          <ul style={styles.list}>
            <li>Explore the marketplace</li>
            <li>Set up your creator profile</li>
            <li>Upload your first digital asset</li>
          </ul>
        </div>
        <a href="http://localhost:3000/dashboard" style={styles.button}>
          Go to Dashboard
        </a>
        <hr style={styles.hr} />
        <p style={styles.footer}>
          &copy; 2026 Assetra Digital Marketplace. All rights reserved.
        </p>
      </div>
    </div>
  )
}
