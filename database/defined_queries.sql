-- user types values
INSERT INTO user_type (name) VALUES  ('ong'), ('restaurant') , ('admin');

-- social medias values
INSERT INTO social_network (name) 
VALUES ('facebook'), ('instagram'), ('linkedin'), ('youtube'), ('tiktok');

-- status values
INSERT INTO status_name (name) 
VALUES ('Pending Registration'), ('Email Confirmed'), ('In Progress'), ('Complete');

-- Insert a user with email admin@admin and password password, user_type_id 3 and status_id 4
INSERT INTO "user" (user_type_id, email, address, phone, logo_id, password, status_id) 
VALUES (3, 'admin@admin.com', NULL, NULL, NULL, '$2b$11$Rky1nmNOkA9OCsARmxMP7OPg9UeljZOiLCKYx9zJNLeq8o9c8wDtu', 4);
 