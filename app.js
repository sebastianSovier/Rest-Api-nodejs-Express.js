const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const PaisesRoutes = require('./routes/paisesController.js');
const CiudadesRoutes = require('./routes/ciudadesController.js');
const AccountRoutes = require('./routes/accountController.js');
const path = require("path");

const corsOptions = {
  origin: ['http://18.117.196.27:80','http://ec2-18-117-196-27.us-east-2.compute.amazonaws.com:80','ec2-18-117-196-27.us-east-2.compute.amazonaws.com','http://ec2-18-117-196-27.us-east-2.compute.amazonaws.com','http://localhost:4200','http://localhost:8080'],
  optionsSuccessStatus: 200 || 204
}

app.disable('x-powered-by');
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, "files")));
app.use(bodyParser.json())
app.use('/Account', AccountRoutes);
app.use('/Countries', PaisesRoutes);
app.use('/Ciudades', CiudadesRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error interno del servidor');
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});