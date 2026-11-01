/**
 * Textos institucionais padrão. Tudo aqui pode ser sobrescrito pelo
 * painel administrativo (/admin/conteudo) — os valores salvos no banco
 * têm prioridade e os campos vazios voltam para estes padrões.
 */

export type Highlight = { title: string; text: string };

export const defaultContent = {
  home: {
    hero_eyebrow: "Um movimento de mulheres, fé e propósito",
    hero_title: "Mulheres com Visão",
    hero_subtitle: "Mulheres que enxergam além das circunstâncias, florescem na fé e caminham juntas rumo ao propósito que Deus sonhou para cada uma.",
    hero_image: "",
    hero_cta_label: "Conheça nossa história",
    intro_eyebrow: "O movimento",
    intro_title: "Muito mais do que um evento: um encontro que transforma",
    intro_text:
      "O Mulheres com Visão nasceu do desejo de reunir mulheres para viver momentos de fé, acolhimento e restauração. Aqui, cada história importa e cada mulher é convidada a descobrir sua identidade, reacender seus sonhos e caminhar com propósito.\n\nSão encontros, conferências e momentos de comunhão que fortalecem a nossa fé, celebram a nossa feminilidade e nos lembram de que nenhuma de nós precisa caminhar sozinha.",
    intro_image: "",
    highlights: [
      { title: "Fé", text: "Uma fé viva que sustenta, renova e nos coloca de pé em todas as estações." },
      { title: "Acolhimento", text: "Um lugar seguro para ser quem você é, com abraços sinceros e escuta atenta." },
      { title: "Transformação", text: "Histórias restauradas que inspiram outras mulheres a recomeçar." },
      { title: "Propósito", text: "Mulheres despertas para viver com visão, coragem e intencionalidade." },
    ] as Highlight[],
    quote_text: "Onde não há visão, o povo perece.",
    quote_reference: "Provérbios 29:18",
    founder_eyebrow: "Mensagem da idealizadora",
    founder_title: "Uma palavra para o seu coração",
    founder_message:
      "Querida, este movimento foi sonhado para você. Para a mulher que está recomeçando, para a que está cansada, para a que tem sonhos guardados no coração. Deus tem uma visão para a sua vida — e ela é maior do que qualquer circunstância.\n\nQue cada encontro seja um lembrete de que você é amada, escolhida e capacitada para viver o propósito dEle.",
    founder_name: "Pastora Elaine Aguiar",
    founder_role: "Idealizadora do Mulheres com Visão",
    founder_photo: "",
    instagram_title: "Acompanhe o movimento",
    instagram_text: "Bastidores, mensagens e convites para os próximos encontros — tudo em primeira mão no nosso Instagram.",
  },
  about: {
    hero_title: "Nossa história",
    hero_subtitle: "Um movimento que nasceu de um sonho e floresce na vida de muitas mulheres.",
    hero_image: "",
    history_title: "Como tudo começou",
    history_text:
      "O Mulheres com Visão nasceu no coração da Pastora Elaine Aguiar como um chamado: reunir mulheres para que fossem fortalecidas na fé, acolhidas em suas dores e despertas para o propósito de Deus.\n\nO que começou como um encontro tornou-se um movimento — feito de amizade, oração, palavra e muitas histórias de transformação. A cada edição, novas mulheres chegam e descobrem que há um lugar preparado para elas.",
    history_image: "",
    mission:
      "Promover encontros que fortaleçam a fé, restaurem a identidade e despertem o propósito na vida das mulheres, por meio do acolhimento, da Palavra e da comunhão.",
    vision:
      "Ser um movimento de referência na edificação de mulheres que vivem com visão, influenciando famílias, igrejas e a sociedade com amor, fé e excelência.",
    purpose:
      "Levar cada mulher a enxergar a si mesma como Deus a vê — amada, escolhida e cheia de propósito — e a viver essa verdade em todas as áreas da vida.",
    values: [
      { title: "Fé", text: "Cremos que Deus é o centro de tudo o que fazemos." },
      { title: "Acolhimento", text: "Recebemos cada mulher com amor, respeito e sem julgamentos." },
      { title: "Excelência", text: "Fazemos tudo com cuidado, beleza e dedicação." },
      { title: "União", text: "Caminhamos juntas, porque juntas somos mais fortes." },
      { title: "Transformação", text: "Acreditamos em recomeços e em vidas restauradas." },
    ] as Highlight[],
    founder_name: "Pastora Elaine Aguiar",
    founder_title: "Idealizadora",
    founder_bio:
      "Mulher de fé, apaixonada por pessoas e por ver vidas transformadas. A Pastora Elaine idealizou o Mulheres com Visão para criar um espaço onde mulheres pudessem ser cuidadas, fortalecidas e impulsionadas a viver o propósito de Deus.",
    founder_photo: "",
    team_title: "Quem faz acontecer",
    team_text: "Um time de mulheres que serve com alegria para que cada encontro seja inesquecível.",
  },
  contact: {
    title: "Fale com a gente",
    text: "Quer participar, servir, convidar o Mulheres com Visão para sua igreja ou simplesmente conversar? Será uma alegria ouvir você.",
    instagram_url: "",
    whatsapp_number: "",
    whatsapp_message: "Olá! Vim pelo site do Mulheres com Visão e gostaria de mais informações.",
    email: "",
    phone: "",
    address: "",
    city: "",
    map_embed_url: "",
    office_hours: "",
    youtube_url: "",
    facebook_url: "",
  },
  settings: {
    site_title: "Mulheres com Visão",
    site_description: "Mulheres com Visão é um movimento de mulheres, fé, transformação, acolhimento e propósito, idealizado pela Pastora Elaine Aguiar.",
    footer_text: "Um movimento de mulheres que enxergam além, florescem na fé e caminham juntas com propósito.",
    og_image: "",
  },
};

export type SiteContent = typeof defaultContent;
export type ContentKey = keyof SiteContent;
export const CONTENT_KEYS = Object.keys(defaultContent) as ContentKey[];

/** Mescla os dados salvos com os padrões: campos nunca salvos usam o texto padrão. */
export function mergeContent<K extends ContentKey>(key: K, saved: Record<string, unknown> | null | undefined): SiteContent[K] {
  const base = defaultContent[key] as Record<string, unknown>;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(saved ?? {})) {
    if (!(k in base)) continue;
    if (Array.isArray(base[k]) ? Array.isArray(v) : typeof v === "string") out[k] = v;
  }
  return out as SiteContent[K];
}
