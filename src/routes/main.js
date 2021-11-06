const { application } = require('express');
const express = require('express'); // require the module
const router = express.Router(); 

const mainController = require('../controllers/mainController');


// method GET: the browser request data 
// method POST: the browser send data 
// method PUT: update the data in browser
// methos DELETE: delete the data in browser

// call the function list of user controller
router.get('/', mainController.list); 
router.get('/logout', mainController.logout);


// Sentences to users
router.post('/add', mainController.save);
router.get('/delete/:folio', mainController.delete);// revecive in params the folio 
router.get('/update/:id', mainController.edit); // receive in params the id 
router.post('/update/:id', mainController.update); // receive in params the id
router.post('/userRegister', mainController.userRegister);
router.post('/auth', mainController.auth);
// receive in params the origen select and destiny place
router.post('/purchase/:origenSelect-:destinyPlace', mainController.purchase); 
// receive in params the folio to print ticket
router.get('/get-ticket/:folio', mainController.getTicket);
// receive in params the origin to find the destiny avaliables for this 
router.get('/destinos-to/:origin', mainController.destinations);
router.get('/account', mainController.account);
// redirect to nav bar 
router.get('/origenes', mainController.origenes);
router.get('/camiones', mainController.camiones);
router.get('/pago/:origenSelect-:destinyPlace', mainController.pay);
router.get('/registro', mainController.registro);
// generate the view to admin
router.get('/admin', mainController.admin);
router.get('/dataRoutes', mainController.dataRoutes); // get routes 
router.get('/dataTickets', mainController.dataTickets); // get tickets 
router.get('/deleteRoute/:idTravelRoute', mainController.deleteRoute);
router.get('/getPDFRoutes', mainController.getPDFRoutes);
router.get('/getPDFTickets', mainController.getPDFTickets);
router.post('/addRoute', mainController.addRoute);

module.exports = router;

