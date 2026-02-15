-- ==========================================
-- INSERTION DE DONNÉES DE TEST POUR LE DASHBOARD (VERSION FINALE)
-- Salon ID: 0c41c97b-6482-4deb-849e-597a1d156034
-- ==========================================

-- 1. INSÉRER DES SERVICES POUR LE SALON (avec nouveaux IDs)
-- ==========================================================
INSERT INTO services (id, name, description, price, duration, salon_id, is_active, created_at, updated_at) VALUES
('service-101', 'Coupe Femme Deluxe', 'Coupe et coiffage femme avec brushing premium', 35.00, 45, '0c41c97b-6482-4deb-849e-597a1d156034', true, NOW(), NOW()),
('service-102', 'Coupe Homme Premium', 'Coupe homme avec soin barbe inclus', 30.00, 30, '0c41c97b-6482-4deb-849e-597a1d156034', true, NOW(), NOW()),
('service-103', 'Coloration Expert', 'Coloration complète avec coupe et soin', 95.00, 120, '0c41c97b-6482-4deb-849e-597a1d156034', true, NOW(), NOW()),
('service-104', 'Soin Capillaire Intense', 'Shampoing professionnel et soin profond', 25.00, 20, '0c41c97b-6482-4deb-849e-597a1d156034', true, NOW(), NOW()),
('service-105', 'Brushing Professionnel', 'Brushing avec lissage et brillance', 45.00, 60, '0c41c97b-6482-4deb-849e-597a1d156034', true, NOW(), NOW()),
('service-106', 'Mèches Balayage', 'Mèches balayage effet naturel', 75.00, 90, '0c41c97b-6482-4deb-849e-597a1d156034', true, NOW(), NOW()),
('service-107', 'Taille Barbe', 'Barbe et taille de barbe précision', 20.00, 25, '0c41c97b-6482-4deb-849e-597a1d156034', true, NOW(), NOW()),
('service-108', 'Masque Réparateur', 'Soin profond reconstructeur', 40.00, 40, '0c41c97b-6482-4deb-849e-597a1d156034', true, NOW(), NOW());

-- 2. INSÉRER DES CLIENTS TEST (avec nouveaux IDs)
-- ============================================
INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, created_at, updated_at) VALUES
('client-101', 'Alice Dubois', 'alice.dubois.v2@email.com', '0611223347', '$2b$10$dummy.hash.for.testing.purposes', 'CLIENT', true, NOW(), NOW()),
('client-102', 'Bob Martin', 'bob.martin.v2@email.com', '0622334458', '$2b$10$dummy.hash.for.testing.purposes', 'CLIENT', true, NOW(), NOW()),
('client-103', 'Carla Petit', 'carla.petit.v2@email.com', '0633445569', '$2b$10$dummy.hash.for.testing.purposes', 'CLIENT', true, NOW(), NOW()),
('client-104', 'David Leroy', 'david.leroy.v2@email.com', '0644556670', '$2b$10$dummy.hash.for.testing.purposes', 'CLIENT', true, NOW(), NOW()),
('client-105', 'Emma Rousseau', 'emma.rousseau.v2@email.com', '0655667791', '$2b$10$dummy.hash.for.testing.purposes', 'CLIENT', true, NOW(), NOW()),
('client-106', 'Frank Moreau', 'frank.moreau.v2@email.com', '0666778892', '$2b$10$dummy.hash.for.testing.purposes', 'CLIENT', true, NOW(), NOW()),
('client-107', 'Gina Lambert', 'gina.lambert.v2@email.com', '0677889903', '$2b$10$dummy.hash.for.testing.purposes', 'CLIENT', true, NOW(), NOW()),
('client-108', 'Henri Girard', 'henri.girard.v2@email.com', '0688899014', '$2b$10$dummy.hash.for.testing.purposes', 'CLIENT', true, NOW(), NOW());

-- 3. INSÉRER DES RENDEZ-VOUS TEST (avec nouveaux IDs et bons noms de colonnes)
-- ========================================================================
INSERT INTO rendezvous (id, client_id, salon_id, service_id, coiffeur_id, date, start_time, end_time, status, is_late_marked, payment_status, notes, created_at, updated_at, "totalDuration", "totalPrice") VALUES
('rdv-101', 'client-101', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-101', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE, '10:00', '10:45', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 45, 35.00),
('rdv-102', 'client-102', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-102', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE, '11:30', '12:00', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 30, 30.00),
('rdv-103', 'client-103', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-103', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '1 day', '14:00', '16:00', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 120, 95.00),
('rdv-104', 'client-104', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-104', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '2 days', '15:30', '16:30', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 60, 25.00),
('rdv-105', 'client-105', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-105', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '3 days', '16:00', '17:00', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 60, 45.00),
('rdv-106', 'client-106', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-106', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '4 days', '09:30', '09:50', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 20, 75.00),
('rdv-107', 'client-107', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-107', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '5 days', '13:00', '13:20', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 20, 20.00),
('rdv-108', 'client-108', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-108', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '6 days', '17:30', '18:50', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 80, 40.00),
('rdv-109', 'client-101', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-101', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '7 days', '10:00', '10:45', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 45, 35.00),
('rdv-110', 'client-102', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-102', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '8 days', '11:30', '12:00', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 30, 30.00),
('rdv-111', 'client-103', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-103', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '10 days', '14:00', '16:00', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 120, 95.00),
('rdv-112', 'client-104', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-104', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '12 days', '15:30', '16:30', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 60, 25.00),
('rdv-113', 'client-105', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-105', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '15 days', '16:00', '17:00', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 60, 45.00),
('rdv-114', 'client-106', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-106', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '18 days', '09:30', '09:50', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 20, 75.00),
('rdv-115', 'client-107', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-107', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '20 days', '13:00', '13:20', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 20, 20.00),
('rdv-116', 'client-108', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-108', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '22 days', '17:30', '18:50', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 80, 40.00),
('rdv-117', 'client-101', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-101', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '25 days', '10:00', '10:45', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 45, 35.00),
('rdv-118', 'client-102', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-102', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE - INTERVAL '28 days', '11:30', '12:00', 'COMPLETED', false, 'PAID', NULL, NOW(), NOW(), 30, 30.00),
('rdv-119', 'client-103', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-103', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE + INTERVAL '1 day', '14:00', '16:00', 'PENDING', false, 'NOT_PAID', NULL, NOW(), NOW(), 120, 95.00),
('rdv-120', 'client-104', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-104', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE + INTERVAL '2 days', '15:30', '16:30', 'PENDING', false, 'NOT_PAID', NULL, NOW(), NOW(), 60, 25.00),
('rdv-121', 'client-105', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-105', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE + INTERVAL '3 days', '16:00', '17:00', 'PENDING', false, 'NOT_PAID', NULL, NOW(), NOW(), 60, 45.00),
('rdv-122', 'client-106', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-106', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE + INTERVAL '4 days', '09:30', '09:50', 'PENDING', false, 'NOT_PAID', NULL, NOW(), NOW(), 20, 75.00),
('rdv-123', 'client-107', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-107', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE + INTERVAL '5 days', '13:00', '13:20', 'PENDING', false, 'NOT_PAID', NULL, NOW(), NOW(), 20, 20.00),
('rdv-124', 'client-108', '0c41c97b-6482-4deb-849e-597a1d156034', 'service-108', '12d7d046-53fc-4dde-acbf-3bfadc8604d2', CURRENT_DATE + INTERVAL '6 days', '17:30', '18:50', 'PENDING', false, 'NOT_PAID', NULL, NOW(), NOW(), 80, 40.00);

-- 4. INSÉRER DES AVIS TEST (avec nouveaux IDs)
-- ==========================================
INSERT INTO reviews (id, client_id, salon_id, rating, comment, created_at, updated_at) VALUES
('review-101', 'client-101', '0c41c97b-6482-4deb-849e-597a1d156034', 5, 'Excellent service ! Sophie est une coiffeuse exceptionnelle.', NOW() - INTERVAL '5 days', NOW()),
('review-102', 'client-102', '0c41c97b-6482-4deb-849e-597a1d156034', 4, 'Très satisfait du résultat, Jean est très professionnel.', NOW() - INTERVAL '10 days', NOW()),
('review-103', 'client-103', '0c41c97b-6482-4deb-849e-597a1d156034', 5, 'Marie fait un brushing parfait ! Je recommande vivement.', NOW() - INTERVAL '15 days', NOW()),
('review-104', 'client-104', '0c41c97b-6482-4deb-849e-597a1d156034', 5, 'Coloration réussie, Pierre est vraiment un expert.', NOW() - INTERVAL '20 days', NOW()),
('review-105', 'client-105', '0c41c97b-6482-4deb-849e-597a1d156034', 4, 'Bonne expérience, salon propre et accueillant.', NOW() - INTERVAL '25 days', NOW());

-- ==========================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ==========================================

-- Vérifier les services insérés
SELECT COUNT(*) as services_count FROM services WHERE salon_id = '0c41c97b-6482-4deb-849e-597a1d156034';

-- Vérifier les coiffeurs
SELECT COUNT(*) as coiffeurs_count FROM coiffeurs WHERE salon_id = '0c41c97b-6482-4deb-849e-597a1d156034';

-- Vérifier les rendez-vous du mois
SELECT COUNT(*) as rdv_month_count FROM rendezvous 
WHERE salon_id = '0c41c97b-6482-4deb-849e-597a1d156034' 
AND date >= date_trunc('month', CURRENT_DATE);

-- Vérifier les rendez-vous de la semaine
SELECT COUNT(*) as rdv_week_count FROM rendezvous 
WHERE salon_id = '0c41c97b-6482-4deb-849e-597a1d156034' 
AND date >= date_trunc('week', CURRENT_DATE);

-- Vérifier le chiffre d'affaires du mois
SELECT SUM("totalPrice") as monthly_revenue FROM rendezvous 
WHERE salon_id = '0c41c97b-6482-4deb-849e-597a1d156034' 
AND date >= date_trunc('month', CURRENT_DATE)
AND status = 'COMPLETED';

-- Vérifier les clients uniques
SELECT COUNT(DISTINCT client_id) as unique_clients FROM rendezvous 
WHERE salon_id = '0c41c97b-6482-4deb-849e-597a1d156034';

-- Vérifier la note moyenne calculée depuis les avis
SELECT ROUND(AVG(CAST(rating AS DECIMAL)), 1) as calculated_rating FROM reviews 
WHERE salon_id = '0c41c97b-6482-4deb-849e-597a1d156034';
