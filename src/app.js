// require the modules
const express = require('express'); 
const app = express(); // express return the object (server)
const path = require('path');
const morgan = require('morgan');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const session = require('express-session');
require('dotenv').config();
// importing routes defined in main.js
const userRouters = require('./routes/main');

const { urlencoded, response } = require('express');
const { request } = require('http');

// This is express function, this function does something before the routes defined in '', for example '/user'
/* app.all('', (request, response, next) => {
    // show in the console 
    console.log('por aqui paso');
    // res.send('finish'); // renderize the page, no continue to route 
    // continue with the route that next, this route defined in '', for example '/user'
    // this route can defined '/user/:id', this function is executed before going to that route
    next();
});
 */

// settings - variables
// app.set('<name_variable>', value);
app.set('port', process.env.PORT); // set the number port
// get the value of variable - app.get('port')
app.set('view engine', 'ejs'); // ejs how engine templates
app.set('views', path.join(__dirname, 'views')); // __dirname ruta del archivo
app.set(express.static(path.join(__dirname, 'public')));

//middlewares
// the midleware is a funtion that is executed before any route 
// this procces data before arrive the route 
/* function logger(request, response, next) {
    console.log(`Route received: ${request.protocol}://${request.get('host')}${request.originalUrl}`);
    next();
}
app.use(logger); */ // this middleware execute the function logger before the executed any routes
app.use(morgan('dev')); // mostrar mensaje por consola GET / 404 7.236 ms - 139
app.use(myConnection(mysql, { // conexion a la base de datos
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: 3306
}, 'single'));
// method that allows to understand the form data
app.use(express.urlencoded({extended: false})); // false - no envia iamgenes 
// session variables
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
// express can understand json format 
app.use(express.json()); 
// Routers - urls that users request from the server
app.use('/', userRouters);

// static files 
// this middleware get the files for frontend
app.use(express.static(__dirname + '/public'));

// app listen the port define in settings
app.listen(app.get('port'), () =>{
    // init the server in the port
    console.log('Server on port 3000');
});