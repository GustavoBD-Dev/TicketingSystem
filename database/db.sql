--Create the database
CREATE DATABASE database_BAB;
USE database_BAB;
-- Create the table users
CREATE TABLE users(
    id INT(11) NOT NULL,
    username VARCHAR(16) NOT NULL,
    password VARCHAR(60) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(20) NOT NULL
);
-- Alter the table to add primary key
ALTER TABLE users ADD PRIMARY KEY (id);
-- Set autoincrement the table users
ALTER TABLE users MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;
--Describe las tablas
DESCRIBE users;
-- links tables
CREATE TABLE links (
    id INT(11) NOT NULL,
    title VARCHAR(150) NOT NULL,
    url VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INT(11),
    created_at timestamp NOT NULL DEFAULT current_timestamp, 
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
)

-- para mostrar todas las tablas
SHOW TABLES;

-- 
ALTER TABLE users MODIFY email TEXT(30) NOT NULL;

ALTER TABLE rutas ADD PRIMARY KEY (id);
ALTER TABLE rutas MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;


-- insert data in table rutas
INSERT INTO rutas (origen, destino, horaSalida, fecha)
VALUES ('Atlacomulco', 'San Diego', '15:30:00', '02/02/2022');