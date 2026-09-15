/**
 * Constantes puras (sem dependência de Prisma/banco), seguras para importar
 * tanto em Server quanto em Client Components.
 */

export const CATEGORIAS_SAIDA = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Contas Fixas",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Assinaturas",
  "Viagem",
  "Pesqueiro",
  "Encargos Financeiros",
  "Outros",
] as const;

export const CATEGORIAS_ENTRADA = [
  "Salário",
  "Freelance",
  "Extra",
  "Investimentos",
  "Pesqueiro",
  "Benefícios",
  "Outros",
] as const;

export const FONTES = [
  "Bradesco Crédito",
  "Bradesco Débito",
  "Pix",
  "Dinheiro",
  "VR/VA",
  "Outro",
] as const;
