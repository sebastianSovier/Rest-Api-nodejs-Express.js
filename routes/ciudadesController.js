const express = require('express');
const router = express.Router();
const ciudadesDal = require('../services/ciudadesDal');
const helper = require('../helper');

/* GET programming languages. */
router.get('/CiudadesPais',helper.verifyToken,async function(req, res, next) {
  try {
    res.json(await ciudadesDal.ObtenerCiudades());
  } catch (err) {
    console.error(`Error al obtener ciudades: `, err.message);
    next(err);
  }
});
router.post('/IngresarCiudad',helper.verifyToken, async function(req, res, next) {
  try {
    res.json(await ciudadesDal.InsertarCiudad(req.body));
  } catch (err) {
    console.error(`Error al insertar ciudad: `, err.message);
    next(err);
  }
});
router.put('/ModificarCiudad',helper.verifyToken, async function(req, res, next) {
  try {
    res.json(await ciudadesDal.ModificarCiudad(req.body.pais_id, req.body));
  } catch (err) {
    console.error(`Error al modificar ciudad: `, err.message);
    next(err);
  }
});
router.delete('/:id',helper.verifyToken, async function(req, res, next) {
  try {
    res.json(await ciudadesDal.EliminarCiudad(req.params.pais_id));
  } catch (err) {
    console.error(`Error al eliminar ciudad: `, err.message);
    next(err);
  }
});



module.exports = router;