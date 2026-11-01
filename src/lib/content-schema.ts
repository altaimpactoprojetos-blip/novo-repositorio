import type { ContentKey } from "./content";

export type FieldDef =
  | { name: string; label: string; type: "text" | "textarea" | "url"; hint?: string; rows?: number; placeholder?: string }
  | { name: string; label: string; type: "image"; hint?: string; aspect?: string }
  | { name: string; label: string; type: "list"; hint?: string; itemLabel: string };

export type GroupDef = { title: string; description?: string; fields: FieldDef[] };

/** Estrutura dos formulários do painel “Conteúdo do site”. */
export const CONTENT_SCHEMA: Record<ContentKey, { label: string; groups: GroupDef[] }> = {
  home: {
    label: "Página inicial",
    groups: [
      {
        title: "Banner principal",
        description: "Primeira tela do site.",
        fields: [
          { name: "hero_eyebrow", label: "Frase pequena acima do título", type: "text" },
          { name: "hero_title", label: "Título", type: "text" },
          { name: "hero_subtitle", label: "Frase institucional", type: "textarea", rows: 3 },
          { name: "hero_cta_label", label: "Texto do botão", type: "text" },
          {
            name: "hero_image",
            label: "Foto de destaque",
            type: "image",
            hint: "Vertical (4:5) fica perfeita. Sem foto, exibimos o emblema animado.",
            aspect: "aspect-[4/5]",
          },
        ],
      },
      {
        title: "Apresentação do movimento",
        fields: [
          { name: "intro_eyebrow", label: "Rótulo", type: "text" },
          { name: "intro_title", label: "Título", type: "text" },
          { name: "intro_text", label: "Texto", type: "textarea", rows: 7, hint: "Separe parágrafos com uma linha em branco." },
          { name: "intro_image", label: "Foto", type: "image", aspect: "aspect-[4/5]" },
          { name: "quote_text", label: "Versículo / frase em destaque", type: "text" },
          { name: "quote_reference", label: "Referência", type: "text" },
          { name: "highlights", label: "Pilares do movimento", type: "list", itemLabel: "pilar" },
        ],
      },
      {
        title: "Mensagem da idealizadora",
        fields: [
          { name: "founder_eyebrow", label: "Rótulo", type: "text" },
          { name: "founder_title", label: "Título", type: "text" },
          { name: "founder_message", label: "Mensagem", type: "textarea", rows: 7 },
          { name: "founder_name", label: "Nome", type: "text" },
          { name: "founder_role", label: "Descrição", type: "text" },
          { name: "founder_photo", label: "Foto", type: "image", aspect: "aspect-[4/5]" },
        ],
      },
      {
        title: "Chamada para o Instagram",
        fields: [
          { name: "instagram_title", label: "Título", type: "text" },
          { name: "instagram_text", label: "Texto", type: "textarea", rows: 2 },
        ],
      },
    ],
  },
  about: {
    label: "Sobre nós",
    groups: [
      {
        title: "Topo da página",
        fields: [
          { name: "hero_title", label: "Título", type: "text" },
          { name: "hero_subtitle", label: "Subtítulo", type: "textarea", rows: 2 },
          { name: "hero_image", label: "Imagem de fundo (opcional)", type: "image" },
        ],
      },
      {
        title: "Nossa história",
        fields: [
          { name: "history_title", label: "Título", type: "text" },
          { name: "history_text", label: "Texto", type: "textarea", rows: 10, hint: "Separe parágrafos com uma linha em branco." },
          { name: "history_image", label: "Foto", type: "image", aspect: "aspect-[4/5]" },
        ],
      },
      {
        title: "Missão, visão, propósito e valores",
        fields: [
          { name: "mission", label: "Nossa missão", type: "textarea", rows: 3 },
          { name: "vision", label: "Nossa visão", type: "textarea", rows: 3 },
          { name: "purpose", label: "Nosso propósito", type: "textarea", rows: 3 },
          { name: "values", label: "Nossos valores", type: "list", itemLabel: "valor" },
        ],
      },
      {
        title: "Idealizadora",
        fields: [
          { name: "founder_name", label: "Nome", type: "text" },
          { name: "founder_title", label: "Título", type: "text" },
          { name: "founder_bio", label: "Biografia", type: "textarea", rows: 6 },
          { name: "founder_photo", label: "Foto", type: "image", aspect: "aspect-[4/5]" },
        ],
      },
      {
        title: "Equipe",
        description: "Os membros da equipe são gerenciados no menu “Equipe”.",
        fields: [
          { name: "team_title", label: "Título da seção", type: "text" },
          { name: "team_text", label: "Texto", type: "textarea", rows: 2 },
        ],
      },
    ],
  },
  contact: {
    label: "Contato e redes sociais",
    groups: [
      {
        title: "Página de contato",
        fields: [
          { name: "title", label: "Título", type: "text" },
          { name: "text", label: "Texto", type: "textarea", rows: 3 },
        ],
      },
      {
        title: "Canais oficiais",
        description: "Campos vazios não aparecem no site.",
        fields: [
          { name: "instagram_url", label: "Instagram (link completo)", type: "url", placeholder: "https://www.instagram.com/seuperfil" },
          {
            name: "whatsapp_number",
            label: "WhatsApp (com DDD)",
            type: "text",
            placeholder: "(11) 99999-9999",
            hint: "Ativa o botão flutuante e os botões de WhatsApp.",
          },
          { name: "whatsapp_message", label: "Mensagem automática do WhatsApp", type: "text" },
          { name: "phone", label: "Telefone para exibição", type: "text", hint: "Opcional. Se vazio, mostramos o número do WhatsApp." },
          { name: "email", label: "E-mail", type: "text" },
          { name: "youtube_url", label: "YouTube (link)", type: "url" },
          { name: "facebook_url", label: "Facebook (link)", type: "url" },
        ],
      },
      {
        title: "Localização",
        fields: [
          { name: "address", label: "Endereço", type: "text" },
          { name: "city", label: "Cidade / UF", type: "text" },
          { name: "office_hours", label: "Horário de atendimento", type: "text" },
          {
            name: "map_embed_url",
            label: "Mapa incorporado (Google Maps)",
            type: "url",
            hint: 'No Google Maps: Compartilhar → Incorporar um mapa → copie apenas o link que está dentro de src="...".',
          },
        ],
      },
    ],
  },
  settings: {
    label: "SEO e rodapé",
    groups: [
      {
        title: "Mecanismos de busca e compartilhamento",
        fields: [
          { name: "site_title", label: "Nome do site", type: "text" },
          { name: "site_description", label: "Descrição (Google e redes sociais)", type: "textarea", rows: 3, hint: "Ideal: até 160 caracteres." },
          {
            name: "og_image",
            label: "Imagem de compartilhamento",
            type: "image",
            hint: "Aparece ao compartilhar o link no WhatsApp/redes. Ideal: 1200×630 px.",
          },
        ],
      },
      {
        title: "Rodapé",
        fields: [{ name: "footer_text", label: "Frase do rodapé", type: "textarea", rows: 2 }],
      },
    ],
  },
};
