const express = require('express');
const router = express.Router();
const usuarioDal = require('../services/usuariosDal');
var jwt = require('jsonwebtoken');
var config = require('../config');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
/*
var cors = require('cors');
var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
router.use(cors(corsOptions));
*/
router.get('/ObtenerUsuarios', async function (req, res, next) {
    try {
        res.json(await usuarioDal.ObtenerUsuarios());
    } catch (err) {
        console.error(`Error al obtener usuarios: `, err.message);
        next(err);
    }
});

router.get('/', async function (req, res, next) {
    try {
        res.json(await usuarioDal.ObtenerUsuario());
    } catch (err) {
        console.error(`Error al obtener usuario: `, err.message);
        next(err);
    }
});
router.post('/Login', urlencodedParser, function (req, res) {
    console.log(req.body.Username + "  " + req.body.Password);
    err = "";
    if (!req.body.Username && !req.body.Password) {
        console.log(req.Username + "  " + req.Password);
        err = "invalid";
    }
    if (err === "invalid") return res.status(500).send("There was a problem validando the user.")
    // create a token
    usuarioDal.ObtenerUsuario(req.body.Username).then(function (result) {
        console.log(result);
        console.log(result.data.length);

        if (result.data.length > 0) {
            console.log(result.data[0].contrasena);
            if (req.body.Password === result.data[0].contrasena) {
                console.log("result:" + result.data[0].contrasena);
                console.log(result);
                var token = jwt.sign({ id: result.data[0].usuario_id }, config.secret, {
                    expiresIn: "1h"
                });
                //global.token = token;
                return res.status(200).send({ auth: true, access_Token: token });
            } else {
                return res.status(200).send({ Error: "98", auth: false, mensaje: "usuario no existe" });
            }
        } else {
            return res.status(200).send({ Error: "98", auth: false, mensaje: "usuario no existe" });
        }
    }).catch(function (error) {
        console.log(error);
    }).finally(function () {
    });

});

router.post('/IngresarUsuario', async function (req, res, next) {
    await usuarioDal.CrearUsuario(req.body).then(function (result) {
        try {
            return res.status(200).send({ datos: "ok" });
        } catch (error) {
            console.log(error);
            return res.status(400).send({ datos: { Error: "error al crear usuario" } });
        }
    }).catch(function (error) {
        console.log(error);
        return res.status(400).send({ datos: { Error: "hubo un problema" } });
    }).finally(function () {
    });
});

module.exports = router;