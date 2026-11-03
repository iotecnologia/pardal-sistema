// Tipagem mínima da biblioteca html2pdf.js (gera o PDF de um elemento da página).
declare module 'html2pdf.js' {
  interface Html2Pdf {
    set(opcoes: Record<string, unknown>): Html2Pdf;
    from(el: HTMLElement): Html2Pdf;
    save(): Promise<void>;
  }
  const html2pdf: () => Html2Pdf;
  export default html2pdf;
}
