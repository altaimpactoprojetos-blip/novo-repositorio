# Manual de configuração e publicação — Mulheres com Visão

Site institucional do movimento **Mulheres com Visão**, idealizado pela **Pastora Elaine Aguiar**, com painel administrativo completo em `/admin`.

---

## 1. Visão geral

| Camada | Tecnologia |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, componentes no padrão shadcn/ui, Framer Motion |
| Backend | Server Actions do Next.js |
| Banco de dados | PostgreSQL no Supabase (projeto **CC Visão Profética**) |
| Arquivos | Supabase Storage — bucket `mulheres-com-visao` |
| Autenticação | Supabase Auth (e-mail e senha) + tabela de permissões `mcv_admin_users` |

### Identidade visual

As cores foram extraídas da logo oficial:

| Cor | Hex | Uso |
| --- | --- | --- |
| Vinho (logo) | `#4C0F28` | Cor principal, botões, títulos |
| Vinho banner | `#5A1833` | Fundos e degradês |
| Lavanda-gelo (logo) | `#D6DCF0` | Logo e textos sobre fundo escuro |
| Malva | `#7A4563` | Detalhes e rótulos |
| Rosé / blush | `#F5E6E8` / `#E3BCC4` | Seções suaves |
| Off-white | `#FBF8F5` | Fundo do site |
| Dourado champagne | `#C9A978` | Linhas e detalhes finos |

Tipografia: **Cormorant Garamond** (títulos) + **Montserrat** (textos).
A logo foi vetorizada (`public/brand/*.svg`) para ficar nítida em qualquer tamanho.

---

## 2. Banco de dados (já configurado)

O banco **já foi criado** no projeto Supabase **CC Visão Profética**.

Para conviver com o sistema da igreja no mesmo projeto **sem nenhum conflito**, todas as tabelas do site usam o prefixo `mcv_`:

| Tabela | Conteúdo |
| --- | --- |
| `mcv_admin_users` | Quem pode entrar no painel e com qual permissão |
| `mcv_site_content` | Textos e imagens institucionais (início, sobre, contato, SEO) |
| `mcv_events` | Eventos |
| `mcv_albums` / `mcv_photos` | Álbuns e fotografias da galeria |
| `mcv_posts` | Testemunhos, histórias, mensagens de fé, reflexões e vídeos |
| `mcv_team_members` | Equipe |
| `mcv_contact_messages` | Mensagens do formulário de contato |

As funções internas de permissão ficam no schema privado `mcv_private` (não exposto pela API). O verificador de segurança do Supabase não aponta nenhum alerta.

### Segurança (RLS)

- **Visitantes**: só leem o que está **publicado**; só podem **enviar** o formulário de contato.
- **Usuário logado sem permissão**: não consegue alterar nada.
- **Editora**: gerencia eventos, galeria, mensagens, conteúdo, equipe e contatos.
- **Administradora**: tudo isso + gerenciar usuários do painel.
- **Uploads**: apenas pessoas do painel enviam/removem arquivos, e somente no bucket `mulheres-com-visao` (o bucket da igreja não é afetado).

O arquivo `supabase/migrations/20261101000000_init.sql` contém toda a estrutura. Ele pode ser executado de novo sem causar problemas, ou usado para montar o site em outro projeto Supabase.

---

## 3. Criar o primeiro acesso ao painel

Escolha **uma** das opções.

### Opção A — Pelo painel do Supabase (sem programar)

1. Acesse <https://supabase.com/dashboard> → projeto **CC Visão Profética**.
2. Vá em **Authentication → Users → Add user → Create new user**.
3. Informe o e-mail e a senha da Pastora Elaine e marque **Auto Confirm User**.
4. Vá em **SQL Editor** e execute (troque o e-mail):

```sql
insert into public.mcv_admin_users (user_id, email, name, role)
select id, email, 'Pastora Elaine Aguiar', 'admin'
from auth.users
where email = 'EMAIL-DA-PASTORA@exemplo.com';
```

5. Pronto! Entre em `https://SEU-SITE/admin`.

### Opção B — Pelo terminal

Com o `SUPABASE_SERVICE_ROLE_KEY` preenchido no `.env.local`:

```bash
npm run create-admin -- email@exemplo.com "SenhaForte123" "Pastora Elaine Aguiar"
```

Depois do primeiro acesso, as demais pessoas são criadas pelo próprio painel em **Usuários e acesso** (isso exige a variável `SUPABASE_SERVICE_ROLE_KEY` configurada na hospedagem).

---

## 4. Variáveis de ambiente

Copie `.env.example` para `.env.local` (desenvolvimento) e configure as mesmas variáveis na hospedagem:

| Variável | Onde encontrar | Pública? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API Keys → *publishable* | Sim (protegida pelo RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → *secret / service_role* | **NÃO — só no servidor** |
| `NEXT_PUBLIC_SITE_URL` | O endereço final do site | Sim |

> A chave secreta nunca é enviada ao navegador: ela só é lida em código de servidor (`src/lib/supabase/admin.ts`, marcado com `server-only`). O `.env.local` está no `.gitignore`.

---

## 5. Rodar no computador

Requisitos: Node.js 20 ou superior.

```bash
npm install
```

```bash
npm run dev
```

Abra <http://localhost:3000>. O painel fica em <http://localhost:3000/admin>.

Outros comandos:

```bash
npm run build
```

```bash
npm run typecheck
```

```bash
npm run format
```

---

## 6. Publicar na internet (Vercel — recomendado)

1. Crie uma conta em <https://vercel.com> usando o GitHub.
2. **Add New → Project** → importe este repositório.
3. Em **Environment Variables**, cadastre as 4 variáveis da seção 4 (com `NEXT_PUBLIC_SITE_URL` = domínio final).
4. Clique em **Deploy**.
5. Para usar um domínio próprio (ex.: `mulherescomvisao.com.br`): **Settings → Domains**, adicione o domínio e siga as instruções de DNS.
6. No Supabase → **Authentication → URL Configuration**, coloque o domínio final em **Site URL**.

Também funciona em qualquer hospedagem compatível com Next.js (Netlify, Railway, Render, servidor próprio com `npm run build && npm start`).

---

## 7. Usando o painel (`/admin`)

| Menu | O que faz |
| --- | --- |
| **Dashboard** | Total de eventos, próximos, realizados, fotos publicadas, contatos não lidos e últimas publicações |
| **Eventos** | Cadastrar, editar, excluir, enviar banner, alterar data/horário, programação, link de inscrição, mensagem do WhatsApp, publicar/despublicar e marcar como realizado |
| **Galeria de fotos** | Criar álbuns (ligados ou não a um evento), enviar várias fotos de uma vez (arrastando), editar legendas, definir capa (estrela), reordenar (arrastar ou setas), excluir uma ou várias |
| **Mensagens e testemunhos** | Testemunhos, histórias de transformação, mensagens de fé, reflexões e vídeos (YouTube/Vimeo). Testemunhos e histórias aparecem no carrossel da página inicial; “Destaque” coloca na frente |
| **Conteúdo do site** | Todos os textos e imagens da página inicial, Sobre nós (história, missão, visão, valores, propósito, idealizadora), contato, redes sociais, SEO e rodapé |
| **Equipe** | Fotos, nomes e funções exibidos em Sobre nós |
| **Contatos recebidos** | Mensagens do formulário, com marcação de lida e atalho para responder por e-mail/WhatsApp |
| **Usuários e acesso** | Criar acessos (editora/administradora), remover, trocar a própria senha |

Dicas:

- **Status dos eventos é automático**: antes do início = “Próximo”; durante = “Acontecendo agora”; depois do término = “Realizado”. A chave “Realizado” força o status manualmente.
- **Fotos em qualidade original**: o painel envia o arquivo original (até 25 MB). O site gera automaticamente versões otimizadas (WebP/AVIF) para cada tela, sem cortar a proporção na galeria.
- **Alterações aparecem na hora** após salvar.
- **Primeiros passos sugeridos**: em *Conteúdo do site → Contato e redes sociais*, preencha **Instagram** e **WhatsApp** — isso ativa o botão do Instagram na página inicial, o botão flutuante de WhatsApp e os botões de contato dos eventos.

---

## 8. Estrutura do projeto

```
src/
  app/
    (site)/            páginas públicas: início, sobre, eventos, galeria, mensagens, contato
    admin/login/       tela de login
    admin/(panel)/     painel protegido (dashboard, eventos, galeria, ...)
    sitemap.ts, robots.ts, icon.png
  actions/             Server Actions (salvar, excluir, publicar...) com validação Zod
  components/
    ui/                componentes base (padrão shadcn/ui)
    site/, home/       componentes do site público
    admin/             componentes do painel
  lib/                 Supabase, consultas, textos padrão, utilitários
  proxy.ts             protege todas as rotas /admin
supabase/
  migrations/          estrutura do banco + RLS + storage
  seed.sql             dado de exemplo opcional
scripts/create-admin.mjs
public/brand/          logo vetorizada e banner original
```

---

## 9. SEO e acessibilidade

- Títulos e descrições por página, Open Graph (prévia no WhatsApp/redes), `sitemap.xml`, `robots.txt`, dados estruturados de evento (Google) e URLs amigáveis.
- O painel `/admin` não é indexado pelo Google.
- Navegação por teclado, link “pular para o conteúdo”, textos alternativos, contraste adequado e respeito à preferência de “reduzir movimento”.

---

## 10. Problemas comuns

| Sintoma | Solução |
| --- | --- |
| Login diz “sem permissão” | O usuário existe no Auth mas não está em `mcv_admin_users` — rode o SQL da seção 3 |
| “Configure SUPABASE_SERVICE_ROLE_KEY” ao criar usuário | Adicione a chave secreta nas variáveis da hospedagem e faça novo deploy |
| Imagem não aparece | Confirme que `NEXT_PUBLIC_SUPABASE_URL` está correta na hospedagem |
| Botão do Instagram/WhatsApp não aparece | Preencha em *Conteúdo do site → Contato e redes sociais* |
| Texto ficou estranho | Em cada campo há o link “restaurar texto padrão” |
