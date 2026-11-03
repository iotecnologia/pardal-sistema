// Colaboradores — cadastro base usado pela Folha de Pagamento (e, no futuro, pela entrega de EPI e apontamentos).
import { useState } from 'react';
import type { Colaborador } from '../tipos/modelos';
import { useDados } from '../componentes/Dados';
import { BotaoIcone, BuscaLista, Campo, CampoNum, Contador, Registro, Segmentado, Tag, TituloPagina, Vazio, useEdita, useRascunho } from '../componentes/Comuns';
import { BotoesRelatorio } from '../componentes/Relatorio';
import { useAbrir } from '../componentes/useAbrir';
import { moeda, semAcento, soma } from '../util/formato';

type Filtro = 'ativos' | 'inativos' | 'todos';

export function Colaboradores() {
  const { base } = useDados();
  const edita = useEdita('colaboradores');
  const [abrir, setAbrir] = useAbrir();
  const [t, setT] = useState('');
  const [f, setF] = useState<Filtro>('ativos');
  const q = semAcento(t);
  const vis = base.colaboradores
    .filter((c) => (f === 'todos' || (f === 'ativos') === c.ativo) && (!q || semAcento(`${c.nome} ${c.cargo} ${c.setor}`).includes(q)))
    .sort((a, b) => a.setor.localeCompare(b.setor) || a.nome.localeCompare(b.nome));
  const ativos = base.colaboradores.filter((c) => c.ativo);
  const setores = new Set(ativos.map((c) => c.setor)).size;
  const sel = abrir === 'novo' ? null : base.colaboradores.find((c) => c.id === abrir);
  return (
    <>
      <TituloPagina titulo="Colaboradores" sub="Equipe, cargos, setores e salário base">
        <BotoesRelatorio titulo="Colaboradores" filtro={`${f === 'ativos' ? 'Ativos' : f === 'inativos' ? 'Inativos' : 'Todos'}${t ? ` · busca "${t}"` : ''}`}
          colunas={[{ t: 'Colaborador' }, { t: 'Cargo' }, { t: 'Setor' }, { t: 'Salário base', dir: true }, { t: 'Situação' }]}
          linhas={vis.map((c) => [c.nome, c.cargo, c.setor, moeda(c.salario), c.ativo ? 'Ativo' : 'Inativo'])}
          total={['Total', `${vis.length} colaboradores`, '', moeda(soma(vis, (c) => c.salario)), '']} />
        <BotaoIcone icone="mais" titulo={edita ? 'Novo colaborador' : 'Seu perfil só consulta'} pri disabled={!edita} onClick={() => setAbrir('novo')} />
      </TituloPagina>
      <div className="contadores c4">
        <Contador icone="usuarios" valor={ativos.length} rot="colaboradores ativos" />
        <Contador icone="predio" valor={setores} rot="setores" />
        <Contador icone="dinheiro" valor={moeda(soma(ativos, (c) => c.salario))} rot="salários base (ativos)" />
        <Contador icone="balanca" valor={moeda(ativos.length ? soma(ativos, (c) => c.salario) / ativos.length : 0)} rot="salário médio" />
      </div>
      <div className="barra">
        <BuscaLista valor={t} setValor={setT} dica="Buscar por nome, cargo ou setor" />
        <Segmentado valor={f} setValor={setF} opcoes={[{ v: 'ativos', nome: 'Ativos', n: ativos.length }, { v: 'inativos', nome: 'Inativos', n: base.colaboradores.length - ativos.length }, { v: 'todos', nome: 'Todos', n: base.colaboradores.length }]} />
      </div>
      <div className="bloco">
        {vis.length === 0 ? <Vazio>Nenhum colaborador.</Vazio> : (
          <table className="tab">
            <thead><tr><th>Colaborador</th><th>Cargo</th><th>Setor</th><th className="dir">Salário base</th><th>Situação</th></tr></thead>
            <tbody>{vis.map((c) => (
              <tr key={c.id} className="clic" onClick={() => setAbrir(c.id)}>
                <td>{c.nome}</td><td className="mut">{c.cargo}</td><td className="mut">{c.setor}</td><td className="dir mono">{moeda(c.salario)}</td>
                <td>{c.ativo ? <span className="mut peq">ativo</span> : <Tag cls="t-fim">inativo</Tag>}</td>
              </tr>))}</tbody>
          </table>
        )}
      </div>
      {(sel || abrir === 'novo') && <RegistroColaborador c={sel ?? undefined} fechar={() => setAbrir(null)} />}
    </>
  );
}

function RegistroColaborador({ c, fechar }: { c?: Colaborador; fechar: () => void }) {
  const { acoes } = useDados();
  const edita = useEdita('colaboradores');
  const novo = !c;
  const { r, mudar, editando, setEditando, erro, setErro, descartar } = useRascunho<Colaborador>(c ?? { id: acoes.novoId('col'), nome: '', cargo: '', setor: '', salario: 0, ativo: true }, novo);
  const ed = !editando;
  const salvar = () => {
    if (!r.nome.trim()) return setErro('Informe o nome do colaborador.');
    if (!r.setor.trim()) return setErro('Informe o setor.');
    acoes.salvar('colaboradores', r); setErro(''); setEditando(false); if (novo) fechar();
  };
  return (
    <Registro titulo={novo ? 'Novo colaborador' : r.nome} novo={novo} edita={edita} editando={editando} setEditando={setEditando} salvar={salvar} descartar={novo ? fechar : descartar} fechar={fechar} erro={erro}>
      <div className="form-grade">
        <Campo rot="Nome" c={2}><input value={r.nome} disabled={ed} onChange={(e) => mudar('nome', e.target.value)} /></Campo>
        <Campo rot="Cargo"><input value={r.cargo} disabled={ed} onChange={(e) => mudar('cargo', e.target.value)} /></Campo>
        <Campo rot="Setor"><input value={r.setor} disabled={ed} onChange={(e) => mudar('setor', e.target.value)} list="setores" /></Campo>
        <Campo rot="Salário base"><CampoNum valor={r.salario} mudar={(v) => mudar('salario', v ?? 0)} disabled={ed} casas={2} sufixo="R$" /></Campo>
        <Campo rot="Situação"><select value={r.ativo ? 's' : 'n'} disabled={ed} onChange={(e) => mudar('ativo', e.target.value === 's')}><option value="s">Ativo</option><option value="n">Inativo</option></select></Campo>
      </div>
      <datalist id="setores">{['Fusão', 'Moldagem', 'Acabamento', 'Produção', 'Manutenção', 'Qualidade', 'Administrativo', 'Comercial', 'Logística'].map((s) => <option key={s} value={s} />)}</datalist>
    </Registro>
  );
}
