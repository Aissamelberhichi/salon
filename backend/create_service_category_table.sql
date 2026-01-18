-- Créer la table ServiceCategory manuellement
CREATE TABLE IF NOT EXISTS "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- Créer l'index unique sur le nom
CREATE UNIQUE INDEX IF NOT EXISTS "service_categories_name_key" ON "service_categories"("name");

-- Insérer les catégories par défaut
INSERT INTO "service_categories" ("id", "name", "icon", "description", "is_active", "sort_order", "created_at", "updated_at") VALUES
('550e8400-e29b-41d4-a716-446655440000', 'PEDICURE', '💅', 'Services de pédicure', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440001', 'MANICURE', '💅', 'Services de manicure', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', 'COIFFURE', '✂️', 'Services de coiffure', true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440003', 'BARBE', '🪒', 'Services de barbe', true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440004', 'SOIN_VISAGE', '🧖', 'Soins du visage', true, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440005', 'EPILATION', '💇', 'Services d''épilation', true, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440006', 'MASSAGE', '💆', 'Services de massage', true, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440007', 'BRONZAGE', '☀️', 'Services de bronzage', true, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440008', 'AUTRE', '📦', 'Autres services', true, 999, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Ajouter la colonne categoryId à la table services si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE "services" ADD COLUMN "category_id" TEXT;
    END IF;
END $$;

-- Créer la contrainte de clé étrangère
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'services_category_id_fkey'
        AND table_name = 'services'
    ) THEN
        ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" 
        FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Créer l'index sur categoryId
CREATE INDEX IF NOT EXISTS "services_category_id_idx" ON "services"("category_id");
