const express = require('express');
const router = express.Router();
const ciudadesDal = require('../services/ciudadesDal');
const helper = require('../helper');

/* GET programming languages. */
router.get('/CiudadesPais', helper.verifyToken, async function (req, res, next) {
  try {
    res.json(await ciudadesDal.ObtenerCiudades(req.query.pais_id));
  } catch (err) {
    console.error(`Error al obtener ciudades: `, err.message);
    next(err);
  }
});
router.post('/IngresarCiudad', helper.verifyToken, async function (req, res, next) {
  try {
    ciudadesDal.InsertarCiudad(req.body).then(function (result) {
      try {
         ciudadesDal.ObtenerCiudades(req.body.pais_id).then(function (result) {
          try {
            return res.json(result);
          } catch (error) {
            console.log(error);
          }
        }).catch(function (error) {
          console.log(error);
        }).finally(function () {
        });
      } catch (error) {
        console.log(error);
      }
    }).catch(function (error) {
      console.log(error);
    }).finally(function () {
    });

  } catch (err) {
    console.error(`Error al insertar ciudad: `, err.message);
    next(err);
  }
});
router.put('/ModificarCiudad', helper.verifyToken, async function (req, res, next) {
  try {
    ciudadesDal.ModificarCiudad(req.body).then(function (result) {
      try {
         ciudadesDal.ObtenerCiudades(req.body.pais_id).then(function (result) {
          try {
            return res.json(result);
          } catch (error) {
            console.log(error);
          }
        }).catch(function (error) {
          console.log(error);
        }).finally(function () {
        });
      } catch (error) {
        console.log(error);
      }
    }).catch(function (error) {
      console.log(error);
    }).finally(function () {
    });

  } catch (err) {
    console.error(`Error al modificar ciudad: `, err.message);
    next(err);
  }
});
router.delete('/EliminarCiudad', helper.verifyToken, async function (req, res, next) {
  try {
    ciudadesDal.EliminarCiudad(req.query.ciudad_id).then(function (result) {
      try {
         ciudadesDal.ObtenerCiudades(req.query.pais_id).then(function (result) {
          try {
            return res.json(result);
          } catch (error) {
            console.log(error);
          }
        }).catch(function (error) {
          console.log(error);
        }).finally(function () {
        });
      } catch (error) {
        console.log(error);
      }
    }).catch(function (error) {
      console.log(error);
    }).finally(function () {
    });

  } catch (err) {
    console.error(`Error al eliminar ciudad: `, err.message);
    next(err);
  }
});

module.exports = router;