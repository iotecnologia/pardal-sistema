// Estrutura da tela (mesmo padrão do Analiza / IO Clinic): menu lateral por grupo, topo com busca e usuário, conteúdo, rodapé.
// O menu mostra só as páginas que o perfil libera.
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Icone } from './Icone';
import { Logo, Marca } from './Marca';
import { BuscaGeral } from './BuscaGeral';
import { Avatar } from './Comuns';
import { local } from '../util/formato';
import { useSessao } from '../acesso/Sessao';
import { GRUPOS, PAGINAS, PERFIS } from '../acesso/paginas';

export function Shell() {
  const s = useSessao();
  const perfil = s.usuario!.perfil;
  const [claro, setClaro] = useState(() => local.ler('tema-claro', true));
  const loc = useLocation();
  const atual = PAGINAS.find((p) => p.rota === '/' + loc.pathname.split('/').filter(Boolean)[0]);
  const trocarTema = () => { setClaro(!claro); local.gravar('tema-claro', !claro); };
  const [menu, setMenu] = useState(false); // celular: menu lateral abre por cima
  useEffect(() => setMenu(false), [loc.pathname]);
  return (
    <div className={'app' + (claro ? ' tema-claro' : '') + (menu ? ' menu-aberto' : '')}>
      <aside className="lateral">
        <div className="lat-topo"><Marca /><button type="button" className="icone-btn lat-fechar" onClick={() => setMenu(false)} title="Fechar menu" aria-label="Fechar menu"><Icone n="x" /></button></div>
        <nav className="lat-nav" aria-label="Menu principal">
          {GRUPOS.map((g) => {
            const itens = PAGINAS.filter((p) => p.grupo === g && p.perfis.includes(perfil));
            if (!itens.length) return null;
            return (
              <div key={g || 'topo'}>
                {g && <div className="lat-sec">{g}</div>}
                {itens.map((p) => (
                  <NavLink key={p.id} to={p.rota} className={({ isActive }) => 'lat-item' + (isActive ? ' ativo' : '')} title={p.edita.includes(perfil) || !p.edita.length ? p.nome : `${p.nome} (consulta)`}>
                    <Icone n={p.icone} /><span className="nm">{p.nome}</span>{p.edita.length > 0 && !p.edita.includes(perfil) && <Icone n="olho" />}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="lat-rodape">v0.1 · IO Tecnologia</div>
      </aside>
      <header className="topo">
        <button type="button" className="icone-btn bt-menu" onClick={() => setMenu(true)} title="Menu" aria-label="Abrir menu"><Icone n="menu" /></button>
        <div className="topo-marca"><Logo tam={30} /><b>PARDAL</b></div>
        <div className="migalha">Início{atual && <> &nbsp;/&nbsp; <b>{atual.nome}</b></>}</div>
        <BuscaGeral />
        <div className="topo-dir">
          <button type="button" className="icone-btn" onClick={trocarTema} title="Tema claro/escuro" aria-label="Alternar tema claro ou escuro"><Icone n="tema" /></button>
          <div className="usuario"><Avatar nome={s.usuario!.nome} /><div><b>{s.usuario!.nome}</b><small>{PERFIS[perfil].nome} · {s.usuario!.cargo}</small></div></div>
          <button type="button" className="icone-btn" onClick={s.sair} title="Sair" aria-label="Sair"><Icone n="sair" /></button>
        </div>
      </header>
      <main className="conteudo"><Outlet /></main>
      {menu && <div className="lat-veu" onClick={() => setMenu(false)} />}
      <footer className="status"><span className="on">Mock funcional</span><span>Dados fictícios · nada é salvo ao recarregar</span><span className="dir">{s.usuario!.email} · perfil {PERFIS[perfil].nome}</span></footer>
    </div>
  );
}
