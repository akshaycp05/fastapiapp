function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ 
      marginTop: 'auto', 
      padding: '24px 0 12px', 
      borderTop: '1px solid var(--border)',
      textAlign: 'center'
    }}>
      <p style={{ 
        fontSize: '14px', 
        color: 'var(--text)', 
        margin: 0 
      }}>
        © {currentYear} TalentSpark AI. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;