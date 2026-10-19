const links = [
  { href: "/campus", label: "Mi campus" },
  { href: "#proyecto", label: "El proyecto" },
  { href: "#objetivo", label: "Objetivo" },
  { href: "#contacto", label: "Contacto" }
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="ICEX, inicio">ICEX<span>.</span></a>
        <nav aria-label="Navegación principal">
          {links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>
        <a className="top-cta" href="#proyecto">Descubrir <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> PROYECTO · INTERNACIONALIZACIÓN</p>
          <h1>ICEX<span className="period">.</span><br /><span className="title-sub">Ideas que cruzan fronteras.</span></h1>
          <p className="intro">Un proyecto para explorar cómo las empresas pueden crecer en nuevos mercados y convertir oportunidades globales en estrategias concretas.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#proyecto">Conoce el proyecto <span aria-hidden="true">↗</span></a>
            <a className="text-link" href="#objetivo">Ver objetivos <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-note"><span className="note-mark">✳</span><span>Investigación, estrategia<br />y visión internacional.</span></div>
        </div>
        <div className="hero-art" aria-label="Ilustración abstracta de conexiones globales" role="img">
          <div className="art-grid" />
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="globe"><span className="globe-longitude" /><span className="globe-latitude" /><span className="globe-core" /></div>
          <span className="art-label label-top">MADRID · 40°25′N</span>
          <span className="art-label label-bottom">PENSAR GLOBAL / ACTUAR LOCAL</span>
          <span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span>
          <div className="art-index">01 <span>—</span> 03</div>
        </div>
      </section>

      <section className="project-section" id="proyecto">
        <div className="section-heading"><p className="eyebrow">01 — EL PROYECTO</p><p className="section-aside">Una mirada práctica<br />a los mercados globales.</p></div>
        <div className="project-content"><h2>Entender el mundo<br />para <em>llegar más lejos.</em></h2><p>ICEX es el punto de partida de un proyecto centrado en la internacionalización: analizar mercados, identificar oportunidades y diseñar caminos de crecimiento para empresas con ambición global.</p></div>
      </section>

      <section className="objective-section" id="objetivo">
        <div><p className="eyebrow">02 — OBJETIVO</p><h2>De la oportunidad<br />a la acción.</h2></div>
        <p>Compartir el proceso, las ideas y los aprendizajes que ayudan a transformar una visión internacional en un plan claro y viable.</p>
        <a className="round-link" href="#contacto" aria-label="Ir a contacto">↘</a>
      </section>

      <footer id="contacto"><a className="brand" href="#inicio">ICEX<span>.</span></a><p>Un proyecto en construcción.<br />Próximamente, más novedades.</p><span className="footer-year">© 2026</span></footer>
    </main>
  );
}

