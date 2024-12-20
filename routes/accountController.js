const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const axios = require('axios').default;
const https = require('https');
const helper = require('../helper.js');
require('dotenv').config();

const saltRounds = 10;

// Configuración de instancia Axios
const instance = axios.create({
  baseURL: process.env.URLCORELOCAL,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  responseType: 'json',
  headers: { 'Content-Type': 'application/json' },
});

// Middleware para validar y desencriptar el cuerpo de la solicitud
const validateAndDecrypt = async (req, res, next) => {
  try {
    const decryptedData = helper.decrypt(req.body.data);
    req.decryptedBody = decryptedData;
    next();
  } catch (error) {
    console.error('Error desencriptando la solicitud:', error);
    return res.status(400).send({ error: 'Invalid request format' });
  }
};

// Función para validar el token de reCAPTCHA
const validateToken = async (token, tokenv2) => {
  const validToken = await helper.createAssessment(token, tokenv2);
  if (!validToken || validToken.score < 0.5 || !validToken.success) {
    return { valid: false, message: 'Recaptcha verification failed' };
  }
  return { valid: true };
};

// Función para enviar respuestas cifradas
const sendEncryptedResponse = (res, statusCode, data) => {
  const encryptedData = helper.encrypt(JSON.stringify(data));
  res.status(statusCode).send({ data: encryptedData });
};

// Ruta: Login
router.post('/Login', validateAndDecrypt, async (req, res) => {
  const { Username, Password, token, tokenv2 } = req.decryptedBody;

  if (!Username || !Password) {
    return sendEncryptedResponse(res, 400, { Error: '99', mensaje: 'Invalid username or password' });
  }

  const tokenValidation = await validateToken(token, tokenv2);
  if (!tokenValidation.valid) {
    return sendEncryptedResponse(res, 403, { Error: '3', mensaje: tokenValidation.message });
  }

  try {
    const response = await instance.post('/Account/Login', { Username, Password });
    const { data } = response;

    if (data.Error === 'usuario online') {
      return sendEncryptedResponse(res, 403, { Error: '93', mensaje: 'Usuario ya tiene sesión activa' });
    }

    if (data.auth) {
      const tokenFirebase = await helper.validateUser(data.correo, Password);
      if (tokenFirebase) {
        return sendEncryptedResponse(res, 200, {
          auth: true,
          access_Token: data.access_Token,
          tokenFirebase,
        });
      }
    }

    return sendEncryptedResponse(res, 403, { Error: '96', mensaje: 'Usuario o contraseña incorrecto' });
  } catch (error) {
    console.error('Error en Login:', error);
    return sendEncryptedResponse(res, 500, { Error: '94', mensaje: 'Error al validar usuario' });
  }
});

// Ruta: Logout
router.post('/Logout', validateAndDecrypt, async (req, res) => {
  const { usuario } = req.decryptedBody;

  if (!usuario) {
    return sendEncryptedResponse(res, 400, { Error: '99', mensaje: 'Invalid user' });
  }

  try {
    await instance.post(
      '/Session/ActualizarSession',
      { usuario, user_activo: 'INACTIVO' },
      { headers: { Authorization: `Bearer ${helper.reqToken(req)}` } }
    );
    return sendEncryptedResponse(res, 200, { auth: false });
  } catch (error) {
    console.error('Error en Logout:', error);
    return sendEncryptedResponse(res, 500, { Error: '94', mensaje: 'Error al cerrar sesión' });
  }
});

// Ruta: IngresarUsuario
router.post('/IngresarUsuario', validateAndDecrypt, async (req, res) => {
  const { contrasena, ...userData } = req.decryptedBody;

  try {
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
    userData.contrasena = hashedPassword;

    const response = await instance.post('/Account/IngresarUsuario', userData);

    if (response.data.auth) {
      return sendEncryptedResponse(res, 200, { mensaje: 'Usuario creado exitosamente' });
    }

    return sendEncryptedResponse(res, 400, { Error: '95', mensaje: 'El usuario ya existe' });
  } catch (error) {
    console.error('Error en IngresarUsuario:', error);
    return sendEncryptedResponse(res, 500, { Error: '94', mensaje: 'Error al crear usuario' });
  }
});

// Otras rutas siguen un patrón similar...

module.exports = router;
