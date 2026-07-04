function NavBar() {
  return (
    <nav className="navbar" style={{ borderBottom: 'none', paddingBottom: 0, width: '100%' }}>
      <ul style={{ 
        display: 'flex', 
        listStyle: 'none', 
        gap: '28px', 
        padding: 0, 
        margin: 0 
      }}>
        <li style={{ 
          cursor: 'pointer', 
          fontWeight: 600, 
          color: 'var(--accent)',
          fontSize: '15px',
          transition: 'color 0.2s ease'
        }}>
          Home
        </li>
        <li className="nav-item" style={{ 
          cursor: 'pointer', 
          fontWeight: 500, 
          color: 'var(--text)',
          fontSize: '15px',
          transition: 'all 0.2s ease'
        }}>
          About
        </li>
        <li className="nav-item" style={{ 
          cursor: 'pointer', 
          fontWeight: 500, 
          color: 'var(--text)',
          fontSize: '15px',
          transition: 'all 0.2s ease'
        }}>
          Contact
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;