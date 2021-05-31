const express = require('express');
const router = express.Router();
const paisesDal = require('../services/paisesDal');
const helper = require('../helper');

/* GET programming languages. */
router.get('/TodosLosPaises', helper.verifyToken, async function (req, res, next) {
  try {
    res.json(await paisesDal.ObtenerPaises(req.query.page));
  } catch (err) {
    console.error(`Error al obtener paises: `, err.message);
    next(err);
  }
});
router.post('/IngresarPais', helper.verifyToken, async function (req, res, next) {
  try {
    paisesDal.InsertarPais(req.body).then(function (result) {
      try {
        await paisesDal.ObtenerPaises().then(function (result) {
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
    console.error(`Error al insertar pais: `, err.message);
    next(err);
  }
});
router.put('/ModificarPais', helper.verifyToken, async function (req, res, next) {
  try {
    console.log("modificar pais: " + JSON.stringify(req.body));
    paisesDal.ModificarPais(req.body.pais_id, req.body).then(function (result) {
      try {
        await paisesDal.ObtenerPaises().then(function (result) {
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
    });;

  } catch (err) {
    console.error(`Error al modificar pais: `, err.message);
    next(err);
  }
});
router.delete('/EliminarPais', helper.verifyToken, async function (req, res, next) {
  try {
    paisesDal.EliminarPais(req.query.pais_id).then(function (result) {
      try {
        await paisesDal.ObtenerPaises().then(function (result) {
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
    console.error(`Error al eliminar pais: `, err.message);
    next(err);
  }
});

module.exports = router;