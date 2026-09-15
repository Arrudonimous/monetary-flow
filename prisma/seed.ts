import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL/DATABASE_URL não definida.");
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// Seed inicial minerado do histórico real do vault (13+ meses de faturas
// Bradesco processadas manualmente) — ver memória "project-controle-gastos".
const REGRAS_INICIAIS: Array<{
  palavraChave: string;
  tipo: "Saida" | "Entrada";
  categoria: string;
  prioridade?: number;
}> = [
  { palavraChave: "ifood", tipo: "Saida", categoria: "Alimentação" },
  { palavraChave: "supermercado", tipo: "Saida", categoria: "Alimentação" },
  { palavraChave: "restaurante", tipo: "Saida", categoria: "Alimentação" },
  { palavraChave: "adega", tipo: "Saida", categoria: "Alimentação" },
  { palavraChave: "uber", tipo: "Saida", categoria: "Transporte" },
  { palavraChave: "99app", tipo: "Saida", categoria: "Transporte" },
  { palavraChave: "posto", tipo: "Saida", categoria: "Transporte" },
  { palavraChave: "pedagio", tipo: "Saida", categoria: "Transporte" },
  { palavraChave: "estacionamento", tipo: "Saida", categoria: "Transporte" },
  { palavraChave: "farmacia", tipo: "Saida", categoria: "Saúde" },
  { palavraChave: "granado", tipo: "Saida", categoria: "Saúde" },
  { palavraChave: "hulkbuster", tipo: "Saida", categoria: "Saúde" },
  { palavraChave: "netflix", tipo: "Saida", categoria: "Assinaturas" },
  { palavraChave: "spotify", tipo: "Saida", categoria: "Assinaturas" },
  { palavraChave: "hbo max", tipo: "Saida", categoria: "Assinaturas" },
  { palavraChave: "apple.com bill", tipo: "Saida", categoria: "Assinaturas" },
  { palavraChave: "anthropic", tipo: "Saida", categoria: "Assinaturas" },
  { palavraChave: "steam", tipo: "Saida", categoria: "Lazer" },
  { palavraChave: "xbox", tipo: "Saida", categoria: "Lazer" },
  { palavraChave: "cinemark", tipo: "Saida", categoria: "Lazer" },
  { palavraChave: "cinema", tipo: "Saida", categoria: "Lazer" },
  { palavraChave: "mercado livre", tipo: "Saida", categoria: "Compras" },
  { palavraChave: "shopee", tipo: "Saida", categoria: "Compras" },
  { palavraChave: "amazon", tipo: "Saida", categoria: "Compras" },
  { palavraChave: "iof", tipo: "Saida", categoria: "Encargos Financeiros", prioridade: 10 },
];

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;
  const apiKeyPlaintext = process.env.INTEGRATION_API_KEY_PLAINTEXT;

  if (!email || !password) {
    throw new Error("SEED_USER_EMAIL e SEED_USER_PASSWORD são obrigatórias.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`Usuário ${email} pronto.`);

  const chave = apiKeyPlaintext ?? randomBytes(32).toString("hex");
  const keyHash = createHash("sha256").update(chave).digest("hex");

  await prisma.apiKey.upsert({
    where: { keyHash },
    update: {},
    create: { label: "claude-code-vault", keyHash },
  });

  if (!apiKeyPlaintext) {
    console.log(`API key gerada (guarde em local seguro): ${chave}`);
  } else {
    console.log("API key (de INTEGRATION_API_KEY_PLAINTEXT) registrada.");
  }

  for (const regra of REGRAS_INICIAIS) {
    const existente = await prisma.categorizationRule.findFirst({
      where: { palavraChave: regra.palavraChave, tipo: regra.tipo },
    });
    if (!existente) {
      await prisma.categorizationRule.create({
        data: {
          palavraChave: regra.palavraChave,
          tipo: regra.tipo,
          categoria: regra.categoria,
          prioridade: regra.prioridade ?? 0,
        },
      });
    }
  }
  console.log(`${REGRAS_INICIAIS.length} regras de categorização verificadas.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
