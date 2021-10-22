const express = require('express');
const router = express.Router();

const mainController = require('../controllers/mainController');

// url que el servidor pueda manejar 
// llamamos a la funcion list de customer controller
router.get('/', mainController.list); // render de pagina de inicio 

// Sentences to users
router.post('/add', mainController.save);
router.get('/delete/:id', mainController.delete);// recibira un id
router.get('/update/:id', mainController.edit);
router.post('/update/:id', mainController.update);

// Sentntences to rutas 
router.get('/rutes/:origen', mainController.destinos);
//router.get('/rutes/:destino', mainController.destinos);

// redireccion a render del menu de navegacion
router.get('/origenes', mainController.origenes);
router.get('/camiones', mainController.camiones);
router.get('/pago', mainController.pago);
router.get('/registro', mainController.registro);

module.exports = router;

