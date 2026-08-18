export function SiteHeader({ solid = false }: { solid?: boolean }) {
  return (
    <header className={`site-header${solid ? " header-solid" : ""}`}>
      <div className="nav-shell">
        <a className="brand" href="/" aria-label="Yu-Gi-Oh! Forbidden Memories — início">
          <img className="brand-logo" src="/logo.png" alt="Yu-Gi-Oh! Forbidden Memories" />
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="/cartas/">Cartas</a><a href="/drops/">Drops</a><a href="/mods/">Mods</a>
          <a href="/passwords/">Passwords</a><a href="/guias/">Guias</a><a href="/blog/">Blog</a>
        </nav>
      </div>
    </header>
  );
}
