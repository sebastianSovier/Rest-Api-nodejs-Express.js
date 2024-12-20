const express = require('express');
const router = express.Router();
const helper = require('../helper.js');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;
const https = require('https');
require('dotenv').config();

const axiosInstance = axios.create({
  baseURL: process.env.URLCORELOCAL,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  responseType: "json",
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: { "Content-Type": "application/json" },
});

// Middleware para verificar token
const verifyTokenMiddleware = (req, res, next) => {
  jwt.verify(req.token, process.env.secret, (err, authData) => {
    if (err) {
      return res.status(403).json({
        data: helper.encrypt(JSON.stringify({ datos: { Error: "Token no válido" } })),
      });
    }
    req.authData = authData;
    next();
  });
};

// Función para manejar solicitudes a Axios
const handleAxiosRequest = async (endpoint, data, req, res) => {
  try {
    const response = await axiosInstance.post(endpoint, data, {
      headers: { Authorization: `Bearer ${helper.reqToken(req)}` },
    });
    if (response && response.data) {
      return res.status(200).json({
        data: helper.encrypt(JSON.stringify(response.data)),
      });
    }
  } catch (error) {
    console.error(error);
    helper.logger.error(error);
    return res.status(500).json({
      data: helper.encrypt(JSON.stringify({ datos: { Error: "Hubo un problema" } })),
    });
  }
};

// Rutas
router.get('/TodosLosPaises', helper.verifyToken, verifyTokenMiddleware, async (req, res) => {
  const request = helper.decryptQuery(decodeURIComponent(req.query.data));
  await handleAxiosRequest('/Countries/TodosLosPaises', request, req, res);
});

router.post('/ObtenerPaisesPorFechas', helper.verifyToken, verifyTokenMiddleware, async (req, res) => {
  const request = helper.decrypt(req.body.data);
  await handleAxiosRequest('/Countries/ObtenerPaisesPorFechas', request, req, res);
});

router.get('/GetExcelPaises', helper.verifyToken, verifyTokenMiddleware, async (req, res) => {
  const request = helper.decryptQuery(req.query.data);
  try {
    const response = await axiosInstance.post('/Countries/GetExcelPaises', request, {
      headers: { Authorization: `Bearer ${helper.reqToken(req)}` },
    });
    if (response && response.data) {
      const outputData = response.data.map(Object.values);
      const workbook = helper.exportXlsx(outputData);
      const buffer = await workbook?.xlsx.writeBuffer();
      const string64 = buffer.toString('base64');
      return res.status(200).json({
        data: helper.encrypt(JSON.stringify(string64)),
      });
    }
  } catch (error) {
    console.error(error);
    helper.logger.error(error);
    return res.status(500).json({
      data: helper.encrypt(JSON.stringify({ datos: { Error: "Hubo un problema" } })),
    });
  }
});

router.post('/IngresarPais', helper.verifyToken, verifyTokenMiddleware, async (req, res) => {
  const request = helper.decrypt(req.body.data);
  await handleAxiosRequest('/Countries/IngresarPais', request, req, res);
});

router.post('/ImportarPais', helper.verifyToken, verifyTokenMiddleware, async (req, res) => {
  const request = helper.decrypt(req.body.data);
  await handleAxiosRequest('/Countries/GetDataFromExcel', request, req, res);
});

router.put('/ModificarPais', helper.verifyToken, verifyTokenMiddleware, async (req, res) => {
  const request = helper.decrypt(req.body.data);
  await handleAxiosRequest('/Countries/ModificarPais', request, req, res);
});

router.delete('/EliminarPais', helper.verifyToken, verifyTokenMiddleware, async (req, res) => {
  const request = helper.decryptQuery(req.query.data);
  await handleAxiosRequest('/Countries/EliminarPais', request, req, res);
});

module.exports = router;
