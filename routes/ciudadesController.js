const express = require('express');
const router = express.Router();
const ciudadesDal = require('../services/ciudadesDal');
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
router.get('/CiudadesPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    }
  });
  res.json(await ciudadesDal.ObtenerCiudades(req.query.pais_id));
});
router.post('/IngresarCiudad', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      ciudadesDal.InsertarCiudad(req.body).then(function (result) {
        ciudadesDal.ObtenerCiudades(req.body.pais_id).then(function (result) {
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
  });
});
router.put('/ModificarCiudad', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      ciudadesDal.ModificarCiudad(req.body).then(function (result) {
        ciudadesDal.ObtenerCiudades(req.body.pais_id).then(function (result) {
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
  });
});
router.delete('/EliminarCiudad', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      ciudadesDal.EliminarCiudad(req.query.ciudad_id).then(function (result) {
        ciudadesDal.ObtenerCiudades(req.query.pais_id).then(function (result) {
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
  });
});

module.exports = router;