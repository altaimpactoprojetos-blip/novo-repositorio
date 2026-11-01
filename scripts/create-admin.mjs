#!/usr/bin/env node
/**
 * Cria (ou promove) a primeira administradora do painel.
 *
 * Uso:
 *   npm run create-admin -- email@exemplo.com "SenhaForte123" "Pastora Elaine Aguiar"
 *
 * Requer NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local
 */
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const [email, password, name = "Administradora"] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !password) {
  console.error('Uso: npm run create-admin -- email@exemplo.com "SenhaForte123" "Seu Nome"');
  process.exit(1);
}
if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local");
  process.exit(1);
}
if (password.length < 8) {
  console.error("A senha deve ter pelo menos 8 caracteres.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let userId;
const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
if (error) {
  if (!/already|registered|exists/i.test(error.message)) {
    console.error("Erro ao criar usuário:", error.message);
    process.exit(1);
  }
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) {
    console.error("Usuário já existe, mas não foi encontrado.");
    process.exit(1);
  }
  userId = existing.id;
  await supabase.auth.admin.updateUserById(userId, { password });
  console.log("Usuário já existia — senha atualizada.");
} else {
  userId = data.user.id;
}

const { error: e2 } = await supabase
  .from("mcv_admin_users")
  .upsert({ user_id: userId, email: email.toLowerCase(), name, role: "admin" }, { onConflict: "user_id" });
if (e2) {
  console.error("Erro ao conceder acesso:", e2.message, "\nVocê já executou a migração SQL (supabase/migrations)?");
  process.exit(1);
}
console.log(`✔ Administradora pronta: ${email}\n  Acesse /admin/login para entrar.`);
