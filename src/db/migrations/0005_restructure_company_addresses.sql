-- addresses pasa de string[] a {address, mapsUrl}[] (link de Maps editable
-- por dirección, ver Configuración). Convierte cualquier dirección existente
-- guardada como string plano; si ya son objetos (re-ejecución de la
-- migración) no hace nada.
UPDATE "companies"
SET "addresses" = COALESCE(
  (
    SELECT jsonb_agg(jsonb_build_object('address', elem, 'mapsUrl', ''))
    FROM jsonb_array_elements_text("addresses") AS elem
  ),
  '[]'::jsonb
)
WHERE jsonb_typeof("addresses") = 'array'
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements("addresses") AS e WHERE jsonb_typeof(e) = 'object'
  );
