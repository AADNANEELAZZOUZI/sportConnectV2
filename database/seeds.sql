TRUNCATE waiting_list, registrations, members, families, activities, associations, facilities RESTART IDENTITY CASCADE;

INSERT INTO facilities (name, address, erp_capacity) VALUES
('Complexe Sportif Ibn Yassine', '123 Avenue Mohammed V', 200),
('Piscine Olympique Agdal', '45 Rue Oqba', 100),
('Dojo Central Hassani', '88 Boulevard Hassan II', 50);

INSERT INTO associations (name, contact_email, phone) VALUES
('Club Natation Agdal', 'contact@natation-agdal.ma', '0661112233'),
('Association Combat & Arts', 'info@combat-arts.ma', '0662223344'),
('Multisport Jeunesse', 'admin@msj.ma', '0663334455');

INSERT INTO activities (facility_id, association_id, title, category, requires_strict_certificate, base_price, max_capacity, sub_zone, day_of_week, start_time, end_time) VALUES
(1, 3, 'Gymnastique Tous Publics', 'Gymnastique', FALSE, 150.00, 25, 'FULL', 3, '14:00', '16:00'),
(1, 3, 'Basketball Junior', 'Basketball', FALSE, 200.00, 20, 'A', 6, '10:00', '12:00'),
(2, 1, 'Natation Avancée', 'Natation', FALSE, 300.00, 15, 'FULL', 6, '09:00', '11:00'),
(3, 2, 'Boxe Anglaise (Risque)', 'Boxe', TRUE, 250.00, 12, 'FULL', 2, '18:00', '20:00'),
(3, 2, 'Judo Enfants', 'Judo', FALSE, 180.00, 15, 'A', 3, '16:00', '17:30'),
(3, 2, 'Karate Ados', 'Karate', FALSE, 180.00, 15, 'B', 3, '16:00', '17:30'),
(1, 3, 'Volleyball Adulte', 'Volleyball', FALSE, 220.00, 18, 'B', 5, '19:00', '21:00'),
(2, 1, 'Aquagym', 'Natation', FALSE, 260.00, 20, 'FULL', 4, '10:00', '11:30');

INSERT INTO families (family_name, quotient_familial, is_resident) VALUES
('El Amrani (Nombreuse)', 550.00, TRUE),
('Benjelloun', 750.00, TRUE),
('Alami', 1200.00, FALSE),
('Chraibi', 400.00, TRUE);

INSERT INTO members (family_id, first_name, last_name, birth_date, has_pass_sport, medical_certificate_date) VALUES
(1, 'Youssef', 'El Amrani', '2012-05-14', TRUE, '2026-01-10'),
(1, 'Aicha', 'El Amrani', '2014-08-22', TRUE, '2026-01-10'),
(1, 'Omar', 'El Amrani', '2017-03-01', FALSE, '2026-01-10'),
(2, 'Sami', 'Benjelloun', '2010-11-12', FALSE, '2025-09-01'),
(2, 'Lina', 'Benjelloun', '2015-02-18', TRUE, '2025-09-01'),
(3, 'Karim', 'Alami', '2008-07-04', FALSE, '2024-05-15'),
(3, 'Sofia', 'Alami', '2013-12-30', FALSE, '2024-05-15'),
(4, 'Amine', 'Chraibi', '2016-09-09', TRUE, '2026-02-01'),
(4, 'Hiba', 'Chraibi', '2011-04-19', FALSE, '2026-02-01'),
(2, 'Mehdi', 'Benjelloun', '2005-01-25', FALSE, '2023-01-01');

