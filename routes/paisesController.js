const express = require('express');
const router = express.Router();
const paisesDal = require('../services/paisesDal');
const helper = require('../helper');

/* GET programming languages. */
router.get('/TodosLosPaises',helper.verifyToken,async function(req, res, next) {
  try {
    res.json(await paisesDal.ObtenerPaises(req.query.page));
  } catch (err) {
    console.error(`Error al obtener paises: `, err.message);
    next(err);
  }
});
router.post('/IngresarPais',helper.verifyToken, async function(req, res, next) {
  try {
    res.json(await paisesDal.InsertarPais(req.body));
  } catch (err) {
    console.error(`Error al insertar pais: `, err.message);
    next(err);
  }
});
router.put('/ModificarPais',helper.verifyToken, async function(req, res, next) {
  try {
    res.json(await paisesDal.ModificarPais(req.body.pais_id, req.body));
  } catch (err) {
    console.error(`Error al modificar pais: `, err.message);
    next(err);
  }
});
router.delete('/:id',helper.verifyToken, async function(req, res, next) {
  try {
    res.json(await paisesDal.EliminarPais(req.params.pais_id));
  } catch (err) {
    console.error(`Error al eliminar pais: `, err.message);
    next(err);
  }
});

module.exports = router;