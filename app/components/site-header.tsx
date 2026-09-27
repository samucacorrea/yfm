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
        <details className="mobile-menu">
          <summary><span className="mobile-menu-icon" aria-hidden="true"><i></i><i></i><i></i></span><span>Menu</span></summary>
          <nav aria-label="Navegação mobile">
            <a href="/cartas/"><b>01</b> Cartas</a>
            <a href="/drops/"><b>02</b> Drops</a>
            <a href="/mods/"><b>03</b> Mods</a>
            <a href="/passwords/"><b>04</b> Passwords</a>
            <a href="/guias/"><b>05</b> Guias</a>
            <a href="/blog/"><b>06</b> Blog</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
