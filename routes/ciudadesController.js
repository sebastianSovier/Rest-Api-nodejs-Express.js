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
  headers: { "Content-Type": "application/json" }
});

router.get('/CiudadesPais', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      const request = helper.decryptQuery(req.query.data);
      instance.post('/Ciudades/CiudadesPais',
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
          return res.status(500).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});
router.post('/IngresarCiudad', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      const request = helper.decrypt(req.body.data);
      instance.post('/Ciudades/IngresarCiudad',
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
          return res.status(500).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});
router.post('/ImportarCiudad', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      const request = helper.decrypt(req.body.data);
      instance.post('/Ciudades/GetDataFromExcel',
        request, { headers: { "Authorization": "Bearer " + helper.reqToken(req) } }
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify(response.data)) });
        }
      })
        .catch(function (error) {
          console.log(error);
          //helper.logger.error(error);
          return res.status(500).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});

router.put('/ModificarCiudad', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      const request = helper.decrypt(req.body.data);
      instance.post('/Ciudades/ModificarCiudad',
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
          return res.status(500).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});
router.delete('/EliminarCiudad', helper.verifyToken, async function (req, res, next) {
  jwt.verify(req.token, process.env.secret, (err, authdata) => {
    if (err) {
      return res.sendStatus(403);
    } else {
      const request = helper.decryptQuery(req.query.data);
      instance.post('/Ciudades/EliminarCiudad',
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
          return res.status(500).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } })) });
        })
        .finally(function () {
        });
    }
  });
});

module.exports = router;