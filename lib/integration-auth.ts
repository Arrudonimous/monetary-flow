import { createHash } from "crypto";
import { prisma } from "@/lib/db";

function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Valida o header `Authorization: Bearer <API_KEY>` de uma requisição da
 * API de integração (consumida pela sessão do Claude Code no vault, não
 * pela sessão de usuário do site). Retorna a chave válida ou null.
 */
export async function autenticarApiKey(
  request: Request,
): Promise<{ id: string } | null> {
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) return null;

  const keyHash = hashApiKey(token);
  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });

  if (!apiKey || apiKey.revokedAt) return null;

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return { id: apiKey.id };
}

export { hashApiKey };
