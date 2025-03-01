CREATE TABLE IF NOT EXISTS role_t (
    role_id bigserial PRIMARY KEY,
    rolename text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS permission (
    permission_id bigserial PRIMARY KEY,
    permission_name text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS role_permission (
    role_id bigint NOT NULL REFERENCES role_t ON DELETE CASCADE,
    permission_id bigint NOT NULL REFERENCES permission ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);

INSERT INTO role_t (role_id, rolename) VALUES
(1, 'admin'),
(2, 'reviewer'),
(3, 'user');

INSERT INTO permission (permission_id, permission_name) VALUES
(1, 'projects:create'),
(2, 'projects:read'),
(3, 'projects:update'),
(4, 'projects:delete'),
(5, 'users:create'),
(6, 'users:read'),
(7, 'users:update'),
(8, 'users:delete'),
(9, 'roles:read'),
(10, 'roles:update'),
(11, 'users:register');

INSERT INTO role_permission (role_id, permission_id) VALUES (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10);

INSERT INTO role_permission (role_id, permission_id) VALUES (2, 2), (2, 4), (2, 5), (2, 3), (2, 6), (2, 7);

INSERT INTO role_permission (role_id, permission_id) VALUES (3, 1), (3, 2), (3, 3), (3, 4), (3, 6), (3, 11);

ALTER TABLE user_t ADD COLUMN role_id bigint REFERENCES role_t;

UPDATE user_t SET role_id = 3 WHERE role_id IS NULL;

ALTER TABLE user_t ALTER COLUMN role_id SET NOT NULL;
