CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"dollar_price_bs" numeric(10, 2) NOT NULL,
	"phones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"addresses" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
-- Semilla con los datos que hoy viven en data/company.json y en el header/footer.
-- dollar_price_bs es un valor inicial de referencia (6.96, la cotización oficial
-- de Bolivia) — actualízalo desde /admin > Configuración apenas se aplique esta
-- migración, ya que no había ningún valor previo guardado en la app.
INSERT INTO "companies" ("name", "dollar_price_bs", "phones", "addresses")
VALUES (
	'MiTiendaXiaomi',
	6.96,
	'["+591 61617000", "+591 60733873"]'::jsonb,
	'["Av. Heroinas esq. Antezana Sky Box Piso 8 Of. 28", "Av. Santa Cruz entre Beni Y Aniceto Padilla acera este", "Av. Heroinas"]'::jsonb
);
