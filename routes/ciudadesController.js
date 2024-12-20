const express = require('express');
const router = express.Router();
const helper = require('../helper.js');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;
const https = require('https');
require('dotenv').config();

const instance = axios.create({
  baseURL: process.env.URLCORELOCAL,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  responseType: 'json',
  headers: { 'Content-Type': 'application/json' },
});

// Función para verificar el token JWT
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.secret, (err, authData) => {
      if (err) return reject('Token no válido');
      resolve(authData);
    });
  });
};

// Función para manejar peticiones
const handleRequest = async (endpoint, requestData, req, res) => {
  try {
    const response = await instance.post(endpoint, requestData, {
      headers: { Authorization: `Bearer ${helper.reqToken(req)}` },
    });

    if (response && response.data) {
      return res.status(200).send({ data: helper.encrypt(JSON.stringify(response.data)) });
    }
  } catch (error) {
    console.error(error);
    helper.logger?.error(error); // Verifica si `helper.logger` existe
    return res.status(500).send({
      data: helper.encrypt(JSON.stringify({ datos: { Error: 'Hubo un problema' } })),
    });
  }
};

// Rutas
router.get('/CiudadesPais', helper.verifyToken, async (req, res) => {
  try {
    await verifyToken(req.token);
    const request = helper.decryptQuery(req.query.data);
    await handleRequest('/Ciudades/CiudadesPais', request, req, res);
  } catch (error) {
    return res.status(403).send({
      data: helper.encrypt(JSON.stringify({ datos: { Error: error } })),
    });
  }
});

router.post('/IngresarCiudad', helper.verifyToken, async (req, res) => {
  try {
    await verifyToken(req.token);
    const request = helper.decrypt(req.body.data);
    await handleRequest('/Ciudades/IngresarCiudad', request, req, res);
  } catch (error) {
    return res.status(403).send({
      data: helper.encrypt(JSON.stringify({ datos: { Error: error } })),
    });
  }
});

router.post('/ImportarCiudad', helper.verifyToken, async (req, res) => {
  try {
    await verifyToken(req.token);
    const request = helper.decrypt(req.body.data);
    await handleRequest('/Ciudades/GetDataFromExcel', request, req, res);
  } catch (error) {
    return res.status(403).send({
      data: helper.encrypt(JSON.stringify({ datos: { Error: error } })),
    });
  }
});

router.put('/ModificarCiudad', helper.verifyToken, async (req, res) => {
  try {
    await verifyToken(req.token);
    const request = helper.decrypt(req.body.data);
    await handleRequest('/Ciudades/ModificarCiudad', request, req, res);
  } catch (error) {
    return res.status(403).send({
      data: helper.encrypt(JSON.stringify({ datos: { Error: error } })),
    });
  }
});

router.delete('/EliminarCiudad', helper.verifyToken, async (req, res) => {
  try {
    await verifyToken(req.token);
    const request = helper.decryptQuery(req.query.data);
    await handleRequest('/Ciudades/EliminarCiudad', request, req, res);
  } catch (error) {
    return res.status(403).send({
      data: helper.encrypt(JSON.stringify({ datos: { Error: error } })),
    });
  }
});

module.exports = router;
