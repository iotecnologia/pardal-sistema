// Custo Mensal — custos da fundição usados na montagem do orçamento:
//   custos do mês  = energia + água/esgoto + diversos + insumos (4 grupos) + manutenção + folha       [D7:E16]
//   metal bruto    = Σ carga efetiva das fichas do forno do mês                                       [G15]
//   metal limpo    = Σ peso líquido das fichas do forno do mês                                        [H15]
//   refugo (kg)    = Σ peso perdido nas RNC do mês;  refugo % = refugo ÷ metal bruto                 [G9, H9]
//   custo refugo   = custos × refugo %                                                                [I9]
//   custo por kg   = (custos + custo do refugo) ÷ metal limpo                                         [I4 = D1 ÷ H15]
// custoKgSemRefugo = custos ÷ metal limpo, sem somar o custo do refugo (para análise).
import type { BasePardal, GrupoInsumo } from '../tipos/modelos';
import { arred, soma } from '../util/formato';
import { pesosFicha } from './forno';
import { gastoGrupoMes } from './insumos';
import { noMes } from './periodo';
import { pesoRnc } from './qualidade';

export const totalFolha = (base: Pick<BasePardal, 'folha'>, mes: string) => {
  const l = base.folha.filter((f) => f.mes === mes);
  const pagamento = soma(l, (f) => f.valor), adicionais = soma(l, (f) => f.horaExtra + f.encargos + f.outros);
  return { pagamento: arred(pagamento), adicionais: arred(adicionais), total: arred(pagamento + adicionais) };
};
export const totalManutencao = (base: Pick<BasePardal, 'manutencoes'>, mes: string) =>
  arred(soma(base.manutencoes.filter((m) => noMes(m.data, mes)), (m) => m.valor));
export const totalFaturado = (base: Pick<BasePardal, 'faturamento'>, mes: string) => {
  const l = base.faturamento.filter((n) => noMes(n.data, mes));
  return { valor: arred(soma(l, (n) => n.quantidadeKg * n.precoKg)), kg: arred(soma(l, (n) => n.quantidadeKg), 1), notas: l.length };
};

export interface CustoMes {
  mes: string;
  linhas: { chave: string; nome: string; valor: number }[];
  custos: number;
  metalBruto: number; metalLimpo: number; rendimento: number; corridas: number;
  refugoKg: number; refugoPct: number; custoRefugo: number;
  custoTotal: number; custoKg: number; custoKgSemRefugo: number;
}

export function custoMes(base: BasePardal, mes: string): CustoMes {
  const fixo = base.custosFixos.find((c) => c.mes === mes) ?? { energia: 0, agua: 0, diversos: 0 };
  const g = (gr: GrupoInsumo) => gastoGrupoMes(base, gr, mes);
  const linhas = [
    { chave: 'energia', nome: 'Energia elétrica', valor: fixo.energia },
    { chave: 'agua', nome: 'Água e esgoto', valor: fixo.agua },
    { chave: 'diversos', nome: 'Custos diversos', valor: fixo.diversos },
    { chave: 'IFR', nome: 'Insumos da fusão e rebarbação', valor: g('IFR') },
    { chave: 'IMF', nome: 'Insumos da moldagem e fechamento', valor: g('IMF') },
    { chave: 'EPI', nome: 'Insumos E.P.I', valor: g('EPI') },
    { chave: 'IEL', nome: 'Insumos do escritório e limpeza', valor: g('IEL') },
    { chave: 'manutencao', nome: 'Manutenção industrial e combustível', valor: totalManutencao(base, mes) },
    { chave: 'folha', nome: 'Folha de pagamento', valor: totalFolha(base, mes).total },
  ];
  const custos = arred(soma(linhas, (l) => l.valor));
  const fichas = base.fichas.filter((f) => noMes(f.data, mes));
  const pesos = fichas.map((f) => pesosFicha(f, base));
  const metalBruto = arred(soma(pesos, (p) => p.bruto), 1), metalLimpo = arred(soma(pesos, (p) => p.liquido), 1);
  const refugoKg = arred(soma(base.rncs.filter((r) => noMes(r.data, mes)), pesoRnc), 1);
  const refugoPct = metalBruto > 0 ? refugoKg / metalBruto : 0;
  const custoRefugo = arred(custos * refugoPct);
  const custoTotal = arred(custos + custoRefugo);
  return {
    mes, linhas, custos, metalBruto, metalLimpo, rendimento: metalBruto > 0 ? metalLimpo / metalBruto : 0, corridas: fichas.length,
    refugoKg, refugoPct, custoRefugo, custoTotal,
    custoKg: metalLimpo > 0 ? arred(custoTotal / metalLimpo) : 0,
    custoKgSemRefugo: metalLimpo > 0 ? arred(custos / metalLimpo) : 0,
  };
}
