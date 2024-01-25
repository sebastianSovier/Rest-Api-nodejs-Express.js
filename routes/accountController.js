const express = require('express');
const router = express.Router();
const usuarioDal = require('../services/usuariosDal');
const helper = require('../helper');

const bcrypt = require('bcrypt');
const saltRounds = 10;
const axios = require('axios').default;
const https = require('https');
const instance = axios.create({
    baseURL:"https://localhost:44385",
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    }),
    responseType:"json",
    headers:{"Content-Type" : "application/json"}
  });
router.post('/Login',async function (req, res) {
    err = "";
    console.log(req.body);
    const request = helper.decrypt(req.body.data);
    console.log(request);
    if (!request.Username && !request.Password) {
        console.log(req.Username + "  " + req.Password);
        err = "invalid";
    }
    if (err === "invalid") return res.status(500).send("There was a problem validando the user.")

   

    instance.post('/Account/Login',
        request
      ).then(function (response) {
        console.log(response.data);
        if (response && response.data) {
                if(response.data.auth == true){               
                    return res.status(200).send({data:helper.encrypt(JSON.stringify({ auth: response.data.auth, access_Token: response.data.access_Token }))});
                }else{
                    console.log("aqui1");
                    return res.status(403).send({data:helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: "Usuario o contrasena incorrecto" }))});
                }
        }else{
            console.log("aqui2");
            return res.status(403).send({data:helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: "Usuario o contraseña incorrecto"}))});
        }
      })
      .catch(function (error) {
        console.log(error);
            return res.status(500).send({data:helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: "Usuario o contraseña incorrecto"}))});
      })
      .finally(function () {
        // always executed
      }); 
    // create a token
  /* await usuarioDal.ObtenerUsuario(request.Username).then(function (result) {
        console.log(result);
        console.log(result.data.length);
       
    }).catch(function (error) {
        console.log(error);
    }).finally(function () {
    });*/
});

router.post('/IngresarUsuario', async function (req, res, next) {
    console.log(helper.decrypt(req.body.data))
    const request = helper.decrypt(req.body.data);
     bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(request.contrasena, salt, function(err, hash) {
            request.contrasena = hash;
             usuarioDal.CrearUsuario(request).then(function (result) {
                try {
                    return res.status(200).send({data:helper.encrypt(JSON.stringify({ datos: "ok" }))});
                } catch (error) {
                    console.log(error);
                    return res.status(200).send({data:helper.encrypt(JSON.stringify({ datos: { Error: "error al crear usuario" } }))});
                }
            }).catch(function (error) {
                console.log(error);
                return res.status(200).send({data:helper.encrypt(JSON.stringify({ datos: { Error: "hubo un problema" } }))});
            });
        });
    })
});

module.exports = router;