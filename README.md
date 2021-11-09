# TicketingSystem
> Este es un proyecto de semestre de universidad
### Caracteristicas de la aplicación
- Consulta de detalles de ruta: origen, destino, hora y precio.
- Para la compra de boleto es necesario una cuenta de usuario
- Cancelacion de boleto e impresion en formato PDF
- Metodo de pago con tarjeta

### Desarrollo
#### Aplicacion Web con Node.js y MySQL
- Descarga de Node.js: <https://nodejs.org/es/> version 16.13.0 LTS

### Instalacion
#### Gestion de paquetes npm
- Framework 
`$ npm install express express-myconnection express-session`
- Conectar el servidor a MySQL
`$ npm i mysql`
- Peticiones del servidor
`$ npm i morgan`
- Motor de plantillas
`$ npm i ejs`
- Hash de contraseñas
`$ npm i bcryptjs`
- Generación de PDFs
`$ npm pdfkit pdfkit-construc`
- Dependencia de desarrollo
`$ npm i nodemon`
- Variables de entorno
`$ cross-env`
- Pagos con tarjeta 
`$ stripe`

#### Iniciar aplicación
`npm run dev`