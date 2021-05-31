const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const PaisesRoutes = require('./routes/paisesController.js');
const CiudadesRoutes = require('./routes/ciudadesController.js');
const AccountRoutes = require('./routes/accountController.js');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/Account', AccountRoutes);
app.use('/Countries', PaisesRoutes);
app.use('/Ciudades', CiudadesRoutes);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  return;
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});