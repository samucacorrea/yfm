export function MobileMenu() {
  return (
    <details className="mobile-menu">
      <summary aria-label="Menu de navegação">
        <span aria-hidden="true" className="mobile-menu-icon"><i /><i /><i /></span>
        <span>Menu</span>
      </summary>
      <nav className="mobile-menu-panel" aria-label="Navegação mobile">
        <p>Acessos populares</p>
        <div className="mobile-menu-featured">
          <a href="/passwords/"><b>Passwords</b><span>Códigos das cartas</span></a>
          <a href="/mods/"><b>Mods</b><span>Versões e downloads</span></a>
        </div>
        <div className="mobile-menu-links">
          <a href="/cartas/">Cartas</a>
          <a href="/drops/">Drops</a>
          <a href="/guias/">Guias</a>
          <a href="/blog/">Blog</a>
        </div>
      </nav>
    </details>
  );
}

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header className={`site-header${solid ? " header-solid" : ""}`}>
      <div className="nav-shell">
        <a className="brand" href="/" aria-label="Yu-Gi-Oh! Forbidden Memories — início">
          <img className="brand-logo" src="/logo.webp" alt="Yu-Gi-Oh! Forbidden Memories" width="346" height="112" decoding="async" />
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="/cartas/">Cartas</a><a href="/drops/">Drops</a><a href="/mods/">Mods</a>
          <a href="/passwords/">Passwords</a><a href="/guias/">Guias</a><a href="/blog/">Blog</a>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}
