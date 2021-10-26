const { render } = require("ejs");
var bcrypt = require('bcryptjs');// inovamos

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

controller.logout = (req, res) => {
    req.session.destroy(() => { // despues de cerrar sesion redirige a inicio
        //res.redirect('/');
        res.render('index', {
            login: false,
            name: 'USUARIO',
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "SE HA CEERADO SESION",
            alertIcon: "error",
            showConfirmButton: false,// boton de confirmacion 
            timer: 1500,
            ruta: ''
        }); 
    })
}



controller.origenes = (req, res) => {// render a rutas.ejs
    req.getConnection((err, conn) => {// get the connection
        conn.query('SELECT origen FROM rutas', (err, rutas) => {
            if (err) {
                res.json(err);
            }
            console.log(rutas); // mostramos objetos en consola
            res.render('origenes', { // primer objeto en renderizar
                data: rutas
            });
        });
    });
}; // end 


controller.camiones = (req, res) => {// render a camiones.ejs
    res.render('camiones');
};

controller.pago = (req, res) => {// render a pago.ejs
    res.render('pagos');
};

controller.registro = (req, res) => {// render a registro.ejs
    res.render('registro');
};



/////////// SENTENCES SQL TO ROUTES ///////////////// https://bootswatch.com/materia/

controller.destinos = (req, res) => { // get the routes availables
    const { origen } = req.params;
    req.getConnection((err, conn) => {
        conn.query('SELECT destino FROM rutas WHERE origen = ?', [origen], (err, rutas) => {
            if (err) {
                res.json(err);
            }
            // pintamos una vista
            console.log(rutas);
            res.render('destinos', { // primer objeto en renderizar
                data: rutas
            });
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
        conn.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
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
    const fullname = req.body.fullname;
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.diremail;
    console.log(req.body);
    //let passwordHaash = await bcryptjs.hash(pass, 8);
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO users SET ?',
            { username, password, fullname, email },
            async (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    res.send("ALTA EXITOSA");
                }
            });
    });
};

controller.auth = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(Boolean(username));
    console.log(Boolean(password));
    if (Boolean(username)  && Boolean(password)) {
        //console.log('Buscando usuario');
        req.getConnection((err, conn) => {
            //console.log('Buscando usuario ', username);
            conn.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
                console.log("RESULTADOS OBTENIDOS: ",results[0].password);
                if ((await bcrypt.compare(password, results[0].password))) {
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
                    req.session.name = results[0].username;
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


module.exports = controller;



