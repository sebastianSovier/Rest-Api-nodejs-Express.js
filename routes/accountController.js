const express = require('express');
const router = express.Router();
const usuarioDal = require('../services/usuariosDal');
var jwt = require('jsonwebtoken');
var config = require('../config');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const helper = require('../helper');

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
    try {
        console.log(req.body.Username + "  " + req.body.Password);
        err = "";
        if (!req.body.Username && !req.body.Password) {
            console.log(req.Username + "  " + req.Password);
            err = "invalid";
        }
        if (err === "invalid") return res.status(500).send("There was a problem validando the user.")
        // create a token
        usuarioDal.ObtenerUsuario(req.body.Username).then(function (result) {
            try {
                console.log("result:" + result.data[0].contrasena);
                if (req.body.Password === req.body.Password) {
                    console.log(result);
                    var token = jwt.sign({ id: result.data[0].usuario_id }, config.secret, {
                        expiresIn: "1h"
                    });
                    global.token = token;
                    return res.status(200).send({ auth: true, token: token });
                } else {
                    return res.status(401).send({ auth: false, mensaje: "acceso no autorizado" });
                }
            } catch (error) {
                console.log(error);
            }
        }).catch(function (error) {
            console.log(error);
        }).finally(function () {
        });

    } catch (err) {
        console.error(`Error al ingresar al app: `, err.message);
        next(err);
    }
});

router.post('/IngresarUsuario',helper.verifyToken, async function (req, res, next) {
    try {
        res.json(await usuarioDal.CrearUsuario(req.body));
    } catch (err) {
        console.error(`Error al insertar usuario: `, err.message);
        next(err);
    }
});

module.exports = router;