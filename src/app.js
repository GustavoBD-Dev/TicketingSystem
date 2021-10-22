const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection');

// importando rutas 
//const userRouters = require('./routes/user');
const userRouters = require('./routes/main');// PRIMERO QUE SE EJEUCTA


const { urlencoded } = require('express');

// settings
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs'); // ejs como motor de plantillas
app.set('views', path.join(__dirname, 'views')); // __dirname ruta del archivo



//middlewares
app.use(morgan('dev')); // mostrar mensaje por consola GET / 404 7.236 ms - 139
app.use(myConnection(mysql, { // conexion a la base de datos
    host: "localhost",
    user: "root",
    password: "MSD9BN45",
    database: "database_BAB",
    port: 3306
}, 'single'));
// metodo que permite entender los datos del formulario
app.use(express.urlencoded({extended: false})); // false - no envia iamgenes 



// Routers - urls que los usuarios piden al servidor
app.use('/', userRouters);

// static files - arhivos de frontend
// para que encuentre la carpeta public 
app.set(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public')); // estilos CSS

// empezando el servidor 
app.listen(app.get('port'), () =>{
    console.log('Server on port 3000');
})