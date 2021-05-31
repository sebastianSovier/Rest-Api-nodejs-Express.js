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
    res.json(await ciudadesDal.InsertarCiudad(req.body));
  } catch (err) {
    console.error(`Error al insertar ciudad: `, err.message);
    next(err);
  }
});
router.put('/ModificarCiudad', helper.verifyToken, async function (req, res, next) {
  try {
    ciudadesDal.ModificarCiudad(req.body);
    await usuarioDal.ObtenerUsuario(req.body.Username).then(function (result) {
      try {
        console.log("result:" + result.data[0].contrasena);
        if (req.body.Password === req.body.Password) {
          console.log(result);
          var token = jwt.sign({ id: result.data[0].usuario_id }, config.secret, {
            expiresIn: "1h"
          });
          global.token = token;
          return res.status(200).send({ auth: true, access_Token: token });
        } else {
          return res.status(401).send({ auth: false, mensaje: "acceso no autorizado" });
        }
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
router.delete('/:id', helper.verifyToken, async function (req, res, next) {
  try {
    res.json(await ciudadesDal.EliminarCiudad(req.params.pais_id));
  } catch (err) {
    console.error(`Error al eliminar ciudad: `, err.message);
    next(err);
  }
});



module.exports = router;