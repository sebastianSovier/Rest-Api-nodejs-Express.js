const express = require('express');
const router = express.Router();
const paisesDal = require('../services/paisesDal');
const usuariosDal = require('../services/usuariosDal');
const helper = require('../helper');
var jwt = require('jsonwebtoken');
var config = require('../config');
/* GET programming languages. */
/*
var cors = require('cors');
var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
router.use(cors(corsOptions));
*/
router.get('/TodosLosPaises', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(authdata);
      usuariosDal.ObtenerUsuario(req.query.usuario).then(function (result) {
        console.log(result);
        if (result.data.length > 0) {
          paisesDal.ObtenerPaises(result.data[0].usuario_id).then(function (result) {

            return res.json(result);
          }).catch(function (error) {
            console.log(error);
          }).finally(function () {
          });
        }
      }).catch(function (error) {
        console.log(error);
      }).finally(function () {
      });
    }
  });

});
router.post('/IngresarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      usuariosDal.ObtenerUsuario(req.body.usuario).then(function (result) {
        if (result.data.length > 0) {

          console.log(result.data[0]);
          req.body.usuario_id = result.data[0].usuario_id;
          console.log(req.body);
          paisesDal.InsertarPais(req.body).then(function (result) {

            paisesDal.ObtenerPaises(req.body.usuario_id).then(function (result) {

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
    }
  });
});
router.put('/ModificarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log("modificar pais: " + JSON.stringify(req.body));
      usuariosDal.ObtenerUsuario(req.body.usuario).then(function (result) {
        if (result.data.length > 0) {
          req.body.usuario_id = result.data[0].usuario_id;
          paisesDal.ModificarPais(req.body.pais_id, req.body).then(function (result) {

            paisesDal.ObtenerPaises(req.body.usuario_id).then(function (result) {
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
    }
  });
});

router.delete('/EliminarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log("usuario");
      console.log(req.query.usuario);
      usuariosDal.ObtenerUsuario(req.query.usuario).then(function (result) {
        if (result.data.length > 0) {
          req.query.usuario_id = result.data[0].usuario_id;
          paisesDal.EliminarPais(req.query.pais_id).then(function (result) {
            paisesDal.ObtenerPaises(req.query.usuario_id).then(function (result) {

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
    }
  });
});

module.exports = router;