const express = require('express');
const router = express.Router();
const helper = require('../helper');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const axios = require('axios').default;
const https = require('https');
const admin = require("firebase-admin");

const serviceAccount = require("../path/proyecto-angular-12-firebase-adminsdk-3b0cj-ba2223cc30.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://proyecto-angular-12-default-rtdb.firebaseio.com"
});
const auth = admin.auth();

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
    console.log(req.Username + "  " + req.Password);
    err = "invalid";
  }
  if (err === "invalid") return res.status(500).send("There was a problem validating the user.")
  const validToken = await helper.createAssessment(request.token);
  console.log("validToken");
  console.log(validToken);
  instance.post('/Account/Login',
    request
  ).then(function (response) {

    console.log(response.data);
    if (response && response.data) {
      if (response.data.auth == true) {
        admin.auth().getUserByEmail(response.data.correo)
          .then((userRecord) => {
            auth.createCustomToken(userRecord.uid)
              .then((customToken) => {
                return res.status(200).send({ data: helper.encrypt(JSON.stringify({ auth: response.data.auth, access_Token: response.data.access_Token, tokenFirebase: customToken })) });
              })
              .catch((error) => {
                console.error('Error al crear el token personalizado:', error);
              });
          })
          .catch((error) => {
            admin.auth().createUser({
              email: response.data.correo,
              password: request.Password,
            })
              .then((userRecord) => {
                console.log('Successfully created new user:', userRecord.uid);
                auth.createCustomToken(userRecord.uid)
                  .then((customToken) => {
                    console.log('Token personalizado:', customToken);
                    return res.status(200).send({ data: helper.encrypt(JSON.stringify({ auth: response.data.auth, access_Token: response.data.access_Token, tokenFirebase: customToken })) });
                  })
                  .catch((error) => {
                    console.error('Error al crear el token personalizado:', error);
                  });
              })
              .catch((error) => {
                console.error('Error creating user:', error);
              });
          });
      } else {
        console.log("aqui1");
        return res.status(403).send({ data: helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: "Usuario o contrasena incorrecto" })) });
      }
    } else {
      console.log("aqui2");
      return res.status(403).send({ data: helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: "Usuario o contraseña incorrecto" })) });
    }
  })
    .catch(function (error) {
      console.log(error);
      helper.logger.error(error);
      return res.status(200).send({ data: helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: "Usuario o contraseña incorrecto" })) });
    })
    .finally(function () {
    });
});

router.post('/IngresarUsuario', async function (req, res, next) {
  console.log(helper.decrypt(req.body.data))
  const request = helper.decrypt(req.body.data);
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(request.contrasena, salt, function (err, hash) {
      request.contrasena = hash;
      instance.post('/Account/IngresarUsuario', request
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data) {
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: "ok" })) });
        } else {
          console.log("aqui2");
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "error al crear usuario" } })) });
        }
      })
        .catch(function (error) {
          console.log(error);
          helper.logger.error(error);
          return res.status(200).send({ data: helper.encrypt(JSON.stringify({ datos: { Error: "error al crear usuario" } })) });
        })
        .finally(function () {
        });
    });
  });
});

module.exports = router;