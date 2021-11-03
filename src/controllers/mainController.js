const { render } = require("ejs");
var bcrypt = require('bcryptjs');// inovamos
const { route, connect } = require("../routes/main");
const util = require('util');

const controller = {};


controller.list = (req, res) => {
    // una vez que iniciamos sesion tenemos los datos del usuario 
    if (req.session.loggedIn) {
        res.render('index', {
            login: true,
            name: req.session.name
        });
    } else {
        res.render('index', {
            login: false,
            name: 'USUARIO'
        });
    }
    // obtebemos la conexion
    /*req.getConnection((err, conn) => {
        conn.query('SELECT * FROM users', (err, users) => {
            if (err) {
                res.json(err);
            }
            // pintamos una vista
            console.log(users);
            res.render('index', { // primer objeto en renderizar
                data: users
            });
        });
    });*/
};

controller.account = (req, res) => {
    // get connection with database
    req.getConnection((err, conn) => {
        //conn.query('SELECT * FROM purchasedTickets T, travelRoutes R WHERE T.idTravelRoute = R.idTravelRoute;', (err, tickets) => {
        //conn.query('SELECT * FROM purchasedTickets T, travelRoutes R, users U WHERE T.idTravelRoute = R.idTravelRoute = U.idUser = (SELECT idUser FROM users WHERE userName = ?)',
        conn.query('SELECT * FROM purchasedTickets JOIN users ON users.idUser = purchasedTickets.idUser WHERE users.idUser = (SELECT idUser FROM users WHERE userName = ?);',
            [req.session.name], (err, tickets) => {
                if (err) {
                    res.json(err);
                }
                console.log(tickets);
                
                // primera cuenta, debemos obtener los atributos de nombre completo
                //console.log(tickets);
                if (tickets.length) {
                    // el usuario ya ha comprado boletos, enviamos datos de boletos
                    console.log('EL USUARIO YA TIENE TICKETS COMPRADOS');
                    console.log(tickets);
                    res.render('account', {
                        login: true,
                        name: req.session.name,
                        data: tickets,
                    });
                } else {
                    conn.query('select * from users where userName = ?',
                        [req.session.name], async (err, rows) => {
                            if (err) {
                                res.json(err);
                            }
                            console.log(rows);
                            res.render('account', {
                                login: true,
                                name: req.session.name,
                                data: rows
                            })
                        });
                }
            });
    });
}

controller.logout = (req, res) => {
    req.session.destroy(() => { // despues de cerrar sesion redirige a inicio
        //res.redirect('/');
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
    //console.log(req.body);
    req.getConnection((err, conn) => {// get the connection
        conn.query('SELECT DISTINCT startingPlace FROM travelRoutes', (err, rutas) => {
            if (err) {
                res.json(err);
            }
            console.log(rutas, ">>"); // rutas contiene lugar de destino
            if (req.session.loggedIn) { // si ya inicio sesion 
                res.render('origenes', {
                    login: true,
                    name: req.session.name,
                    data: rutas,

                });
            } else {
                res.render('origenes', {
                    login: false,
                    name: 'USUARIO',
                    data: rutas
                });
            } // fin de else
        });
    });
}; // end 


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

controller.pago = (req, res) => {// render a pago.ejs
    // obtenemos el inicio y destino de los parametros
    const inicio = req.params.origenSelect;
    const final = req.params.destinyPlace;
    console.log('HACER COMPRA CON ESTE DATO', inicio, final);;

    // obtenemos el precio de la ruta
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM travelRoutes WHERE startingPlace = ? AND destinyPlace = ?',
            [inicio, final], (err, infoTravel) => {
                if (err) {
                    res.json(err);
                }
                console.log(">>>", infoTravel);

                if (req.session.loggedIn) { // si ya inicio sesion 
                    res.render('pagos', {
                        login: true,
                        name: req.session.name,
                        data: infoTravel
                    });
                } else {
                    res.render('pagos', {
                        login: false,
                        name: 'USUARIO',
                        data: infoTravel
                    });
                } // fin de else
            })
    });
};

controller.registro = (req, res) => {// render a registro.ejs
    res.render('registro');
};



/////////// SENTENCES SQL TO ROUTES ///////////////// https://bootswatch.com/materia/

controller.destinos = (req, res) => { // get the routes availables
    const { origen } = req.params;
    req.getConnection((err, conn) => {
        conn.query('SELECT destinyPlace FROM travelRoutes WHERE startingPlace = ?',
            [origen], (err, rutas) => {
                if (err) {
                    res.json(err);
                }
                //console.log(rutas); // mostramos objetos en consola
                if (req.session.loggedIn) { // si ya inicio sesion 
                    res.render('destinos', {
                        login: true,
                        name: req.session.name,
                        data: rutas,
                        origenSelect: origen
                    });
                } else {
                    res.render('destinos', {
                        login: false,
                        name: 'USUARIO',
                        data: rutas,
                        origenSelect: origen
                    });
                } // fin de else
                // redirecciona a la pagina con tabla sindato eliminado 
                //res.redirect('/');// pinta la tabla sin el dato
            });
    });
};



/////////////  CONSULTAS SQL TO USERS  /////////////

controller.save = (req, res) => {
    //console.log(req.body);
    const data = req.body;
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO users SET ?', [data], (err, rows) => {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
            //console.log(data);
            //console.log(rows);
            res.redirect('/');// redirecciona a la ruta inicial del servidor
            //res.send('works');
        });
    });
};

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


controller.delete = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, conn) => {
        conn.query('DELETE FROM users WHERE id = ?', [id], (err, rows) => {
            // redirecciona a la pagina con tabla sindato eliminado 
            res.redirect('/');// pinta la tabla sin el dato
        })
    });
    // me envia un parametro de la url
    //console.log(req.params);
    //console.log(req.params.id);
    //res.send("works");
};

controller.userRegister = async (req, res) => {
    const fullNameUS = req.body.fullname;
    const userName = req.body.username;
    const passwordUs = req.body.password;
    const emailUser = req.body.email;
    const credit = '0.0';
    console.log(req.body);
    //let passwordHaash = await bcryptjs.hash(pass, 8);
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO users SET ?',
            { userName, passwordUs, fullNameUS, emailUser, credit },
            async (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    //res.send("ALTA EXITOSA");
                    req.session.loggedIn = true; // inicia sesion 
                    req.session.name = userName;
                    res.render('registro', {
                        alert: true,
                        alertTitle: "Registro de Cuenta Exitosa",
                        alertMessage: "BIENVENIDO!!!",
                        alertIcon: "success",
                        showConfirmButton: false,// boton de confirmacion 
                        timer: 2000,
                        ruta: ''
                    })
                }
            });
    });
};

controller.auth = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(Boolean(username));
    console.log(Boolean(password));
    if (Boolean(username) && Boolean(password)) {
        //console.log('Buscando usuario');
        req.getConnection((err, conn) => {
            //console.log('Buscando usuario ', username);
            conn.query('SELECT * FROM users WHERE userName = ?', [username], async (error, results) => {
                console.log("RESULTADOS OBTENIDOS: ", results[0].passwordUs);
                if ((await bcrypt.compare(password, results[0].passwordUs))) {
                    res.render('registro', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o contaseña incorrectas",
                        alertIcon: "error",
                        showConfirmButton: true,// button confirm
                        timer: 2000,
                        ruta: '' // redirect after alert
                    });
                } else {
                    req.session.loggedIn = true; // variable de sesion
                    req.session.name = results[0].userName;
                    res.render('registro', {
                        alert: true,
                        alertTitle: "Conexion Exitosa",
                        alertMessage: "LOGIN!!!",
                        alertIcon: "success",
                        showConfirmButton: false,// boton de confirmacion 
                        timer: 2000,
                        ruta: ''
                    })
                } // end else
            }) // end conn.query
        }); // end getConnection
    } else {
        console.log('No inserto datos');
        res.render('registro', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "INGRESA DATOS DE USUARIO Y CONTRASEÑA",
            alertIcon: "error",
            showConfirmButton: false,// boton de confirmacion 
            timer: 1500,
            ruta: 'registro'
        });
    }
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
    console.log(req.params, req.session.name); // { origenSelect: '___', destinyPlace: '___' }

    if (req.session.loggedIn) { // SE TIENE SESION ACTIVA 
        req.getConnection(async (err, conn) => {
            const query = util.promisify(conn.query).bind(conn);
            try {
                const user = await query('SELECT * FROM users WHERE userName = ?', [req.session.name]);
                const travel = await query(`SELECT * FROM travelRoutes WHERE 
                    startingPlace = '${req.params.origenSelect}' AND destinyPlace = '${req.params.destinyPlace}';`);
                console.log(user, travel);
                // obtenemos fecha y hora del sistema
                var hoy = new Date();
                var fecha = hoy.getFullYear() + '-' + (hoy.getMonth() + 1) + '-' + hoy.getDate();
                var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
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
                    '${fecha}',
                    '${hora}',
                    '${req.session.name}_${fecha}.txt');`);

                res.render('index', {
                    login: true,
                    name: req.session.name,
                    alert: true,
                    alertTitle: "COMPRA EXITOSA!!",
                    alertMessage: "Gracias por tu compra,",
                    alertIcon: "success",
                    timer: 6000,
                    showConfirmButton: false,// boton de confirmacion 
                    ruta: 'account'
                });
            } catch (error) {
                res.json(error);
            }
        })
    } else { // NO SE TIENE SESION ACTIVA 
        res.render('index', {
            login: true,
            name: req.session.name,
            alert: true,
            alertTitle: "PARA COMPRAR NECESITA UNA CUENTA",
            alertMessage: "redirigiendo a inicio de sesion",
            alertIcon: "erro",
            timer: 3000,
            showConfirmButton: false,// boton de confirmacion 
            ruta: 'registro'
        });
    }


}


module.exports = controller;



