-- Reescribe las URLs de imágenes guardadas con el dominio público de
-- pruebas de R2 (pub-xxxx.r2.dev, con rate limit y no apto para
-- producción) al dominio propio ya conectado al bucket
-- (img.mitiendasmartxiaomi.com). Los objetos en R2 no se mueven, solo
-- cambia el dominio en la URL guardada.
UPDATE "product_images"
SET "image_url" = REPLACE(
  "image_url",
  'https://pub-110a9f9a301a42f6ae2e7fe3faf9084d.r2.dev',
  'https://img.mitiendasmartxiaomi.com'
)
WHERE "image_url" LIKE 'https://pub-110a9f9a301a42f6ae2e7fe3faf9084d.r2.dev%';
--> statement-breakpoint
UPDATE "companies"
SET "hero_banner_url" = REPLACE(
  "hero_banner_url",
  'https://pub-110a9f9a301a42f6ae2e7fe3faf9084d.r2.dev',
  'https://img.mitiendasmartxiaomi.com'
)
WHERE "hero_banner_url" LIKE 'https://pub-110a9f9a301a42f6ae2e7fe3faf9084d.r2.dev%';
