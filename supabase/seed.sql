-- =====================================================================
--  DADOS DE EXEMPLO (opcional)
--  Cria o evento de 30 de outubro como "realizado" para o site não
--  começar vazio. Edite ou exclua pelo painel quando quiser.
-- =====================================================================
insert into public.mcv_events (slug, title, subtitle, description, start_at, end_at, location_name, is_published, is_finished)
values (
  'mulheres-com-visao-30-de-outubro',
  'Mulheres com Visão',
  'Um encontro de fé, acolhimento e propósito.',
  'Uma noite especial preparada para mulheres que desejam enxergar a vida com os olhos da fé.

Louvor, palavra, comunhão e muitos abraços marcaram este encontro.',
  '2026-10-30 19:00:00-03',
  '2026-10-30 22:00:00-03',
  'Local a definir',
  true,
  true
)
on conflict (slug) do nothing;
