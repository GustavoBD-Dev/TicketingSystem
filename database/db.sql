--Create the database
CREATE DATABASE database_BAB;
USE database_BAB;
-- Create the table users
CREATE TABLE users(
    idUser      INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    userName    VARCHAR(36) NOT NULL,
    passwordUs  VARCHAR(36) NOT NULL,
    fullNameUs  VARCHAR(72) NOT NULL,
    emailUser   VARCHAR(99) NOT NULL,
    dateOfBirth DATE NOT NULL,
    credit      DOUBLE NOT NULL,
    PRIMARY KEY(idUser)
);
-- Alter the table to add primary key
ALTER TABLE users ADD PRIMARY KEY (id);
-- Set autoincrement the table users
ALTER TABLE users MODIFY idUser INT(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;
--Describe las tablas
DESCRIBE users;
/*
mysql> DESCRIBE users;
+-------------+--------------+------+-----+---------+----------------+
| Field       | Type         | Null | Key | Default | Extra          |
+-------------+--------------+------+-----+---------+----------------+
| idUser      | int unsigned | NO   | PRI | NULL    | auto_increment |
| userName    | varchar(36)  | NO   |     | NULL    |                |
| passwordUs  | varchar(36)  | NO   |     | NULL    |                |
| fullNameUs  | varchar(72)  | NO   |     | NULL    |                |
| emailUser   | varchar(99)  | NO   |     | NULL    |                |
| credit      | double       | NO   |     | NULL    |                |
+-------------+--------------+------+-----+---------+----------------+
7 rows in set (0.00 sec)
*/
--Create the table of rutas
CREATE TABLE travelRoutes (
    idTravelRoute   INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    startingPlace   VARCHAR(60) NOT NULL,
    destinyPlace    VARCHAR(60) NOT NULL,
    dateTravel      TEXT(10) NOT NULL,
    hourTravel      TEXT(10) NOT NULL,
    priceTravel     DOUBLE NOT NULL,
    availablePlaces INT(3) NOT NULL,
    PRIMARY KEY (idTravelRoute)
);

DESCRIBE travelRoutes;
/*
mysql> DESCRIBE travelRoutes;
+-----------------+--------------+------+-----+---------+----------------+
| Field           | Type         | Null | Key | Default | Extra          |
+-----------------+--------------+------+-----+---------+----------------+
| idTravelRoute   | int unsigned | NO   | PRI | NULL    | auto_increment |
| startingPlace   | varchar(60)  | NO   |     | NULL    |                |
| destinyPlace    | varchar(60)  | NO   |     | NULL    |                |
| dateTravel      | tinytext     | NO   |     | NULL    |                |
| hourTravel      | tinytext     | NO   |     | NULL    |                |
| priceTravel     | double       | NO   |     | NULL    |                |
| availablePlaces | int          | NO   |     | NULL    |                |
+-----------------+--------------+------+-----+---------+----------------+
7 rows in set (0.00 sec)
*/

-- create table tickets
CREATE TABLE purchasedTickets 
(
    folio           INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    idUser          INT(10) UNSIGNED NOT NULL,
    idTravelRoute   INT(10) UNSIGNED NOT NULL,
    numberTickets   INT(10) UNSIGNED NOT NULL,
    fullPayment     DOUBLE NOT NULL,
    datePurchase    DATE NOT NULL,
    timePurchase    TIME NOT NULL,
    fileTicket      VARCHAR(20) NOT NULL,
    PRIMARY KEY (folio)
);

/*
mysql> DESCRIBE purchasedTickets;
+---------------+--------------+------+-----+---------+----------------+
| Field         | Type         | Null | Key | Default | Extra          |
+---------------+--------------+------+-----+---------+----------------+
| folio         | int unsigned | NO   | PRI | NULL    | auto_increment |
| idUser        | int unsigned | NO   |     | NULL    |                |
| idTravelRoute | int unsigned | NO   |     | NULL    |                |
| numberTickets | int unsigned | NO   |     | NULL    |                |
| fullPayment   | double       | NO   |     | NULL    |                |
| datePurchase  | date         | NO   |     | NULL    |                |
| timePurchase  | time         | NO   |     | NULL    |                |
| fileTicket    | varchar(20)  | NO   |     | NULL    |                |
+---------------+--------------+------+-----+---------+----------------+
8 rows in set (0.01 sec)
*/

-- links tables 
ALTER TABLE purchasedTickets ADD FOREIGN KEY (idUser) REFERENCES users (idUser);
ALTER TABLE purchasedTickets ADD FOREIGN KEY (idTravelRoute) REFERENCES travelRoutes (idTravelRoute);


-- para mostrar todas las tablas
SHOW TABLES;

-- 
ALTER TABLE users MODIFY email TEXT(30) NOT NULL;
ALTER TABLE 
ALTER TABLE rutas ADD PRIMARY KEY (id);
ALTER TABLE rutas MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 1;


-- insert row in table users
INSERT INTO users (
    userName, 
    passwordUs, 
    fullNameUs,
    emailUser,
    credit
) VALUES (
    'GO', 
    'MSD9BN45',
    'Gustavo Blas Duran',
    'gustavoblasduran1999@gmail.com', 
    '0.0'
);

-- insert row into table tickets
INSERT INTO purchasedTickets (
    idUser, 
    idTravelRoute, 
    numberTickets, 
    fullPayment, 
    datePurchase, 
    timePurchase, 
    fileTicket
) VALUES (
    1,
    24,
    1,
    150,
    '2015-09-03',
    '12:00:00',
    'userOne.txt'
);

-- insert row in table travelRoutes
INSERT INTO travelRoutes (
    startingPlace,
    destinyPlace,
    dateTravel,
    hourTravel,
    priceTravel,
    availablePlaces
) VALUES (
    'Queretaro',
    'Atlacomulco',
    '2021-11-01',
    '21:00:00',
    '210.0',
    '40'
);


INSERT INTO purchasedTickets (
    idUser,
    idTravelRoute,
    numberTickets,
    fullPayment,
    datePurchase,
    timePurchase,
    fileTicket
) VALUES (
    1,
    2,
    1,
    190,
    '2021-11-01',
    '23:00:00',
    '1.txt'
);


SELECT OrderID, C.CustomerID, CompanyName, OrderDate
FROM Customers C, Orders O
WHERE C.CustomerID = O.CustomerID

SELECT * FROM purchasedTickets T, travelRoutes R WHERE T.idTravelRoute = R.idTravelRoute;
SELECT * FROM purchasedTickets T, travelRoutes R, users U WHERE T.idTravelRoute = R.idTravelRoute AND U.userName = 'RECTOR_RETRO';