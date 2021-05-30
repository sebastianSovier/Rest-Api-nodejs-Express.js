const express = require('express');
const router = express.Router();
const usuarioDal = require('../services/usuariosDal');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');


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
router.post('/Login', async function (req, res, next) {
    try {
        console.log(req.Username + "  " + req.Password);
        err = "";
        if (req.Username && req.Password) {
            console.log(req.Username + "  " + req.Password);
            err = "invalid";
        }
        if (err === "invalid") return res.status(500).send("There was a problem validando the user.")
        // create a token
        userBd = usuarioDal.ObtenerUsuarios(req.Username);
        console.log(userBd);
        if (req.Password === userBd.contrasena) {
            var token = jwt.sign({ id:userBd.usuario_id }, config.secret, {
                expiresIn: "1h"
            });
            res.status(200).send({ auth: true, token: token });
        }
    } catch (err) {
        console.error(`Error al ingresar al app: `, err.message);
        next(err);
    }
});

router.post('/IngresarUsuario', async function (req, res, next) {
    try {
        res.json(await usuarioDal.CrearUsuario(req.body));
    } catch (err) {
        console.error(`Error al insertar usuario: `, err.message);
        next(err);
    }
});

module.exports = router;