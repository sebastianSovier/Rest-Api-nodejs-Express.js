const express = require('express');
const router = express.Router();
const paisesDal = require('../services/paisesDal');

/* GET programming languages. */
router.get('/TodosLosPaises', async function(req, res, next) {
  try {
    res.json(await paisesDal.ObtenerPaises(req.query.page));
  } catch (err) {
    console.error(`Error al obtener paises: `, err.message);
    next(err);
  }
});
router.post('/IngresarPais', async function(req, res, next) {
  try {
    res.json(await paisesDal.InsertarPais(req.body));
  } catch (err) {
    console.error(`Error al insertar pais: `, err.message);
    next(err);
  }
});
router.put('/ModificarPais', async function(req, res, next) {
  try {
    res.json(await paisesDal.ModificarPais(req.body.pais_id, req.body));
  } catch (err) {
    console.error(`Error al modificar pais: `, err.message);
    next(err);
  }
});
router.delete('/:id', async function(req, res, next) {
  try {
    res.json(await paisesDal.EliminarPais(req.params.pais_id));
  } catch (err) {
    console.error(`Error al eliminar pais: `, err.message);
    next(err);
  }
});

module.exports = router;