const express = require('express');
const router = express.Router();
const paisesDal = require('../services/paisesDal');
const usuariosDal = require('../services/usuariosDal');
const helper = require('../helper');

/* GET programming languages. */
router.get('/TodosLosPaises', helper.verifyToken, async function (req, res, next) {
  usuariosDal.ObtenerUsuario(req.query.usuario).then(function (result) {
    console.log(result);
    if (result.data.length > 0) {
      paisesDal.ObtenerPaises(result.data[0].usuario_id).then(function (result) {

        return res.json(result);
      }).catch(function (error) {
        console.log(error);
      }).finally(function () {
      });
     // paisesDal.ObtenerPaises(result.data[0].usuario_id));
    }
  }).catch(function (error) {
    console.log(error);
  }).finally(function () {
  });
});
router.post('/IngresarPais', helper.verifyToken, async function (req, res, next) {
  usuariosDal.ObtenerUsuario(req.body.usuario).then(function (result) {
    if (result.data.length > 0) {

      console.log(result.data[0]);
      req.body.usuario_id = result.data[0].usuario_id;
      paisesDal.InsertarPais(req.body).then(function (result) {

        paisesDal.ObtenerPaises().then(function (result) {

          return res.json(result);
        }).catch(function (error) {
          console.log(error);
        }).finally(function () {
        });
      }).catch(function (error) {
        console.log(error);
      }).finally(function () {
      });
    }

  }).catch(function (error) {
    console.log(error);
  }).finally(function () {
  });
});
router.put('/ModificarPais', helper.verifyToken, async function (req, res, next) {
  try {
    console.log("modificar pais: " + JSON.stringify(req.body));
    paisesDal.ModificarPais(req.body.pais_id, req.body).then(function (result) {
      try {
        paisesDal.ObtenerPaises().then(function (result) {
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
        paisesDal.ObtenerPaises().then(function (result) {
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