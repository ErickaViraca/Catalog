-- La columna is_primary quedaba redundante con "order" (que ya define el
-- orden del carrusel) y con riesgo de desincronizarse de cuál fila
-- realmente tenía el order más bajo. Desde ahora "la" imagen de un
-- producto es simplemente la de menor order.
ALTER TABLE "product_images" DROP COLUMN IF EXISTS "is_primary";
