# Pardal · Sistema de Gerenciamento Industrial — mock funcional (apresentação)

Sistema de gestão para **fundição** (do orçamento à entrega), feito pela **IO Tecnologia**.
React + Vite + TypeScript, no mesmo padrão do Analiza e do IO Clinic. Versão **v0.1**.

Este é o **mock de apresentação**: roda só no navegador, com uma empresa genérica (**Fundição Modelo Ltda**) e
**dados fictícios** (≈ 7 meses de operação gerados a partir da data de hoje). Nada é salvo: recarregou a página, volta ao início.
Na versão final, só a camada `repositorio/` muda para buscar os dados no backend, sem refazer as telas.

## Como rodar

Requisito: Node 20 ou superior.

```bash
npm install        # instala as dependências
npm run dev        # abre em http://localhost:5173
npm test           # roda os testes das regras de negócio e da base fictícia
npm run build      # gera a versão final em dist/
```

## Publicar no GitHub Pages

1. Suba o projeto para o repositório (branch `main`).
2. No GitHub: **Settings → Pages → Source: GitHub Actions**.
3. A cada envio para `main`, o workflow `.github/workflows/deploy.yml` roda os testes, gera o build e publica.
   Se um teste falhar, nada é publicado.

## Acesso de demonstração

| Usuário | E-mail | Senha |
|---|---|---|
| Administrador (perfil Diretoria — vê e altera tudo) | `admin@pardal.exemplo` | `Admin@2026` |

Os demais perfis (Comercial, Produção, Qualidade, Administrativo) continuam definidos e aparecem na matriz de
permissões em **Administração → Usuários e Perfis**.

## Módulos (menu)

| Grupo | Telas |
|---|---|
| — | Visão Geral |
| Comercial | Orçamentos · Faturamento |
| Planejamento (PCP) | Ordens de Produção |
| Produção | Fichas do Forno |
| Qualidade | Não Conformidades (RNC) · Certificados |
| Suprimentos | Insumos e Estoque · Manutenção |
| Gestão | Custo Mensal · Folha de Pagamento · Indicadores (BI) |
| Cadastros | Clientes · Ligas e Fornos · Colaboradores |
| Administração | Usuários e Perfis |

**Imprimir e PDF:** toda lista tem os botões *Imprimir relatório* e *Gerar PDF* (sai o que está filtrado na tela,
com totais). Todo documento (Orçamento, O.P, Ficha do Forno, RNC, Certificado) imprime e gera PDF pelo registro.

**BI na TV:** em *Indicadores*, o botão TV abre o painel da diretoria (`#/tv`), feito para TV ou monitor:
5 telas em rotação (Visão executiva, Produção, Entregas, Qualidade, Custos e suprimentos), tabelas com rolagem
automática, tema claro/escuro. Tempo de cada tela: `#/tv?seg=30`. Teclas: espaço pausa, ← → trocam a tela,
F11 tela cheia, Esc volta ao sistema.

**Celular e tablet:** menu abre pelo botão no topo; tabelas rolam para o lado com a 1ª coluna fixa;
as janelas de registro abrem em tela cheia.

## Roteiro sugerido para a apresentação

1. **Login** com o administrador → tela de abertura → **Visão Geral**.
2. **Orçamentos:** criar um orçamento, digitar a margem desejada e ver o preço; aprovar → gera as O.P.
3. **Ordens de Produção:** acompanhar o andamento, atrasos e refugo; imprimir/gerar PDF da O.P.
4. **Fichas do Forno:** lançar uma corrida (carga sugerida, química conferida contra a liga, peças por O.P).
5. **Qualidade:** abrir uma RNC e emitir um certificado.
6. **Insumos e Estoque:** baixa automática pelas fichas, itens abaixo do mínimo.
7. **Custo Mensal:** custo por kg fabricado, que alimenta o orçamento do mês seguinte.
8. **Indicadores** → botão **TV**: o painel da diretoria passando sozinho.
9. Em qualquer lista: **Imprimir** e **Gerar PDF**.

## Estrutura

```
src/
├── acesso/        sessão (login), perfis e menu
├── assets/        logotipo Pardal
├── componentes/   moldura (Shell), peças comuns, documentos, relatórios (imprimir/PDF), gráficos
├── dados/         empresa, ligas, fornos, insumos, clientes, usuários (JSON)
├── estilos/       base.css (tema), telas.css, gestao.css, impressao.css, pardal.css, tv.css
├── regras/        regras de negócio, uma por módulo (testadas)
├── repositorio/   contrato de dados + gerador da base fictícia
├── telas/         uma tela por módulo (+ TvBi.tsx, o BI da TV)
├── tipos/         modelos de dados
└── util/          datas e formatação
tests/             regras e base fictícia (vitest)
```
