const express = require('express');
const router = express.Router();
const helper = require('../helper');
const jwt = require('jsonwebtoken');
const config = require('../config');
const axios = require('axios').default;
const https = require('https');
require('dotenv').config();
const instance = axios.create({
  baseURL: process.env.URLCORELOCAL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  responseType: "json",
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: { "Content-Type": "application/json" }
});
const cron = require('node-cron');



cron.schedule('* 10 * * *', function (now) {
  instance.post('/Countries/TodosLosPaisesByUsuarios'
  ).then(function (response) {
    if (response && response.data) {
      helper.sendEmail(response.data);
    }
  })
    .catch(function (error) {
      console.log(error);
      helper.logger.error(error);
    })
    .finally(function () {
    });

});

cron.schedule('*/5 * * * *', function (now) {
  instance.post('/Session/CierreSessionesInactivas'
  ).then(function (response) {
    //console.log(response);
  })
    .catch(function (error) {
      console.log(error);
      helper.logger.error(error);
    })
    .finally(function () {
    });

});

router.get('/TodosLosPaises', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
    if (err) {
      console.log(err)
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
          helper.logger.error(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});
router.post('/ObtenerPaisesPorFechas', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
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
          helper.logger.error(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });

});
router.get('/GetExcelPaises', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
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
          workbook?.xlsx.writeBuffer().then(function (result) {
            console.log(result);
            const string64 = result.toString('base64');
            return res.status(200).send({ data: helper.encrypt(JSON.stringify(string64)) });
          }, error => { console.log("workbook?.xlsx"); console.log(error) });
        }
      }).catch(function (error) {
        console.log(error);
        helper.logger.error(error);
        return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });

      }).finally(function () {
      });
    }
  });

});
router.post('/IngresarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
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
          helper.logger.error(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});
router.post('/ImportarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      const request = helper.decrypt(req.body.data);
      instance.post('/Countries/GetDataFromExcel',
        request, { headers: { "Authorization": "Bearer " + helper.reqToken(req) } }
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify(response.data)) });
        }
      })
        .catch(function (error) {
          console.log(error);
          helper.logger.error(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});


router.put('/ModificarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
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
          helper.logger.error(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});

router.delete('/EliminarPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
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
          helper.logger.error(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});

module.exports = router;