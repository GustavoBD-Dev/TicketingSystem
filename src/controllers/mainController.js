const { render } = require("ejs");
var bcryptjs = require('bcryptjs');
const { route, connect } = require("../routes/main");
const util = require('util');
//const PDFDocument = require('pdfkit');
const PDFDocument = require('pdfkit-construct');
const connection = require("express-myconnection");
const { error } = require("console");
const { request } = require("http");
const { response } = require("express");
//const fs = require('fs'); // module de nodejs

const controller = {};

controller.list = (req, res) => {
    // if init session, we can get session name 
    if (req.session.loggedIn) {
        res.render('index', {
            login: true,
            name: req.session.name
        });
    } else { // if not session, set default session name 
        res.render('index', {
            login: false,
            name: 'USUARIO'
        });
    }
};

controller.admin = (request, response) => {
    request.getConnection(async (error, connection) => {
        if (error) throw error; // error with the connection 
        const query = util.promisify(connection.query).bind(connection);
        try {
            const rows = await query('SELECT * FROM travelRoutes');
            response.render('admin', {
                data: rows
            })
        } catch (error) {
            res.json(error);
            return;
        }
    });
}

controller.dataRoutes = async (request, response) => { // get data of table travelRoutes and send JSON
    request.getConnection(async (error, connection) => {
        if (error) throw error; // error with the connection 
        const query = util.promisify(connection.query).bind(connection);
        try {
            response.send(JSON.stringify(await query('SELECT * FROM travelRoutes')));
        } catch (error) {
            res.json(error);
            //return;
        }
    });
}

controller.dataTickets = async (request, response) => { // get data of table purchasedTickets
    request.getConnection(async (err, conn) => {
        if (err) throw err;
        const query = util.promisify(conn.query).bind(conn);
        try {
            response.send(JSON.stringify(await query('SELECT * FROM purchasedTickets')));
        } catch (error) {
            res.json(error);
        }
    })
}

controller.deleteRoute = (request, response) => {
    console.log('Ruta a eliminar', request.params.idTravelRoute)
    // req.params contains idTravelRoute will deleted
    const { idTravelRoute } = request.params;
    console.log(`TICKET  ${idTravelRoute} WILL BE DELETED`);
    request.getConnection(async (err, conn) => {
        if (err) throw err; // error with the connection 
        const query = util.promisify(conn.query).bind(conn);
        try {
            // query to delete travelRoute with idTravelRoute
            await query(`DELETE FROM travelRoutes WHERE idTravelRoute = ${idTravelRoute};`);
            response.redirect('/admin');// update the window with new rows
        } catch (error) {
            response.json(error); // handle the error
        }
    });
}

controller.account = (req, res) => {
    // get connection with database
    req.getConnection((error, conn) => {
        if (error) throw res.send(error); // error with the connection 
        //conn.query('SELECT * FROM purchasedTickets JOIN users ON users.idUser = purchasedTickets.idUser JOIN travelRoutes ON travelRoutes.idTravelRoute = purchasedTickets.idTravelRoute WHERE users.idUser = (SELECT idUser FROM users WHERE userName = ?);',
        conn.query(`SELECT * FROM purchasedTickets JOIN users 
        ON users.idUser = purchasedTickets.idUser JOIN travelRoutes 
        ON travelRoutes.idTravelRoute = purchasedTickets.idTravelRoute 
        WHERE users.idUser = (SELECT idUser FROM users WHERE userName = '${req.session.name}');`,
            (err, tickets) => {
                if (err) {
                    res.json(err);
                }
                if (tickets.length) {
                    // exists tickets in account  
                    console.log('EL USUARIO YA TIENE TICKETS COMPRADOS');
                    console.log(tickets);
                    res.render('account', { // send tickets 
                        login: true,
                        name: req.session.name,
                        data: tickets,
                    });
                } else { // no tickets in account  
                    // get the user data 
                    conn.query('select * from users where userName = ?',
                        [req.session.name], async (err, userData) => {
                            if (err) {
                                res.json(err);
                            }
                            console.log(userData);
                            res.render('account', { // send user data to account 
                                login: true,
                                name: req.session.name,
                                data: userData
                            })
                        });
                }
            });
    });
}

controller.logout = (req, res) => {
    req.session.destroy(() => { // after close session 
        res.render('index', {
            login: false,
            name: 'USUARIO',
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "SE HA CERRADO SESION",
            alertIcon: "error",
            showConfirmButton: false,// boton de confirmacion 
            timer: 1500,
            ruta: ''
        });
    });
}

controller.origenes = (req, res) => {// render a rutas.ejs
    req.getConnection((err, conn) => {// get the connection
        if (err) throw err; // error with the connection 
        conn.query('SELECT DISTINCT startingPlace FROM travelRoutes', (err, starts) => {
            if (err) {
                res.json(err);
            }
            console.log(starts); // starts contains places od starting 
            if (req.session.loggedIn) { // if the user active session 
                res.render('origenes', {
                    login: true,
                    name: req.session.name,
                    data: starts,
                });
            } else {// the user not session active 
                res.render('origenes', {
                    login: false,
                    name: 'USUARIO',
                    data: starts
                });
            } // fin de else
        });
    });
}; // end origenes 


controller.camiones = (req, res) => {// render a camiones.ejs
    if (req.session.loggedIn) { // si ya inicio sesion 
        res.render('camiones', {
            login: true,
            name: req.session.name,
        });
    } else {
        res.render('camiones', {
            login: false,
            name: 'USUARIO',
        });
    } // fin de else
    //res.render('camiones');
};

controller.pay = async (req, res) => {
    // get start and detiny of the route 
    const start = req.params.origenSelect;
    const ended = req.params.destinyPlace;
    const dateSelect = req.body.dateSelect;
    const hourSelect = req.body.hourSelect;
    console.log('HACER COMPRA CON ESTE DATO', start, ended);;
    // get price of route
    req.getConnection((error, connection) => {
        if (error) throw error; // error with the connection 
        connection.query(`SELECT * FROM travelRoutes WHERE startingPlace = '${start}' AND destinyPlace = '${ended}'`,
            (err, infoTravel) => {
                if (err) {
                    res.json(err);
                }
                console.log("INFO [travel]: ", infoTravel);
                if (req.session.loggedIn) { // session active
                    res.render('pagos', { // send the data 
                        login: true,
                        name: req.session.name,
                        data: infoTravel,
                        dateSelect: dateSelect,
                        hourSelect: hourSelect
                    });
                } else { // session inactive
                    res.render('pagos', {
                        login: false,
                        name: 'USUARIO',
                        data: infoTravel, // sen data
                        hourSelect: hourSelect,
                        dateSelect: dateSelect
                    });
                }
            }); // end getConnection
    });
};

controller.registro = (req, res) => {// render a registro.ejs
    res.render('registro');
};

controller.destinations = (req, res) => { // get the destinations availables
    const { origin } = req.params;
    req.getConnection((err, conn) => {
        if (err) throw err; // error with the connection 
        // we get destinations places to start place 
        conn.query('SELECT destinyPlace FROM travelRoutes WHERE startingPlace = ?',
            [origin], (err, rutas) => {
                if (err) {
                    res.json(err);
                }
                if (req.session.loggedIn) { // active session 
                    res.render('destinos', {
                        login: true,
                        name: req.session.name,
                        data: rutas,
                        origenSelect: origin
                    });
                } else {
                    res.render('destinos', {
                        login: false,
                        name: 'USUARIO',
                        data: rutas,
                        origenSelect: origin
                    });
                } // fin de else
            });
    });
};



controller.dataTimeTravel = (req, res) => {
    // params data
    const start = req.params.origenSelect;
    const ended = req.params.destinyPlace;
    req.getConnection(async (err, conn) => {
        if (err) throw err;
        const query = util.promisify(conn.query).bind(conn);
        try {
            const data = await query(`SELECT * FROM travelRoutes WHERE 
            startingPlace = '${req.params.origenSelect}' AND destinyPlace = '${req.params.destinyPlace}';`);
            // 01:00:00 range exit
            var data_split = data[0].hourTravel.split(':');
            console.log('data_split - ', data_split);
            var interval_hour = parseInt(data_split[0], 10);
            console.log('interval_hour - ', interval_hour);
            var array = []; // contains hours avaliables with interval
            var hour = 0; // init hour - day contains 24 hours, init in 0
            while (hour < 24) {
                hour += interval_hour; // add range hour 
                array.push(hour);
            }
            console.log(array);
            res.render('users', {
                start: start,
                ended: ended,
                hours: array
            });

        } catch (error) {
            res.json(error);
        }

    })
}

controller.edit = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM users WHERE idUser = ?', [id], (err, rows) => {
            //console.log(rows);
            res.render('users_edit', { // archivo ejs a generar 
                data: rows[0] // recibe un arreglo 
            });
            // redirecciona a la pagina con tabla sindato eliminado 
            //res.redirect('/');// pinta la tabla sin el dato
        });
    });
};


controller.update = (req, res) => {
    const { id } = req.params;
    const newuser = req.body; // nuevos datos 
    req.getConnection((err, conn) => {
        conn.query("UPDATE users SET ? WHERE id = ?", [newuser, id], (err, rows) => {
            res.redirect('/');// pinta la tabla sin el dato
            // la pantalla inicial realiza una consulta 
        });
    });
};

controller.getTicket = async (req, res) => { // ticket generation, pass folio purchased
    // we get pruchased folio in params
    const folio = req.params.folio;
    // get the data ticket with he folio  
    req.getConnection(async (err, conn) => {
        if (err) throw err; // error with the connection 
        const query = util.promisify(conn.query).bind(conn);
        try {
            // data query of ticket delete 
            //const dataTicket = await query(`SELECT * FROM travelRoutes WHERE idTravelRoute = 
            //      (SELECT idTravelRoute FROM purchasedTickets WHERE folio = ${folio});`);
            const dataTicket = await query(`SELECT * FROM travelRoutes WHERE idTravelRoute = 
                (SELECT idTravelRoute FROM purchasedTickets WHERE folio = ${folio});`);

            const dataUser = await query(`SELECT * FROM users WHERE userName = '${req.session.name}'`)
            console.log(req.session.name);
            console.log(dataUser);

            // instance of PDFDocument
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 20, left: 10, rigth: 10, bottom: 20 },
                bufferPages: true,
            });
            // Passing size to the addPage function
            //doc.addPage({size: 'A7'});
            // generate the filename customizer  
            const filename = `${req.session.name}_${folio}.pdf`;
            // write the head 
            const stream = res.writeHead(200, {
                'content-Type': 'application/pdf',
                'content-disposition': `attachment;filename=${filename}`
            });
            // any data was created passing to head 
            doc.on('data', (data) => { stream.write(data) });
            // end the head
            doc.on('end', () => { stream.end() });

            // content before the table  
            doc.setDocumentHeader({ // setDocumentHeader is setting 10% of page 
                // increade head
                height: '10%'
            }, () => {
                doc // set the text of head 
                    .fontSize(20) // set the font size
                    .text('Boleto BAB', {
                        width: 200,
                        align: 'center'
                    });
                // add more content 
            });

            // get date and hour our sistem
            var hoy = new Date();
            var fecha = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();
            var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();

            // function text receive how params the text to show 
            // and the coordenates of the object
            doc.text(`${dataUser[0].fullNameUs}`, 30, 30);
            doc.text(`${dataUser[0].emailUser}`, 30, 45);
            doc.text(`Fecha: ${fecha} ${hora}`, 30, 60)

            //create table 
            const infoBoletos = [
                {
                    id: folio,
                    inicio: dataTicket[0].startingPlace,
                    destino: dataTicket[0].destinyPlace,
                    dia: dataTicket[0].dateTravel,
                    hora: dataTicket[0].hourTravel,
                    precio: '$' + dataTicket[0].priceTravel
                }
            ];

            // receive the columns of table 
            doc.addTable([
                { key: 'id', label: 'FOLIO', align: 'left' },
                { key: 'inicio', label: 'SALIDA', align: 'left' },
                { key: 'destino', label: 'DESTINO', align: 'left' },
                { key: 'dia', label: 'FECHA', align: 'left' },
                { key: 'hora', label: 'HORA', align: 'left' },
                { key: 'precio', label: 'PRECIO', align: 'left' },
            ], infoBoletos, {
                border: null,   // whitout border
                width: "auto", // any body
                striped: true,
                stripedColors: ["#f6f6f6", "#d6c4dd"], // rows colors 
                cellsPadding: 5,
                marginLeft: 50,
                marginRight: 50,
                headAlign: 'center', // text aling  
            });

            //render table  
            doc.render();
            doc.end();
        } catch (error) {
            res.json(error);
        }
    }); // end connection
}

controller.delete = (req, res) => { // delete ticket with folio 
    // req.params contains number of purchased folio
    const { folio } = req.params;
    console.log(`TICKET  ${folio} WILL BE DELETED`);
    req.getConnection(async (err, conn) => {
        if (err) throw err; // error with the connection 
        const query = util.promisify(conn.query).bind(conn);
        try {
            // query to data ticket to delete
            //const ticketDelete = await query(`SELECT * FROM travelRoutes WHERE idTravelRoute = 
            //      (SELECT idTravelRoute FROM purchasedTickets WHERE folio = ${folio});`);
            const ticketDelete = await query(`SELECT * FROM travelRoutes WHERE idTravelRoute = 
            (SELECT idTravelRoute FROM purchasedTickets WHERE folio = ${folio});`);
            // delete ticket of table 
            await query(`DELETE FROM purchasedTickets WHERE folio = ${folio};`);
            // get total tickets updated of user 
            //const tickets = await query(`SELECT * FROM purchasedTickets JOIN users ON users.idUser = 
            //      purchasedTickets.idUser JOIN travelRoutes ON travelRoutes.idTravelRoute = 
            //      purchasedTickets.idTravelRoute WHERE users.idUser = (SELECT idUser FROM users WHERE userName = 
            //      '${req.session.name}')`);
            const tickets = await query(
                `SELECT * FROM purchasedTickets JOIN users ON users.idUser = purchasedTickets.idUser 
                JOIN travelRoutes ON travelRoutes.idTravelRoute = purchasedTickets.idTravelRoute 
                WHERE users.idUser = (SELECT idUser FROM users WHERE userName = '${req.session.name}')`);
            // show the message to delete and refresh the page whit the tickets
            res.render('account', {
                login: true,
                name: req.session.name,
                data: tickets,
                alert: true,
                alertTitle: "HAS LIMINADO UN BOLETO!!",
                alertMessage: `${ticketDelete.startingPlace}-${ticketDelete.destinyPlace} \n ${ticketDelete.dateTravel}/${ticketDelete.hourTravel}`,
                alertIcon: "error",
                timer: 6000,
                showConfirmButton: false,
                ruta: ''
            });
        } catch (error) {
            res.json(error); // handle the error
        }
    });
};

controller.userRegister = async (req, res) => { // register new user 
    // get the data 
    const fullNameUS = req.body.fullname;
    const userName = req.body.username;
    const passwordUs = await bcryptjs.hash(req.body.password, 8);
    const emailUser = req.body.email;
    const credit = '0.0';
    req.getConnection(async (error, connection) => {
        const query = util.promisify(connection.query).bind(connection);
        try {
            // find the nameUser in database
            const findUser = await query(`SELECT * FROM users WHERE userName = '${userName}'`);
            // the nameUser exist
            if (findUser.userName == userName) {
                console.log('EXISTE UNA CUENTA');
                res.render('registro', { // params 
                    alert: true,
                    alertTitle: "NOMBRE DE USUARIO EXISTENTE",
                    alertMessage: "Selecciona otro nombre de usuario",
                    alertIcon: "alert",
                    showConfirmButton: false,// boton de confirmacion 
                    timer: 1500,
                    ruta: 'registro'
                })
            } else { // the nameUser not exist
                await query('INSERT INTO users SET ?',
                    { userName, passwordUs, fullNameUS, emailUser, credit });
                req.session.loggedIn = true; // init session
                req.session.name = userName;
                res.render('registro', { // render the templete 'registro' and pass params
                    alert: true,
                    alertTitle: "Registro de Cuenta Exitosa",
                    alertMessage: "BIENVENIDO!!!",
                    alertIcon: "success",
                    showConfirmButton: false,// button to confirmation 
                    timer: 1500,
                    ruta: ''
                });
            }
        } catch (error) {
            res.json(error);
        }
    });
};

controller.auth = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    req.getConnection(async (err, conn) => {
        if (err) throw err; // error with the connection 
        console.log('Buscando usuario ', username);
        const query = util.promisify(conn.query).bind(conn);
        try {
            const results = await query(`SELECT * FROM users WHERE userName = '${username}'`);
            console.log(results);
            console.log(results[0].passwordUs);

            if (results.length == 0) { // not user
                res.render('registro', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o contaseña incorrectas",
                    alertIcon: "error",
                    showConfirmButton: true,// button confirm
                    timer: 2000,
                    ruta: 'registro' // redirect after alert
                });
            } else { // user exists - check the password
                if ((await bcryptjs.compare(password, results[0].passwordUs))) {
                    req.session.loggedIn = true; // session variable 
                    req.session.name = results[0].userName; // set name session 
                    res.render('registro', {
                        alert: true,
                        alertTitle: "Conexion Exitosa",
                        alertMessage: "LOGIN!!!",
                        alertIcon: "success",
                        showConfirmButton: false,// boton de confirmacion 
                        timer: 2000,
                        ruta: ''
                    })
                } else {
                    res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o contaseña incorrectas",
                        alertIcon: "error",
                        showConfirmButton: true,// button confirm
                        timer: 2000,
                        ruta: 'registro' // redirect after alert
                    });
                }
            }
        } catch (error) {
            res.json(error);
        }
    }); // end getConnection
}; // end controller.auth


controller.purchase = async (req, res) => {
    /* PARA REALIZAR EL PAGO NECESITAMOS DE LOS SIGUIENTES DATOS
    idUser, +
    idTravelRoute, +
    numberTickets, +
    fullPayment, +
    datePurchase, +
    timePurchase, + 
    fileTicket +
    */
    console.log('COMPRANDO dia', req.params.date);
    console.log('COMPRANDO hora', req.params.hour);
    console.log('COMPRANDO origen', req.params.origenSelect);
    console.log('COMPRANDO detino', req.params.destinyPlace);
    //console.log(req.body, req.params, req.session.name); // { origenSelect: '___', destinyPlace: '___' }
    //console.log(req.body.dateSelect, req.body.hourSelect, req.body.priceTravel); // { origenSelect: '___', destinyPlace: '___' }

    if (req.session.loggedIn) { // active session
        console.log('SESION ACTIVA');
        req.getConnection(async (err, conn) => {
            const query = util.promisify(conn.query).bind(conn);
            try {
                const user = await query('SELECT * FROM users WHERE userName = ?', [req.session.name]);
                const travel = await query(`SELECT * FROM travelRoutes WHERE 
                    startingPlace = '${req.params.origenSelect}' AND destinyPlace = '${req.params.destinyPlace}';`);
                console.log(user, travel);

                // get date and hour our sistem
                const f = new Date(req.params.date);
                /* var hoy = new Date();
                var fecha = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();
                var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds(); */

                // insert data of purchades tickest in table 
                await conn.query(`INSERT INTO purchasedTickets (
                    idUser,
                    idTravelRoute,
                    numberTickets,
                    fullPayment,
                    datePurchase,
                    timePurchase,  
                    fileTicket
                ) VALUES (
                    ${user[0].idUser},
                    ${travel[0].idTravelRoute},
                    ${1},
                    ${travel[0].priceTravel},
                    '${req.params.date}',
                    '${req.params.hour}',
                    '${req.session.name}_${req.params.date}.txt');`);

                // show ticket purchased in table of account 
                res.render('index', {
                    login: true,
                    name: req.session.name,
                    alert: true,
                    alertTitle: "COMPRA EXITOSA!!",
                    alertMessage: "Gracias por tu compra,",
                    alertIcon: "success",
                    timer: 6000,
                    showConfirmButton: false,
                    ruta: 'account'
                });
            } catch (error) {
                res.json(error);
            }
        })
    } else { // session inactive  
        res.render('index', {
            login: true,
            name: req.session.name,
            alert: true,
            alertTitle: "PARA COMPRAR NECESITA UNA CUENTA",
            alertMessage: "redirigiendo a inicio de sesion",
            alertIcon: "erro",
            timer: 3000,
            showConfirmButton: false,
            ruta: 'registro'
        });
    }
}


controller.getPDFRoutes = (req, res) => {
    req.getConnection(async (error, conn) => {
        if (error) throw error; // error with the connection 
        const query = util.promisify(conn.query).bind(conn);
        try {
            //res.send(JSON.stringify(await query('SELECT * FROM travelRoutes')));
            const data = await query('SELECT * FROM travelRoutes');

            // create a document 
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 20, left: 10, rigth: 10, bottom: 20 },
                bufferPages: true,
            });

            const filename = `Report_${Date()}.pdf`;
            // write the head 
            const stream = res.writeHead(200, {
                'content-Type': 'application/pdf',
                'content-disposition': `attachment;filename=${filename}`
            });
            // any data was created passing to head 
            doc.on('data', (data) => { stream.write(data) });
            // end the head
            doc.on('end', () => { stream.end() });

            doc.setDocumentHeader({ // setDocumentHeader is setting 10% of page 
                // increade head
                height: '5%'
            }, () => {
                doc // set the text of head 
                    .fontSize(18) // set the font size
                    .text('Report  _BAB_', {
                        width: 420,
                        align: 'center'
                    });
                // add more content 
            });

            // add table
            doc.addTable(
                [
                    { key: 'idTravelRoute', label: 'ID', align: 'center' },
                    { key: 'startingPlace', label: 'INICIO', align: 'center' },
                    { key: 'destinyPlace', label: 'DESTINO', align: 'center' },
                    { key: 'dateTravel', label: 'FECHA', align: 'center' },
                    { key: 'hourTravel', label: 'HORA', align: 'center' },
                    { key: 'priceTravel', label: 'PRECIO', align: 'center' },
                    { key: 'availablePlaces', label: 'LUGARES', align: 'center' },
                ],
                data, { // 
                border: null,   // whitout border
                width: "auto", // any body
                striped: true,
                stripedColors: ["#f6f6f6", "#d6c4dd"], // rows colors 
                cellsPadding: 10,
                marginLeft: 45,
                marginRight: 45,
                headAlign: 'center' // text aling 
            });

            // render tables
            doc.render();
            doc.end();

        } catch (error) {
            res.json(error.stack);
            return;
        }
    });
}

controller.getPDFTickets = (req, res) => {
    req.getConnection(async (error, conn) => {
        if (error) throw error; // error with the connection 
        const query = util.promisify(conn.query).bind(conn);
        try {
            //res.send(JSON.stringify(await query('SELECT * FROM travelRoutes')));
            const data = await query('SELECT * FROM purchasedTickets');
            
            console.log(data[0].datePurchase.getFullYear());
            
            data.forEach(element => {
                var newDate = element.datePurchase.getFullYear() + '-' 
                    + element.datePurchase.getMonth() + '-' 
                    + element.datePurchase.getDate();
                element.datePurchase = newDate;
                console.log(element.datePurchase);
            });

            // create a document 
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 20, left: 10, rigth: 10, bottom: 20 },
                bufferPages: true,
            });

            const filename = `ReportTickets_${Date()}.pdf`;
            // write the head 
            const stream = res.writeHead(200, {
                'content-Type': 'application/pdf',
                'content-disposition': `attachment;filename=${filename}`
            });
            // any data was created passing to head 
            doc.on('data', (data) => { stream.write(data) });
            // end the head
            doc.on('end', () => { stream.end() });

            doc.setDocumentHeader({ // setDocumentHeader is setting 10% of page 
                // increade head
                height: '5%'
            }, () => {
                doc // set the text of head 
                    .fontSize(18) // set the font size
                    .text('Report Tickets  _BAB_', {
                        width: 420,
                        align: 'center'
                    });
                // add more content 
            });
            // add table
            doc.addTable(
                [
                    { key: 'folio', label: 'FOLIO', align: 'center' },
                    { key: 'idUser', label: 'USUARIO', align: 'center' },
                    { key: 'idTravelRoute', label: 'RUTA', align: 'center' },
                    { key: 'numberTickets', label: 'BOLETOS', align: 'center' },
                    { key: 'fullPayment', label: 'TOTAL', align: 'center' },
                    { key: 'datePurchase', label: 'FECHA', align: 'center' },
                    { key: 'timePurchase', label: 'HORA', align: 'center' },
                ],
                data, { // 
                border: null,   // whitout border
                width: "auto", // any body
                striped: true,
                stripedColors: ["#f6f6f6", "#d6c4dd"], // rows colors 
                cellsPadding: 10,
                marginLeft: 45,
                marginRight: 45,
                headAlign: 'center' // text aling 
            });

            // render tables
            doc.render();
            doc.end();

        } catch (error) {
            res.json(error.stack);
            return;
        }
    });
}

controller.addRoute = (req, res) => {
    //console.log(req.body);
    const data = req.body;
    console.log(data);
    return;
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO travelRoutes SET ?', [data], (err, rows) => {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
            res.render('admin', {
                alert: true,
                alertTitle: "REGISTRO EXITOSO",
                alertMessage: "Se ha agregado una nueva ruta",
                alertIcon: "succes",
                timer: 1500,
                showConfirmButton: false,
                ruta: '/admin'
            });
        });
    });
}


module.exports = controller;



