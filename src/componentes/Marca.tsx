// Marca do produto: PARDAL · Sistema de Gerenciamento Industrial.
// Ícone (quadrado) no menu, no topo e na abertura; logo completo no login e no BI.
import icone from '../assets/pardal-icone.webp';
import logoCompleto from '../assets/pardal-logo.webp';

export function Logo({ tam = 34 }: { tam?: number }) {
  return <img src={icone} width={tam} height={tam} alt="" aria-hidden="true" className="logo-svg logo-img" />;
}

export function LogoCompleto({ largura = 240 }: { largura?: number }) {
  return <img src={logoCompleto} width={largura} alt="Pardal · Sistema de Gerenciamento Industrial" className="logo-completo" />;
}

export function Marca() {
  return (
    <div className="marca">
      <Logo />
      <div><b>PARDAL</b><small>Sistema de Gerenciamento Industrial</small></div>
    </div>
  );
}
