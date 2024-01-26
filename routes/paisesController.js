const express = require('express');
const router = express.Router();
const helper = require('../helper');
const jwt = require('jsonwebtoken');
const config = require('../config');
const axios = require('axios').default;
const https = require('https');
const instance = axios.create({
  baseURL: "https://localhost:44385",
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  responseType: "json",
  headers: { "Content-Type": "application/json" }
});

router.get('/TodosLosPaises', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      console.log(authdata);
      const request = helper.decryptQuery(decodeURIComponent(req.query.data));
      instance.post('/Countries/TodosLosPaises',
        request, { headers: { "Authorization": "Bearer " + helper.reqToken(req) } }
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify(response.data)) });
        }
      })
        .catch(function (error) {
          console.log(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});
router.post('/ObtenerPaisesPorFechas', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      const request = helper.decrypt(req.body.data);
      instance.post('/Countries/ObtenerPaisesPorFechas',
        request, { headers: { "Authorization": "Bearer " + helper.reqToken(req) } }
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify(response.data)) });
        }
      })
        .catch(function (error) {
          console.log(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });

});
router.get('/GetExcelPaises', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      console.log(authdata);
      const request = helper.decryptQuery(req.query.data);

      instance.post('/Countries/GetExcelPaises',
        request, { headers: { "Authorization": "Bearer " + helper.reqToken(req) } }
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data) {
          const outputData = response.data.map(Object.values);
          const workbook = helper.exportXlsx(outputData);
          workbook.xlsx.writeBuffer().then(function (result) {
            console.log(result);
            const string64 = result.toString('base64');
            return res.status(200).send({ data: helper.encrypt(JSON.stringify(string64)) });
          });
        }
      }).catch(function (error) {
        console.log(error);
        return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });

      }).finally(function () {
      });
    }
  });

});
router.post('/IngresarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      const request = helper.decrypt(req.body.data);
      instance.post('/Countries/IngresarPais',
        request, { headers: { "Authorization": "Bearer " + helper.reqToken(req) } }
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify(response.data)) });
        }
      })
        .catch(function (error) {
          console.log(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});
router.put('/ModificarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      console.log("modificar pais: " + JSON.stringify(req.body));
      const request = helper.decrypt(req.body.data);
      instance.post('/Countries/ModificarPais',
        request, { headers: { "Authorization": "Bearer " + helper.reqToken(req) } }
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify(response.data)) });
        }
      })
        .catch(function (error) {
          console.log(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});

router.delete('/EliminarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, config.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      const request = helper.decryptQuery(req.query.data);
      instance.post('/Countries/EliminarPais',
        request, { headers: { "Authorization": "Bearer " + helper.reqToken(req) } }
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify(response.data)) });
        }
      })
        .catch(function (error) {
          console.log(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});

module.exports = router;