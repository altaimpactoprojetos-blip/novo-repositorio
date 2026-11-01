export type ScheduleItem = { time: string; title: string; description?: string };

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  banner_url: string | null;
  start_at: string;
  end_at: string | null;
  location_name: string | null;
  address: string | null;
  map_url: string | null;
  schedule: ScheduleItem[];
  additional_info: string | null;
  price: string | null;
  registration_url: string | null;
  whatsapp_message: string | null;
  is_published: boolean;
  is_finished: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type AlbumRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  album_date: string;
  event_id: string | null;
  cover_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type PhotoRow = {
  id: string;
  album_id: string;
  url: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  position: number;
  created_at: string;
};

export type PostType = "testemunho" | "historia" | "mensagem" | "reflexao" | "video";

export type PostRow = {
  id: string;
  slug: string;
  type: PostType;
  title: string;
  excerpt: string | null;
  content: string | null;
  author_name: string | null;
  author_role: string | null;
  image_url: string | null;
  video_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type TeamMemberRow = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
  position: number;
  is_published: boolean;
  created_at: string;
};

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type AdminUserRow = {
  user_id: string;
  email: string;
  name: string | null;
  role: "admin" | "editor";
  created_at: string;
};

export type ActionResult<T = undefined> = { ok: true; message?: string; data?: T } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const POST_TYPES: Record<PostType, { label: string; plural: string }> = {
  testemunho: { label: "Testemunho", plural: "Testemunhos" },
  historia: { label: "História de transformação", plural: "Histórias de transformação" },
  mensagem: { label: "Mensagem de fé", plural: "Mensagens de fé" },
  reflexao: { label: "Reflexão", plural: "Reflexões" },
  video: { label: "Vídeo especial", plural: "Vídeos especiais" },
};
