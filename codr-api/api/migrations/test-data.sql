DELETE FROM users;
INSERT INTO users (id, session_id, user_level, display_name) VALUES (0, 'UNUSED', 0, 'developer');
INSERT INTO users (id, session_id, user_level, display_name) VALUES (1, 'UNUSED', 0, 'normal test user1');
INSERT INTO users (id, session_id, user_level, display_name) VALUES (2, 'UNUSED', 0, 'normal test user2');
INSERT INTO users (id, session_id, user_level, display_name) VALUES (3, 'UNUSED', 0, 'normal test user3');
INSERT INTO users (id, session_id, user_level, display_name) VALUES (4, 'UNUSED', 0, 'normal test user4');

DELETE FROM modules;
INSERT INTO modules (id, name, description) VALUES (1, 'test module', 'test module description');

DELETE FROM templates;
INSERT INTO templates (id, name) VALUES (2, 'test template');
INSERT INTO templates (id, name) VALUES (1, 'default template');

DELETE FROM projectgroup;
INSERT INTO projectgroup (id, module_id) VALUES (1, 1);
INSERT INTO projectgroup (id, module_id) VALUES (2, 1);
DELETE FROM files;
DELETE FROM comments;
ALTER SEQUENCE files_id_seq RESTART WITH 1;
ALTER SEQUENCE templates_id_seq RESTART WIth 2;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
