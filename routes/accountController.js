const express = require('express');
const router = express.Router();
const usuarioDal = require('../services/usuariosDal');
var jwt = require('jsonwebtoken');
var config = require('../config');
const helper = require('../helper');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const bcrypt = require('bcrypt');
const saltRounds = 10;
var CryptoJS = require("crypto-js");


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
        const resp = await usuarioDal.ObtenerUsuarios()
        res.status(200).send( helper.encrypt(JSON.stringify(resp)));
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
    err = "";
    console.log(req.body);
    const request = helper.decrypt(req.body.data);
    if (!request.Username && !request.Password) {
        console.log(req.Username + "  " + req.Password);
        err = "invalid";
    }
    if (err === "invalid") return res.status(500).send("There was a problem validando the user.")
    // create a token
    usuarioDal.ObtenerUsuario(request.Username).then(function (result) {
        console.log(result);
        console.log(result.data.length);

        if (result.data.length > 0) {
            console.log(result.data[0].contrasena)
            bcrypt.compare(request.Password, result.data[0].contrasena, function(err, resultBcrypt) {
                console.log(err)
                console.log(resultBcrypt)
                if(resultBcrypt){
                    console.log(result.data[0].contrasena)
                    var token = jwt.sign({ id: result.data[0].usuario_id }, config.secret, {
                        expiresIn: "5m"
                    });
                    return res.status(200).send({data:helper.encrypt(JSON.stringify({ auth: true, access_Token: token }))});
                    //global.token = token;
                    //return res.status(200).send();
                }else{
                    return res.status(200).send(helper.encrypt(JSON.stringify({ Error: "98", auth: false, mensaje: "contrasena incorrecta" })));
                }
            });
        }
    }).catch(function (error) {
        console.log(error);
    }).finally(function () {
    });

});

router.post('/IngresarUsuario', async function (req, res, next) {
     bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(req.body.contrasena, salt, function(err, hash) {
            req.body.contrasena = hash;
             usuarioDal.CrearUsuario(req.body).then(function (result) {
                try {
                    return res.status(200).send({ datos: "ok" });
                } catch (error) {
                    console.log(error);
                    return res.status(400).send({ datos: { Error: "error al crear usuario" } });
                }
            }).catch(function (error) {
                console.log(error);
                return res.status(400).send({ datos: { Error: "hubo un problema" } });
            });
        });
    })
});

module.exports = router;