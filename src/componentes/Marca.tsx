// Marca do produto: PARDAL · Sistema de Gerenciamento Industrial.
// Símbolo em vetor (engrenagem + pardal); abaixo de 40 px usa a versão simplificada, que continua legível.
import simbolo from '../assets/pardal-simbolo.svg';
import simboloMini from '../assets/pardal-simbolo-mini.svg';

export function Logo({ tam = 34 }: { tam?: number }) {
  return <img src={tam <= 40 ? simboloMini : simbolo} width={tam} height={tam} alt="" aria-hidden="true" className="logo-svg logo-img" />;
}

/** Logo horizontal: símbolo + PARDAL + subtítulo (login). */
export function LogoCompleto({ tam = 64 }: { tam?: number }) {
  return (
    <div className="logo-bloco" role="img" aria-label="Pardal · Sistema de Gerenciamento Industrial">
      <Logo tam={tam} />
      <div><b>PARDAL</b><small>Sistema de Gerenciamento Industrial</small></div>
    </div>
  );
}

export function Marca() {
  return (
    <div className="marca">
      <Logo tam={40} />
      <div><b>PARDAL</b><small>Sistema de Gerenciamento Industrial</small></div>
    </div>
  );
}
