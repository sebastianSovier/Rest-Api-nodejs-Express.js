const express = require('express');
const router = express.Router();
const helper = require('../helper');
const bcrypt = require('bcrypt');
const saltRounds = 10;
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



router.post('/Login', async function (req, res) {
  err = "";
  console.log(req.body);
  const request = helper.decrypt(req.body.data);
  console.log(request);
  if (!request.Username && !request.Password) {
    console.log(request.Username + "  " + request.Password);
    err = "invalid";
  }
  if (err === "invalid") return res.status(500).send("There was a problem validating the user.")
  const validToken = await helper.createAssessment(request.token, request.tokenv2);
  if (!validToken) {
    return res.status(500).send({ data: helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: 'Internal server error', tokenRecaptcha: request.token })) });
  }
  if ((validToken && validToken.score < 0.5 && validToken.success === false) || (validToken && validToken.success === false)) {
    return res.status(200).send({ data: helper.encrypt(JSON.stringify({ Error: "3", auth: false, mensaje: "recaptcha verification failed", score: validToken.score })) })
  }
  console.log("validToken");
  console.log(validToken);
  instance.post('/Account/Login',
    request
  ).then(async function (response) {
    console.log("aquiii")
    console.log(response.data);
    if (response && response.data) {
      if (response.data.Error === "usuario online") {
        return res.status(403).send({ data: helper.encrypt(JSON.stringify({ Error: "93", auth: false, mensaje: "Usuario ya tiene session activa" })) });
      }
      else if (response.data.auth) {
        const tokenFirebase = await helper.validateUser(response.data.correo, request.Password);
        if (tokenFirebase) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ auth: response.data.auth, access_Token: response.data.access_Token, tokenFirebase: tokenFirebase })) });
        } else {
          return res.status(403).send({ data: helper.encrypt(JSON.stringify({ Error: "97", auth: false, mensaje: "Usuario o contraseña incorrecto" })) });
        }
      } else {
        return res.status(403).send({ data: helper.encrypt(JSON.stringify({ Error: "96", auth: false, mensaje: "Usuario o contrasena incorrecto" })) });
      }
    }
    else {
      return res.status(403).send({ data: helper.encrypt(JSON.stringify({ Error: "95", auth: false, mensaje: "Usuario o contraseña incorrecto" })) });
    }

  })
    .catch(function (error) {
      console.log(error);
      helper.logger.error(error);
      return res.status(500).send({ data: helper.encrypt(JSON.stringify({ Error: "94", auth: false, mensaje: "Error al validar usuario" })) });
    })
    .finally(function () {
    });
});
router.post('/Logout', async function (req, res) {
  err = "";
  console.log(req.body);
  const request = helper.decrypt(req.body.data);
  console.log(request);
  if (!request.usuario) {
    console.log(request.usuario);
    err = "invalid";
  }
  if (err === "invalid") return res.status(500).send("There was a problem validating the user.")
  const actualizarSesionReq = { usuario: request.usuario, user_activo: 'INACTIVO' }
  instance.post('/Session/ActualizarSession',
    actualizarSesionReq, { headers: { "Authorization": "Bearer " + helper.reqToken(req) } }
  ).then(async function (response) {
    return res.status(200).send({ data: helper.encrypt(JSON.stringify({ auth: false, })) });

  })
    .catch(function (error) {
      console.log(error);
      helper.logger.error(error);
      return res.status(500).send({ data: helper.encrypt(JSON.stringify({ Error: "94", auth: false, mensaje: "error al cerrar sesion" })) });
    })
    .finally(function () {
    });
});
router.post('/IngresarUsuario', async function (req, res, next) {
  console.log(helper.decrypt(req.body.data))
  const request = helper.decrypt(req.body.data);
  const validToken = await helper.createAssessment(request.token, request.tokenv2);
  if (!validToken) {
    return res.status(500).send({ data: helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: 'Internal server error', tokenRecaptcha: request.token })) });
  }
  if ((validToken && validToken.score < 0.5 && validToken.success === false) || (validToken && validToken.success === false)) {
    return res.status(200).send({ data: helper.encrypt(JSON.stringify({ Error: "3", auth: false, mensaje: "recaptcha verification failed", score: validToken.score })) })
  }
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(request.contrasena, salt, function (err, hash) {
      request.contrasena = hash;
      instance.post('/Account/IngresarUsuario', request
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data && response.data.auth) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: "ok" })) });
        } else {
          console.log("aqui2");
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "usuario ya existe" } })) });
        }
      })
        .catch(function (error) {
          console.log(error);
          helper.logger.error(error);
          return res.status(500).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "error al crear usuario" } })) });
        })
        .finally(function () {
        });
    });
  });
});

router.post('/SolicitarCodigo', async function (req, res, next) {
  console.log(helper.decrypt(req.body.data))
  const request = helper.decrypt(req.body.data);
  const validToken = await helper.createAssessment(request.token, request.tokenv2);
  if (!validToken) {
    return res.status(500).send({ data: helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: 'Internal server error', tokenRecaptcha: request.token })) });
  }
  if ((validToken && validToken.score < 0.5 && validToken.success === false) || (validToken && validToken.success === false)) {
    return res.status(200).send({ data: helper.encrypt(JSON.stringify({ Error: "3", auth: false, mensaje: "recaptcha verification failed", score: validToken.score })) })
  }
  const requestObject = { usuario: request.Username };
  instance.post('/Account/CodigoRecuperacion',
    requestObject
  ).then(async function (response) {
    console.log(response.data);
    if(response.data.cod_recover_password && response.data.correo){
      await helper.sendmailCode(response.data.correo,response.data.cod_recover_password);
    }
    return res.status(200).send({ data: helper.encrypt(JSON.stringify({ auth: true })) });

  })
    .catch(function (error) {
      console.log(error);
      helper.logger.error(error);
      return res.status(500).send({ data: helper.encrypt(JSON.stringify({ Error: "94", auth: false, mensaje: "error al cerrar sesion" })) });
    })
    .finally(function () {
    });
});
router.post('/ValidaCodigo', async function (req, res, next) {
  console.log(helper.decrypt(req.body.data))
  const request = helper.decrypt(req.body.data);
  const validToken = await helper.createAssessment(request.token, request.tokenv2);
  if (!validToken) {
    return res.status(500).send({ data: helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: 'Internal server error', tokenRecaptcha: request.token })) });
  }
  if ((validToken && validToken.score < 0.5 && validToken.success === false) || (validToken && validToken.success === false)) {
    return res.status(200).send({ data: helper.encrypt(JSON.stringify({ Error: "3", auth: false, mensaje: "recaptcha verification failed", score: validToken.score })) })
  }
  const requestObject = { usuario: request.Username, cod_recover_password: request.Codigo }
  instance.post('/Account/ValidaCodigo',
    requestObject
  ).then(async function (response) {
    if(response.data.auth){
    return res.status(200).send({ data: helper.encrypt(JSON.stringify({ auth: true })) });
    }else{
      return res.status(500).send({ data: helper.encrypt(JSON.stringify({ Error: "94", auth: false, mensaje: "error al cerrar sesion" })) });
    }

  })
    .catch(function (error) {
      console.log(error);
      helper.logger.error(error);
      return res.status(500).send({ data: helper.encrypt(JSON.stringify({ Error: "94", auth: false, mensaje: "error al cerrar sesion" })) });
    })
    .finally(function () {
    });
});
router.post('/CambiarPassword', async function (req, res, next) {
  console.log(helper.decrypt(req.body.data))
  const request = helper.decrypt(req.body.data);
  const validToken = await helper.createAssessment(request.token, request.tokenv2);
  if (!validToken) {
    return res.status(500).send({ data: helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: 'Internal server error', tokenRecaptcha: request.token })) });
  }
  if ((validToken && validToken.score < 0.5 && validToken.success === false) || (validToken && validToken.success === false)) {
    return res.status(200).send({ data: helper.encrypt(JSON.stringify({ Error: "3", auth: false, mensaje: "recaptcha verification failed", score: validToken.score })) })
  }
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(request.Password, salt, function (err, hash) {
      request.Password = hash;
      const requestObject = { usuario: request.Username, password: request.Password }
      instance.post('/Account/CambioPassword', requestObject
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data && response.data.auth) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: "ok" })) });
        } else {
          console.log("aqui2");
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "error al cambiar contraseña" } })) });
        }
      })
        .catch(function (error) {
          console.log(error);
          helper.logger.error(error);
          return res.status(500).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "error al cambiar contraseña" } })) });
        })
        .finally(function () {
        });
    });
  });
});
module.exports = router;