const express = require('express');
const router = express.Router();
const ciudadesDal = require('../services/ciudadesDal');
const helper = require('../helper');
var jwt = require('jsonwebtoken');
var config = require('../config');


router.get('/CiudadesPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    }
  });
  const request = helper.decryptQuery(req.query.data);
  console.log(request);
  ciudadesDal.ObtenerCiudades(request.pais_id).then(function (resultCiudades) {
    console.log("resultCiudades")
    console.log(resultCiudades)

      return res.status(200).send({data:helper.encrypt(JSON.stringify(resultCiudades.data))});
    
  }).catch(function (error) {
    console.log(error);
    return res.status(200).send({data:helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } }))});

  }).finally(function () {
  });

});
router.post('/IngresarCiudad', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const request = helper.decrypt(req.body.data);
      ciudadesDal.InsertarCiudad(request).then(function (result) {
        ciudadesDal.ObtenerCiudades(request.pais_id).then(function (resultCiudades) {
          console.log(resultCiudades)
          return res.status(200).send({data:helper.encrypt(JSON.stringify(resultCiudades.data))});    
        })
      }).catch(function (error) {
        console.log(error);
        return res.status(200).send({data:helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } }))});

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
      const request = helper.decrypt(req.body.data);
      console.log("request")
      console.log(request)
      ciudadesDal.ModificarCiudad(request).then(function (result) {
        ciudadesDal.ObtenerCiudades(request.pais_id).then(function (resultCiudades) {
          return res.status(200).send({data:helper.encrypt(JSON.stringify(resultCiudades.data))});

        });
      }).catch(function (error) {
        console.log(error);
        return res.status(200).send({data:helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } }))});

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
      const request = helper.decryptQuery(req.query.data);
      ciudadesDal.EliminarCiudad(request.ciudad_id).then(function (result) {
        ciudadesDal.ObtenerCiudades(request.pais_id).then(function (resultCiudades) {
          return res.status(200).send({data:helper.encrypt(JSON.stringify(resultCiudades.data))});
          

        })
      }).catch(function (error) {
        console.log(error);
        return res.status(200).send({data:helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } }))});

      }).finally(function () {
      });
    }
  });
});

module.exports = router;