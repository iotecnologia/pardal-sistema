// Relatório de lista (Imprimir / Gerar PDF): sai exatamente o que a tela mostra, com os filtros aplicados.
// Padrão de impressão: preto no branco, sem fundo colorido; negrito só no título e no cabeçalho das colunas.
import { useState } from 'react';
import { BotaoIcone } from './Comuns';
import { Saida, type ModoSaida } from './Folha';
import { useDados } from './Dados';
import { br, hoje } from '../util/datas';

export interface ColunaRel { t: string; dir?: boolean }

export function RelatorioDoc({ titulo, filtro, colunas, linhas, total }: { titulo: string; filtro?: string; colunas: ColunaRel[]; linhas: string[][]; total?: string[] }) {
  const { base } = useDados();
  const agora = new Date();
  const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
  return (
    <div className="rel-impressao rel-folha">
      <div className="ri-cab">
        <div>{base.empresa.nome} · {base.empresa.cidade.split('·')[0].trim()}</div>
        <div>Emitido em {br(hoje())} às {hora}</div>
      </div>
      <h1>{titulo}</h1>
      {filtro && <div className="ri-per">{filtro}</div>}
      <table className="ri-tab">
        <thead><tr>{colunas.map((c) => <th key={c.t} className={c.dir ? 'dir' : ''}>{c.t}</th>)}</tr></thead>
        <tbody>
          {linhas.length === 0 && <tr><td colSpan={colunas.length}>Nenhum registro.</td></tr>}
          {linhas.map((l, i) => <tr key={i}>{l.map((v, k) => <td key={k} className={colunas[k]?.dir ? 'dir' : ''}>{v}</td>)}</tr>)}
          {total && <tr className="ri-total">{total.map((v, k) => <td key={k} className={colunas[k]?.dir ? 'dir' : ''}>{v}</td>)}</tr>}
        </tbody>
      </table>
      <div className="ri-rod">{linhas.length} registro{linhas.length === 1 ? '' : 's'} · Pardal · Sistema de Gerenciamento Industrial</div>
    </div>
  );
}

/** Dois botões (só ícone): Imprimir e Gerar PDF do relatório da lista. */
export function BotoesRelatorio(props: { titulo: string; filtro?: string; colunas: ColunaRel[]; linhas: string[][]; total?: string[] }) {
  const [modo, setModo] = useState<ModoSaida | null>(null);
  return (
    <>
      <BotaoIcone icone="imprimir" titulo="Imprimir relatório" onClick={() => setModo('imprimir')} disabled={!!modo} />
      <BotaoIcone icone="pdf" titulo="Gerar PDF" onClick={() => setModo('pdf')} disabled={!!modo} />
      {modo && <Saida modo={modo} nome={`${props.titulo} ${br(hoje()).replace(/\//g, '-')}`} aoTerminar={() => setModo(null)}><RelatorioDoc {...props} /></Saida>}
    </>
  );
}
