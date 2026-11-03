// BI na TV — painel da diretoria para TV ou monitor (1920×1080, ampliado/reduzido para caber em qualquer tela).
// Passa sozinho de tela em tela (?seg=20 muda o tempo de cada uma); tabelas longas rolam sozinhas.
// Teclas: espaço pausa · ← → trocam a tela · F11 tela cheia.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDados } from '../componentes/Dados';
import { Icone } from '../componentes/Icone';
import { Logo } from '../componentes/Marca';
import { custoMes, totalFaturado } from '../regras/custo';
import { pesosFicha, rendimento, situacaoFicha } from '../regras/forno';
import { progressoOP, type StatusOP } from '../regras/producao';
import { pesoRnc } from '../regras/qualidade';
import { abaixoDoMinimo, resumoMes } from '../regras/insumos';
import { mesCurto, mesDe, nomeMesLongo, somaMes, ultimosMeses } from '../regras/periodo';
import { br, hoje } from '../util/datas';
import { local, moeda, n0, n1, pct, rkg, soma } from '../util/formato';

const TELAS = ['VISÃO EXECUTIVA', 'PRODUÇÃO', 'ENTREGAS', 'QUALIDADE', 'CUSTOS E SUPRIMENTOS'];
const COR: Record<StatusOP, string> = { aberta: '#3b82f6', em_producao: '#14b8a6', atrasada: '#ef4444', concluida: '#22c55e' };
const SERIE = '#3b82f6', SERIE2 = '#f07a1f';

const reais = (v: number) => (Math.abs(v) >= 1e6 ? `R$ ${n1(v / 1e6)} mi` : Math.abs(v) >= 1e3 ? `R$ ${n0(v / 1e3)} mil` : moeda(v));
const toneladas = (kg: number) => `${n1(kg / 1000)} t`;
const diasEntre = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);
const somaDias = (d: string, n: number) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };

export function TvBi() {
  const { base } = useDados();
  const navegar = useNavigate();
  const seg = Math.max(5, Number(new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('seg')) || 20);
  const [tela, setTela] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [claro, setClaro] = useState(() => local.ler('tv-tema-claro', false));
  const [agora, setAgora] = useState(new Date());
  const [escala, setEscala] = useState({ s: 1, x: 0, y: 0 });
  const prog = useRef<HTMLElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const inicio = useRef(Date.now());
  const pausadoEm = useRef(0);

  // 1920×1080 cabendo inteiro na tela, centralizado
  useEffect(() => {
    const ajustar = () => {
      const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      setEscala({ s, x: (window.innerWidth - 1920 * s) / 2, y: (window.innerHeight - 1080 * s) / 2 });
    };
    ajustar(); window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, []);

  const irPara = (i: number) => { setTela((i + TELAS.length) % TELAS.length); inicio.current = Date.now(); };

  // um único relógio: barra de progresso, troca de tela e rolagem das tabelas
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      if (!pausa) {
        const p = (t - inicio.current) / (seg * 1000);
        if (prog.current) prog.current.style.width = `${Math.min(100, p * 100)}%`;
        if (p >= 1) { setTela((x) => (x + 1) % TELAS.length); inicio.current = t; }
      }
      area.current?.querySelectorAll<HTMLElement & { _pausa?: number; _voltar?: boolean }>('.ws .rola').forEach((r) => {
        const max = r.scrollHeight - r.clientHeight;
        if (max <= 0) return;
        if (r._pausa === undefined) r._pausa = t + 3000;
        if (t < r._pausa) return;
        if (r._voltar) { r.scrollTop = 0; r._voltar = false; r._pausa = t + 3000; return; }
        r.scrollTop += 1;
        if (r.scrollTop >= max - 1) { r._voltar = true; r._pausa = t + 2000; }
      });
    }, 50);
    return () => clearInterval(id);
  }, [pausa, seg]);

  useEffect(() => { const id = setInterval(() => setAgora(new Date()), 1000); return () => clearInterval(id); }, []);

  const trocarPausa = () => {
    if (!pausa) pausadoEm.current = Date.now(); else inicio.current += Date.now() - pausadoEm.current;
    setPausa(!pausa);
  };
  const telaCheia = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => undefined); };
  const trocarTema = () => { setClaro(!claro); local.gravar('tv-tema-claro', !claro); };

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); trocarPausa(); }
      else if (e.key === 'ArrowRight') irPara(tela + 1);
      else if (e.key === 'ArrowLeft') irPara(tela - 1);
      else if (e.key === 'F11') { e.preventDefault(); telaCheia(); }
      else if (e.key === 'Escape' && !document.fullscreenElement) navegar('/indicadores');
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  });

  // ---------- números ----------
  const hj = hoje();
  const mesAtual = mesDe(hj), mesFechado = somaMes(mesAtual, -1);
  const meses = ultimosMeses(mesFechado, 6);
  const cm = meses.map((m) => ({ m, c: custoMes(base, m), f: totalFaturado(base, m) }));
  const u = cm[cm.length - 1], a = cm[cm.length - 2];
  const fAtual = totalFaturado(base, mesAtual);
  const ops = base.ops.map((o) => ({ o, p: progressoOP(o, base, hj) }));
  const abertas = ops.filter((x) => x.p.status !== 'concluida');
  const atrasadas = abertas.filter((x) => x.p.status === 'atrasada');
  const nomeCli = (id: string) => base.clientes.find((c) => c.id === id)?.nome ?? '—';
  const nomeLiga = (id: string) => base.ligas.find((l) => l.id === id)?.nome ?? '—';
  const nomeForno = (id: string) => (base.fornos.find((f) => f.id === id)?.nome ?? '—').split('·')[0].trim();
  const ini6 = meses[0] + '-01', fim6 = meses[5] + '-31';
  const margem = (x: (typeof cm)[number]) => (x.f.valor ? (x.f.valor - x.c.custoTotal) / x.f.valor : 0);

  const hora = agora.toLocaleTimeString('pt-BR');
  const dia = agora.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const data = `${dia.charAt(0).toUpperCase()}${dia.slice(1)} · ${agora.toLocaleDateString('pt-BR')}`;

  return (
    <div className={'app tv-app' + (claro ? ' tema-claro' : '')}>
      <div className="tv" ref={area} style={{ transform: `translate(${escala.x}px, ${escala.y}px) scale(${escala.s})` }}>
        <header className="tv-cab">
          <div className="tv-marca"><Logo tam={46} /><div><b>PARDAL</b><span>BI · DIRETORIA</span></div></div>
          <div className="tv-hk">
            <div><b>{reais(fAtual.valor)}</b><span>FATURADO · {mesCurto(mesAtual).toUpperCase()}</span></div>
            <div><b>{rkg(u.c.custoKg)}</b><span>CUSTO/KG · {mesCurto(mesFechado).toUpperCase()}</span></div>
            <div><b style={{ color: atrasadas.length ? '#ef4444' : undefined }}>{atrasadas.length}</b><span>O.P ATRASADAS</span></div>
            <div><b style={{ color: '#f59e0b' }}>{pct(u.c.refugoPct, 1)}</b><span>REFUGO · {mesCurto(mesFechado).toUpperCase()}</span></div>
          </div>
          <div className="tv-dir">
            <div className="tv-bts">
              <button type="button" onClick={() => navegar('/indicadores')} title="Voltar ao sistema (Esc)"><Icone n="inicio" /></button>
              <button type="button" onClick={telaCheia} title="Tela cheia (F11)"><Icone n="telacheia" /></button>
              <button type="button" onClick={trocarPausa} className={pausa ? 'on' : ''} title={pausa ? 'Continuar (espaço)' : 'Pausar (espaço)'}><Icone n={pausa ? 'play' : 'pausa'} /></button>
              <button type="button" onClick={trocarTema} title="Tema claro/escuro"><Icone n="tema" /></button>
            </div>
            <div className="tv-nome"><b>{TELAS[tela]}</b><div className="tv-dots">{TELAS.map((n, i) => <i key={n} title={n} className={i === tela ? 'on' : ''} onClick={() => irPara(i)} />)}</div></div>
            <div className="tv-rel"><b>{hora}</b><span>{data}</span></div>
          </div>
        </header>
        <div className="tv-prog"><i ref={prog} /></div>

        {tela === 0 && (
          <section className="ws t-kpi" key="t0">
            <div className="k4">
              <Kc cor={SERIE} rot={`FATURADO · ${nomeMesLongo(u.m).toUpperCase()}`} valor={reais(u.f.valor)} vari={varia(u.f.valor, a.f.valor)} pe={`${n0(u.f.kg)} kg faturados`} />
              <Kc cor={SERIE2} rot="CUSTO POR KG FABRICADO" valor={rkg(u.c.custoKg)} vari={varia(u.c.custoKg, a.c.custoKg, true)} pe={`custo total ${reais(u.c.custoTotal)}`} />
              <Kc cor="#22c55e" rot="MARGEM BRUTA ESTIMADA" valor={pct(margem(u), 1)} vari={varia(margem(u), margem(a), false, true)} pe="faturado − custo total do mês" />
              <Kc cor="#14b8a6" rot="METAL LIMPO PRODUZIDO" valor={toneladas(u.c.metalLimpo)} vari={varia(u.c.metalLimpo, a.c.metalLimpo)} pe={`${u.c.corridas} corridas · rendimento ${pct(u.c.rendimento, 0)}`} />
            </div>
            <div className="g2">
              <Bx titulo="FATURADO × CUSTO TOTAL · 6 MESES" leg={[['Faturado', SERIE], ['Custo total', SERIE2]]}>
                <VBarras fmt={reais} cores={[SERIE, SERIE2]} dados={cm.map((x) => ({ rot: mesCurto(x.m), v: [x.f.valor, x.c.custoTotal] }))} />
              </Bx>
              <Bx titulo="MAIORES CLIENTES · FATURADO EM 6 MESES">
                <HBarras fmt={reais} dados={base.clientes.map((c) => ({ rot: c.nome, v: soma(base.faturamento.filter((n) => n.clienteId === c.id && n.data >= ini6 && n.data <= fim6), (n) => n.quantidadeKg * n.precoKg) })).filter((x) => x.v).sort((p, q) => q.v - p.v).slice(0, 7)} />
              </Bx>
            </div>
          </section>
        )}

        {tela === 1 && (() => {
          const fichasHoje = base.fichas.filter((f) => f.data === hj);
          const fichasMes = base.fichas.filter((f) => f.data.startsWith(mesAtual));
          const liqMes = soma(fichasMes, (f) => pesosFicha(f, base).liquido), brMes = soma(fichasMes, (f) => pesosFicha(f, base).bruto);
          const dias = Array.from({ length: 14 }, (_, i) => somaDias(hj, i - 13));
          const ultimas = [...base.fichas].sort((p, q) => (q.data + q.posicao).localeCompare(p.data + p.posicao)).slice(0, 30);
          return (
            <section className="ws t-kpi" key="t1">
              <div className="k4">
                <Kc cor={SERIE2} rot="CORRIDAS HOJE" valor={String(fichasHoje.length)} pe={fichasHoje.length ? `${n0(soma(fichasHoje, (f) => pesosFicha(f, base).liquido))} kg de metal líquido` : 'nenhuma corrida lançada ainda'} />
                <Kc cor="#14b8a6" rot={`METAL LÍQUIDO · ${mesCurto(mesAtual).toUpperCase()}`} valor={toneladas(liqMes)} pe={`${fichasMes.length} corridas no mês`} />
                <Kc cor={SERIE} rot="RENDIMENTO METÁLICO DO MÊS" valor={pct(rendimento(liqMes, brMes), 1)} pe="metal líquido ÷ metal bruto" />
                <Kc cor="#ef4444" rot="CORRIDAS FORA DA ESPECIFICAÇÃO" valor={String(fichasMes.filter((f) => !situacaoFicha(f, base).quimicaOk).length)} pe="química fora da norma no mês" alerta={fichasMes.some((f) => !situacaoFicha(f, base).quimicaOk)} />
              </div>
              <div className="g2">
                <Bx titulo="METAL LÍQUIDO POR DIA · ÚLTIMOS 14 DIAS (KG)">
                  <VBarras fmt={(v) => n0(v)} cores={['#14b8a6']} dados={dias.map((d) => ({ rot: br(d).slice(0, 5), v: [soma(base.fichas.filter((f) => f.data === d), (f) => pesosFicha(f, base).liquido)] }))} />
                </Bx>
                <Bx titulo="ÚLTIMAS CORRIDAS · rolagem automática">
                  <div className="rola"><table className="tv-t">
                    <colgroup><col style={{ width: '15%' }} /><col style={{ width: '14%' }} /><col style={{ width: '12%' }} /><col style={{ width: '27%' }} /><col style={{ width: '14%' }} /><col style={{ width: '18%' }} /></colgroup>
                    <thead><tr><th>FICHA</th><th>DATA</th><th>FORNO</th><th>LIGA</th><th className="num">LÍQUIDO (KG)</th><th>QUÍMICA</th></tr></thead>
                    <tbody>{ultimas.map((f) => { const s = situacaoFicha(f, base); return (
                      <tr key={f.id}><td>{f.numero}</td><td>{br(f.data).slice(0, 5)} · {f.posicao}ª</td><td>{nomeForno(f.fornoId)}</td><td>{nomeLiga(f.ligaId)}</td><td className="num">{n0(pesosFicha(f, base).liquido)}</td><td>{s.quimicaOk ? <span className="ok-t">conforme</span> : <span className="ruim">fora: {s.foraQuimica.join(', ')}</span>}</td></tr>); })}</tbody>
                  </table></div>
                </Bx>
              </div>
            </section>
          );
        })()}

        {tela === 2 && (() => {
          const conta = (s: StatusOP) => ops.filter((x) => x.p.status === s && (s !== 'concluida' || (x.o.dataEfetiva ?? '').startsWith(mesAtual))).length;
          const grupos: [StatusOP, string][] = [['aberta', 'Aguardando produção'], ['em_producao', 'Em produção'], ['atrasada', 'Atrasadas'], ['concluida', `Entregues em ${mesCurto(mesAtual)}`]];
          const tot = soma(grupos, ([s]) => conta(s)) || 1;
          const lista = [...abertas].sort((p, q) => p.o.dataPrevista.localeCompare(q.o.dataPrevista));
          return (
            <section className="ws t-ent" key="t2">
              <Bx titulo="CARTEIRA DE O.P">
                <div className="saude">
                  <div className="stack">{grupos.map(([s]) => conta(s) ? <i key={s} style={{ background: COR[s], flexGrow: conta(s) }}>{Math.round((conta(s) / tot) * 100)}%</i> : null)}</div>
                  <div className="leg">{grupos.map(([s, nome]) => <div key={s}><i style={{ background: COR[s] }} />{nome}<b>{conta(s)}</b></div>)}</div>
                  <div className="nota">{abertas.length} O.P em aberto · {n0(soma(abertas, (x) => x.p.faltam))} peças a produzir</div>
                </div>
              </Bx>
              <Bx titulo={<>PRÓXIMAS ENTREGAS E ATRASOS · rolagem automática</>}>
                <div className="rola"><table className="tv-t alto">
                  <colgroup><col style={{ width: '10%' }} /><col style={{ width: '27%' }} /><col style={{ width: '23%' }} /><col style={{ width: '8%' }} /><col style={{ width: '8%' }} /><col style={{ width: '12%' }} /><col style={{ width: '12%' }} /></colgroup>
                  <thead><tr><th>O.P</th><th>CLIENTE</th><th>DESENHO</th><th className="num">PEÇAS</th><th className="num">BOAS</th><th>ENTREGA</th><th className="num">PRAZO</th></tr></thead>
                  <tbody>{lista.length === 0 ? <tr><td colSpan={7} className="sem">Nenhuma O.P em aberto.</td></tr> : lista.map(({ o, p }) => { const d = diasEntre(o.dataPrevista, hj); return (
                    <tr key={o.id}><td>{o.numero}</td><td>{nomeCli(o.clienteId)}</td><td>{o.desenho}</td><td className="num">{n0(o.quantidade)}</td><td className="num">{n0(p.boas)}</td><td>{br(o.dataPrevista)}</td>
                      <td className="num">{d < 0 ? <span className="dias">{-d} d atraso</span> : d === 0 ? <span className="aviso-d">hoje</span> : d <= 3 ? <span className="aviso-d">em {d} d</span> : <span className="mut">em {d} d</span>}</td></tr>); })}</tbody>
                </table></div>
              </Bx>
            </section>
          );
        })()}

        {tela === 3 && (() => {
          const rnc6 = base.rncs.filter((r) => r.data >= ini6 && r.data <= fim6);
          const motivos = [...new Set(rnc6.map((r) => r.motivo))].map((m) => ({ rot: m, v: soma(rnc6.filter((r) => r.motivo === m), pesoRnc) })).sort((p, q) => q.v - p.v).slice(0, 7);
          const rncAbertas = base.rncs.filter((r) => r.status === 'aberta').sort((p, q) => p.data.localeCompare(q.data));
          const rncMes = base.rncs.filter((r) => r.data.startsWith(mesAtual));
          const cqMes = base.certificados.filter((c) => c.data.startsWith(mesAtual)).length;
          return (
            <section className="ws t-kpi" key="t3">
              <div className="k4">
                <Kc cor="#f59e0b" rot={`REFUGO · ${nomeMesLongo(u.m).toUpperCase()}`} valor={pct(u.c.refugoPct, 2)} vari={varia(u.c.refugoPct, a.c.refugoPct, true, true)} pe={`${n0(u.c.refugoKg)} kg · ${reais(u.c.custoRefugo)} perdidos`} />
                <Kc cor="#ef4444" rot="RNC EM ABERTO" valor={String(rncAbertas.length)} pe="aguardando ação corretiva" alerta={rncAbertas.length > 0} />
                <Kc cor={SERIE2} rot={`PEÇAS REFUGADAS · ${mesCurto(mesAtual).toUpperCase()}`} valor={n0(soma(rncMes, (r) => r.quantidade))} pe={`${rncMes.length} RNC no mês`} />
                <Kc cor="#22c55e" rot={`CERTIFICADOS · ${mesCurto(mesAtual).toUpperCase()}`} valor={String(cqMes)} pe="emitidos para clientes" />
              </div>
              <div className="g3">
                <Bx titulo="REFUGO · % DO METAL BRUTO">
                  <VBarras fmt={(v) => `${n1(v)}%`} cores={['#f59e0b']} dados={cm.map((x) => ({ rot: mesCurto(x.m), v: [+(x.c.refugoPct * 100).toFixed(2)] }))} />
                </Bx>
                <Bx titulo="PESO PERDIDO POR MOTIVO · 6 MESES (KG)">
                  <HBarras fmt={(v) => n0(v)} cor="#ef4444" dados={motivos} />
                </Bx>
                <Bx titulo="RNC EM ABERTO · rolagem automática">
                  <div className="rola"><table className="tv-t">
                    <colgroup><col style={{ width: '24%' }} /><col style={{ width: '18%' }} /><col style={{ width: '58%' }} /></colgroup>
                    <thead><tr><th>RNC</th><th>DATA</th><th>CLIENTE · MOTIVO</th></tr></thead>
                    <tbody>{rncAbertas.length === 0 ? <tr><td colSpan={3} className="sem">Nenhuma RNC em aberto.</td></tr> : rncAbertas.map((r) => (
                      <tr key={r.id}><td>{r.numero}</td><td>{br(r.data).slice(0, 5)}</td><td>{nomeCli(r.clienteId)}<div className="sub">{r.motivo}</div></td></tr>))}</tbody>
                  </table></div>
                </Bx>
              </div>
            </section>
          );
        })()}

        {tela === 4 && (() => {
          const insumos = base.insumos.map((i) => ({ rot: i.nome, v: soma(meses, (m) => resumoMes(i, base.movimentos, m).gastoUtilizado) })).sort((p, q) => q.v - p.v).slice(0, 7);
          const gastoIns = soma(base.insumos, (i) => resumoMes(i, base.movimentos, u.m).gastoUtilizado);
          const baixo = abaixoDoMinimo(base).sort((p, q) => p.s / (p.i.estoqueMinimo || 1) - q.s / (q.i.estoqueMinimo || 1));
          return (
            <section className="ws t-kpi" key="t4">
              <div className="k4">
                <Kc cor={SERIE2} rot={`CUSTO TOTAL · ${nomeMesLongo(u.m).toUpperCase()}`} valor={reais(u.c.custoTotal)} vari={varia(u.c.custoTotal, a.c.custoTotal, true)} pe="todos os custos da fundição" />
                <Kc cor={SERIE} rot="CUSTO POR KG FABRICADO" valor={rkg(u.c.custoKg)} vari={varia(u.c.custoKg, a.c.custoKg, true)} pe={`sem refugo seria ${rkg(u.c.custoKgSemRefugo)}`} />
                <Kc cor="#14b8a6" rot="GASTO COM INSUMOS" valor={reais(gastoIns)} pe={`${pct(u.c.custoTotal ? gastoIns / u.c.custoTotal : 0, 0)} do custo do mês`} />
                <Kc cor="#ef4444" rot="ITENS ABAIXO DO MÍNIMO" valor={String(baixo.length)} pe={`${baixo.filter((x) => x.s <= 0).length} zerados no estoque`} alerta={baixo.length > 0} />
              </div>
              <div className="g3">
                <Bx titulo={`COMPOSIÇÃO DO CUSTO · ${mesCurto(u.m).toUpperCase()}`}>
                  <HBarras fmt={reais} cor={SERIE2} dados={u.c.linhas.map((l) => ({ rot: l.nome, v: l.valor })).filter((x) => x.v).sort((p, q) => q.v - p.v).slice(0, 7)} />
                </Bx>
                <Bx titulo="INSUMOS QUE MAIS PESAM · 6 MESES">
                  <HBarras fmt={reais} cor="#14b8a6" dados={insumos} />
                </Bx>
                <Bx titulo="ESTOQUE ABAIXO DO MÍNIMO · rolagem automática">
                  <div className="rola"><table className="tv-t">
                    <colgroup><col style={{ width: '52%' }} /><col style={{ width: '24%' }} /><col style={{ width: '24%' }} /></colgroup>
                    <thead><tr><th>INSUMO</th><th className="num">ESTOQUE</th><th className="num">MÍNIMO</th></tr></thead>
                    <tbody>{baixo.length === 0 ? <tr><td colSpan={3} className="sem">Estoque em dia.</td></tr> : baixo.map(({ i, s }) => (
                      <tr key={i.id}><td>{i.nome}</td><td className="num">{s <= 0 ? <span className="dias">zerado</span> : <span className="aviso-d">{n0(s)} {i.unidade}</span>}</td><td className="num mut">{n0(i.estoqueMinimo)} {i.unidade}</td></tr>))}</tbody>
                  </table></div>
                </Bx>
              </div>
            </section>
          );
        })()}

        <footer className="tv-rod">
          <span>{base.empresa.nome}</span>
          <span>Telas trocam a cada {seg} s{pausa ? ' · pausado' : ''}</span>
          <span className="dir2">Pardal · Sistema de Gerenciamento Industrial · v0.1 · IO Tecnologia</span>
        </footer>
      </div>
    </div>
  );
}

/** Variação contra o mês anterior: % para valores, p.p. para indicadores que já são %. */
function varia(x: number, y: number, menorMelhor = false, pp = false): ReactNode {
  if (!y) return null;
  const d = pp ? x - y : (x - y) / y;
  const melhor = menorMelhor ? d < 0 : d > 0;
  const txt = pp ? `${n1(Math.abs(d) * 100)} p.p.` : pct(Math.abs(d), 1);
  return <em className={Math.abs(d) < 0.0005 ? 'neutro' : melhor ? 'melhor' : 'pior'}>{d >= 0 ? '▲' : '▼'} {txt} <small>vs mês anterior</small></em>;
}

function Kc({ cor, rot, valor, pe, vari, alerta }: { cor: string; rot: string; valor: string; pe?: string; vari?: ReactNode; alerta?: boolean }) {
  return (
    <div className={'kc' + (alerta ? ' piscando' : '')} style={{ '--c': cor } as CSSProperties}>
      <div className="l">{rot}</div><b>{valor}</b>
      <div className="f">{vari}{vari && pe ? ' · ' : ''}{pe}</div>
    </div>
  );
}

function Bx({ titulo, leg, children }: { titulo: ReactNode; leg?: [string, string][]; children: ReactNode }) {
  return (
    <div className="bx">
      <h4>{titulo}{leg && <span className="bx-leg">{leg.map(([n, c]) => <span key={n}><i style={{ background: c }} />{n}</span>)}</span>}</h4>
      {children}
    </div>
  );
}

function HBarras({ dados, fmt, cor = SERIE }: { dados: { rot: string; v: number }[]; fmt: (v: number) => string; cor?: string }) {
  const max = Math.max(1, ...dados.map((d) => d.v));
  if (!dados.length) return <div className="sem">Sem dados no período.</div>;
  return (
    <div className="barras">
      {dados.map((d, i) => (
        <div className="br" key={d.rot}>
          <span className="bn" title={d.rot}>{d.rot}</span>
          <span className="bt"><i style={{ width: `${(d.v / max) * 100}%`, background: cor, animationDelay: `${i * 80}ms` }} /></span>
          <b>{fmt(d.v)}</b>
        </div>
      ))}
    </div>
  );
}

function VBarras({ dados, fmt, cores }: { dados: { rot: string; v: number[] }[]; fmt: (v: number) => string; cores: string[] }) {
  const max = Math.max(1, ...dados.flatMap((d) => d.v));
  return (
    <div className="vbarras">
      {dados.map((d, i) => (
        <div className="vb" key={d.rot}>
          <div className="vb-col">
            {d.v.map((v, k) => (
              <div className="vb-b" key={k}>
                <small>{v ? fmt(v) : ''}</small>
                <i style={{ height: `${(v / max) * 100}%`, background: cores[k], animationDelay: `${i * 60 + k * 30}ms` }} />
              </div>
            ))}
          </div>
          <span>{d.rot}</span>
        </div>
      ))}
    </div>
  );
}
