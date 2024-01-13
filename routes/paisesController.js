const express = require('express');
const router = express.Router();
const paisesDal = require('../services/paisesDal');
const usuariosDal = require('../services/usuariosDal');
const helper = require('../helper');
var jwt = require('jsonwebtoken');
var config = require('../config');


router.get('/TodosLosPaises', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
   
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(authdata);
      const request = helper.decryptQuery(decodeURIComponent(req.query.data));
      usuariosDal.ObtenerUsuario(request.usuario).then(function (result) {
        console.log(result);
        if (result.data.length > 0) {
          paisesDal.ObtenerPaises(result.data[0].usuario_id).then(function (resultPaises) {
            console.log(resultPaises)
            return res.status(200).send({data:helper.encrypt(JSON.stringify(resultPaises.data[0]))});

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
router.post('/ObtenerPaisesPorFechas', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const request = helper.decrypt(req.body.data);
      usuariosDal.ObtenerUsuario(request.usuario).then(function (result) {
        if (result.data.length > 0) {

          console.log(result.data[0]);
          request.usuario_id = result.data[0].usuario_id;
          console.log(request);
          paisesDal.ObtenerPaisesPorFechas(request.fecha_desde, request.fecha_hasta, request.usuario_id).then(function (resultPaises) {
            return res.status(200).send({data:helper.encrypt(JSON.stringify(resultPaises.data[0]))});

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
router.get('/GetExcelPaises', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(authdata);
      const request = helper.decryptQuery(req.query.data);
      usuariosDal.ObtenerUsuario(request.usuario).then(function (result) {
        console.log(result);
        if (result.data.length > 0) {
          paisesDal.ObtenerPaises(result.data[0].usuario_id).then(function (result) {
            var outputData = result.data[0].map(Object.values);
            const workbook = helper.exportXlsx(outputData);
            workbook.xlsx.writeBuffer().then(function (result) {
              console.log(result);
              var string64 = result.toString('base64');
              return res.status(200).send({data:helper.encrypt(JSON.stringify(string64))});
              
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
router.post('/IngresarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const request = helper.decrypt(req.body.data);
      usuariosDal.ObtenerUsuario(request.usuario).then(function (result) {
        if (result.data.length > 0) {

          console.log(result.data[0]);
          request.usuario_id = result.data[0].usuario_id;
          console.log(request);
          paisesDal.InsertarPais(request).then(function (result) {

            paisesDal.ObtenerPaises(request.usuario_id).then(function (resultPaises) {
              console.log(resultPaises)
              return res.status(200).send({data:helper.encrypt(JSON.stringify(resultPaises.data[0]))});
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
      const request = helper.decrypt(req.body.data);
      usuariosDal.ObtenerUsuario(request.usuario).then(function (result) {
        if (result.data.length > 0) {
          request.usuario_id = result.data[0].usuario_id;
          paisesDal.ModificarPais(request.pais_id, request).then(function (result) {

            paisesDal.ObtenerPaises(request.usuario_id).then(function (resultPaises) {
              return res.status(200).send({data:helper.encrypt(JSON.stringify(resultPaises.data[0]))});


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
      const request = helper.decryptQuery(req.query.data);
      usuariosDal.ObtenerUsuario(request.usuario).then(function (result) {
        if (result.data.length > 0) {
          request.usuario_id = result.data[0].usuario_id;
          paisesDal.EliminarPais(request.pais_id).then(function (result) {
            paisesDal.ObtenerPaises(request.usuario_id).then(function (resultPaises) {

              return res.status(200).send({data:helper.encrypt(JSON.stringify(resultPaises.data[0]))});
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