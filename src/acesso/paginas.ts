// Catálogo de páginas do menu e PERFIS DE USUÁRIO.
// `perfis` = quem abre a página; `edita` = quem pode criar/alterar (os demais só consultam).
// O menu segue o fluxo da fábrica: Comercial → Planejamento → Produção → Qualidade → Suprimentos → Gestão;
// tudo que é cadastro base fica no grupo Cadastros.
import type { Perfil } from '../tipos/modelos';

export interface Pagina { id: string; rota: string; nome: string; grupo: string; icone: string; perfis: Perfil[]; edita: Perfil[] }

export const PERFIS: Record<Perfil, { nome: string; descricao: string }> = {
  diretoria: { nome: 'Diretoria', descricao: 'Vê e altera tudo, inclusive custos, folha, BI e usuários' },
  comercial: { nome: 'Comercial', descricao: 'Orçamentos, clientes e faturamento; consulta produção e certificados' },
  producao: { nome: 'Produção', descricao: 'O.P, fichas do forno, insumos e manutenção; abre RNC' },
  qualidade: { nome: 'Qualidade', descricao: 'RNC, certificados, ligas e normas; consulta produção' },
  administrativo: { nome: 'Administrativo', descricao: 'Compras de insumos, manutenção, folha, colaboradores e faturamento' },
};

const T: Perfil[] = ['diretoria', 'comercial', 'producao', 'qualidade', 'administrativo'];
const D: Perfil[] = ['diretoria'];

export const PAGINAS: Pagina[] = [
  { id: 'visao', rota: '/visao', nome: 'Visão Geral', grupo: '', icone: 'inicio', perfis: T, edita: [] },
  // Comercial
  { id: 'orcamentos', rota: '/orcamentos', nome: 'Orçamentos', grupo: 'Comercial', icone: 'orcamento', perfis: ['diretoria', 'comercial'], edita: ['diretoria', 'comercial'] },
  { id: 'faturamento', rota: '/faturamento', nome: 'Faturamento', grupo: 'Comercial', icone: 'nota', perfis: ['diretoria', 'comercial', 'administrativo'], edita: ['diretoria', 'comercial', 'administrativo'] },
  // Planejamento e produção
  { id: 'ops', rota: '/ops', nome: 'Ordens de Produção', grupo: 'Planejamento (PCP)', icone: 'lista', perfis: ['diretoria', 'producao', 'comercial', 'qualidade'], edita: ['diretoria', 'producao'] },
  { id: 'fichas', rota: '/fichas', nome: 'Fichas do Forno', grupo: 'Produção', icone: 'fogo', perfis: ['diretoria', 'producao', 'qualidade'], edita: ['diretoria', 'producao'] },
  // Qualidade
  { id: 'rnc', rota: '/rnc', nome: 'Não Conformidades', grupo: 'Qualidade', icone: 'alerta', perfis: ['diretoria', 'qualidade', 'producao'], edita: ['diretoria', 'qualidade', 'producao'] },
  { id: 'certificados', rota: '/certificados', nome: 'Certificados', grupo: 'Qualidade', icone: 'escudo', perfis: ['diretoria', 'qualidade', 'comercial'], edita: ['diretoria', 'qualidade'] },
  // Suprimentos
  { id: 'insumos', rota: '/insumos', nome: 'Insumos e Estoque', grupo: 'Suprimentos', icone: 'caixa', perfis: ['diretoria', 'producao', 'administrativo'], edita: ['diretoria', 'producao', 'administrativo'] },
  { id: 'manutencao', rota: '/manutencao', nome: 'Manutenção', grupo: 'Suprimentos', icone: 'ferramenta', perfis: ['diretoria', 'administrativo', 'producao'], edita: ['diretoria', 'administrativo', 'producao'] },
  // Gestão
  { id: 'custo', rota: '/custo', nome: 'Custo Mensal', grupo: 'Gestão', icone: 'carteira', perfis: D, edita: D },
  { id: 'folha', rota: '/folha', nome: 'Folha de Pagamento', grupo: 'Gestão', icone: 'dinheiro', perfis: ['diretoria', 'administrativo'], edita: ['diretoria', 'administrativo'] },
  { id: 'indicadores', rota: '/indicadores', nome: 'Indicadores (BI)', grupo: 'Gestão', icone: 'grafico', perfis: D, edita: [] },
  // Cadastros
  { id: 'clientes', rota: '/clientes', nome: 'Clientes', grupo: 'Cadastros', icone: 'predio', perfis: ['diretoria', 'comercial', 'administrativo'], edita: ['diretoria', 'comercial'] },
  { id: 'ligas', rota: '/ligas', nome: 'Ligas e Fornos', grupo: 'Cadastros', icone: 'tubo', perfis: ['diretoria', 'qualidade', 'producao'], edita: ['diretoria', 'qualidade'] },
  { id: 'colaboradores', rota: '/colaboradores', nome: 'Colaboradores', grupo: 'Cadastros', icone: 'usuarios', perfis: ['diretoria', 'administrativo'], edita: ['diretoria', 'administrativo'] },
  // Administração
  { id: 'usuarios', rota: '/usuarios', nome: 'Usuários e Perfis', grupo: 'Administração', icone: 'chave', perfis: D, edita: D },
];

export const GRUPOS = ['', 'Comercial', 'Planejamento (PCP)', 'Produção', 'Qualidade', 'Suprimentos', 'Gestão', 'Cadastros', 'Administração'];

export const podeAbrir = (id: string, p: Perfil) => !!PAGINAS.find((x) => x.id === id)?.perfis.includes(p);
export const podeEditar = (id: string, p: Perfil) => !!PAGINAS.find((x) => x.id === id)?.edita.includes(p);
