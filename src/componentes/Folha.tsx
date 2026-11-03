// Documento A4 (Orçamento, O.P, Ficha do Forno, RNC, Certificado). A mesma folha aparece na tela (prévia) e na impressão.
// Impressão: preto no branco, sem fundo colorido; negrito só no título do documento e no cabeçalho das tabelas.
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Empresa } from '../tipos/modelos';

export function Documento({ empresa, titulo, numero, children, rodape = true }: { empresa: Empresa; titulo: string; numero: string; children: ReactNode; rodape?: boolean }) {
  return (
    <div className="doc">
      <div className="doc-cab">
        <div><div className="doc-emp">{empresa.nome.toUpperCase()}</div><div>{empresa.endereco} · {empresa.cidade}</div></div>
        <div className="doc-num"><span>Documento nº</span><div>{numero}</div></div>
      </div>
      <h1 className="doc-tit">{titulo}</h1>
      <div className="doc-corpo">{children}</div>
      {rodape && <div className="doc-rod">{empresa.telefones.join(' · ')} · {empresa.emails.join(' · ')}</div>}
    </div>
  );
}

/** Pares "rótulo: valor" em grade (cabeçalho do documento). */
export function Pares({ itens, col = 3 }: { itens: [string, ReactNode][]; col?: number }) {
  return (
    <dl className={'doc-pares c' + col}>
      {itens.map(([r, v]) => <div key={r}><dt>{r}</dt><dd>{v === '' || v === undefined || v === null ? '—' : v}</dd></div>)}
    </dl>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return <section className="doc-sec"><h2>{titulo}</h2>{children}</section>;
}

export function Assinaturas({ nomes }: { nomes: [string, string][] }) {
  return <div className="doc-ass">{nomes.map(([n, r]) => <div key={r}><span />{n}<small>{r}</small></div>)}</div>;
}

/** Coloca o documento fora da aplicação só para a impressora e chama a impressão do navegador. */
export function Imprimir({ children, aoTerminar }: { children: ReactNode; aoTerminar: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => { window.print(); aoTerminar(); }, 60);
    return () => clearTimeout(t);
  }, [aoTerminar]);
  return createPortal(<div className="area-impressao">{children}</div>, document.body);
}

export type ModoSaida = 'imprimir' | 'pdf';

/** Gera o PDF (arquivo baixado) do conteúdo: monta fora da tela, converte e salva com o nome dado. */
export function GerarPdf({ children, nome, aoTerminar }: { children: ReactNode; nome: string; aoTerminar: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const { default: html2pdf } = await import('html2pdf.js');
        if (!vivo || !ref.current) return;
        await html2pdf().set({
          margin: 0, filename: nome.replace(/[\\/:*?"<>|]+/g, '-') + '.pdf',
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.doc-sec h2'] },
        }).from(ref.current).save();
      } finally { if (vivo) aoTerminar(); }
    })();
    return () => { vivo = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return createPortal(<div className="area-pdf"><div ref={ref}>{children}</div></div>, document.body);
}

/** Imprime ou gera PDF do documento, conforme o modo escolhido. */
export function Saida({ modo, nome, aoTerminar, children }: { modo: ModoSaida; nome: string; aoTerminar: () => void; children: ReactNode }) {
  return modo === 'pdf' ? <GerarPdf nome={nome} aoTerminar={aoTerminar}>{children}</GerarPdf> : <Imprimir aoTerminar={aoTerminar}>{children}</Imprimir>;
}
