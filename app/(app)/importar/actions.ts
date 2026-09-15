"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  confirmarImport,
  type ItemConfirmacao,
} from "@/lib/import-pipeline";

export async function confirmarImportAction(
  faturaImportId: string,
  fonte: string,
  itens: ItemConfirmacao[],
) {
  await confirmarImport(faturaImportId, fonte, itens);
  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  redirect("/lancamentos");
}
