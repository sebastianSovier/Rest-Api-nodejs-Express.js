const ExcelJS = require('exceljs');
const Crypto = require("crypto");
const CryptoJS = require("crypto-js");
const fs = require('fs');
const axios = require('axios').default;
require('dotenv').config();
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const admin = require("firebase-admin");
const path = require('path');
const serviceAccount = require("./path/proyecto-angular-12-firebase-adminsdk-3b0cj-ba2223cc30.json");
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// Firebase initialization
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://proyecto-angular-12-default-rtdb.firebaseio.com"
});
const auth = admin.auth();

// Utility Functions
const getOffset = (currentPage = 1, listPerPage) => (currentPage - 1) * listPerPage;

const encrypt = (data) => {
  if (!process.env.encrypt) return data;

  const salt = Crypto.randomBytes(16);
  const iv = Crypto.randomBytes(16);
  const key = Crypto.pbkdf2Sync(process.env.secret, salt, 1000, 32, 'sha256');
  const cipher = Crypto.createCipheriv('aes-256-cbc', key, iv);

  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]).toString('hex');
  return { iv: iv.toString('hex'), salt: salt.toString('hex'), ciphertext };
};

const decrypt = (data) => {
  if (!process.env.encrypt) return data;

  try {
    const { iv, salt, ciphertext } = data;
    const key = Crypto.pbkdf2Sync(process.env.secret, Buffer.from(salt, 'hex'), 1000, 32, 'sha256');
    const decipher = Crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));

    const decrypted = Buffer.concat([decipher.update(Buffer.from(ciphertext, 'hex')), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8')).body;
  } catch (error) {
    throw new Error('Desencriptación fallida: ' + error.message);
  }
};

const decryptQuery = (data) => {
  const replacePatterns = [
    { regex: /\//g, replacement: '' },
    { regex: /'/g, replacement: '"' },
    { regex: /=/g, replacement: ':' },
    { regex: /&/g, replacement: ',' }
  ];

  let response = data;
  if (process.env.encrypt) {
    const decrypted = CryptoJS.AES.decrypt(data, process.env.secret).toString(CryptoJS.enc.Utf8);
    response = replacePatterns.reduce((acc, { regex, replacement }) => acc.replace(regex, replacement), decrypted);
  }

  return JSON.parse(`{${response}}`);
};

const emptyOrRows = (rows) => rows || [];

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
    req.token = token;
    next();
  } else {
    res.status(403).send({ data: encrypt({ datos: { Error: "Token no válido" } }) });
  }
};

const reqToken = (req) => req.headers['authorization']?.split(' ')[1] || null;

const exportXlsx = (array) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Paises');

  sheet.addTable({
    name: 'MisPaises',
    ref: 'A1',
    headerRow: true,
    style: { theme: 'TableStyleDark3', showRowStripes: true },
    columns: [
      { name: 'Id', filterButton: true },
      { name: 'Pais' },
      { name: 'Capital' },
      { name: 'Region' },
      { name: 'Poblacion' },
      { name: 'fecha_registro' },
      { name: 'Usuario_id' },
      { name: 'usuario' },
    ],
    rows: array,
  });

  return workbook;
};

const logToFile = (message) => {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0].replace(/-/g, '_');
  const logStream = fs.createWriteStream(`Logs/Logs_${formattedToday}.txt`, { flags: 'a' });
  logStream.write(`${message}\n`);
  logStream.end();
};

const logger = {
  info: (message) => logToFile(`[INFO] ${message}`),
  warn: (message) => logToFile(`[WARN] ${message}`),
  error: (message) => logToFile(`[ERROR] ${message}`),
};

const createAssessment = async (token, tokenv2) => {
  if (tokenv2) {
    const result = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {},
      { params: { secret: process.env.secretrecaptchav2, response: tokenv2 } }
    );
    return { ...result.data, score: 1 };
  } else {
    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(process.env.projectID);

    const [response] = await client.createAssessment({
      parent: projectPath,
      assessment: { event: { token, siteKey: process.env.recaptchaKey } },
    });

    if (!response.tokenProperties.valid) {
      return { success: false, score: null };
    }

    const validActions = [process.env.recaptchaAction, process.env.recaptchaAction2, process.env.recaptchaAction3];
    if (validActions.includes(response.tokenProperties.action)) {
      return { success: true, score: response.riskAnalysis.score };
    }

    return { success: false, score: null };
  }
};

const validateUser = async (correo, password) => {
  try {
    const user = await auth.getUserByEmail(correo);
    return await auth.createCustomToken(user.uid);
  } catch (error) {
    const newUser = await auth.createUser({ email: correo, password });
    return await auth.createCustomToken(newUser.uid);
  }
};

const parseMiles = (number) => {
  try {
    return new Intl.NumberFormat("es-CL").format(number);
  } catch {
    return 0;
  }
};

const sendEmail = (data) => {

  data.forEach(async usuarioPaisesCiudades => {
    if (usuarioPaisesCiudades.listPaisesSerialize != null) {
      const createPdfName = await createPdf(usuarioPaisesCiudades);
      let textoDeCorreo = "Estimad@ " + usuarioPaisesCiudades.nombre + "<br> Con fecha " + todayDate() + " se adjunta pdf con sus registros: <br><br>";
      await sendmail(textoDeCorreo, usuarioPaisesCiudades, createPdfName);
    }
  });
}
const sendmail = async (textoDeCorreo, usuarioPaisesCiudades, createPdfName) => {
  await wrapedSendMail(textoDeCorreo, usuarioPaisesCiudades, createPdfName);
}

const wrapedSendMail = async (textoDeCorreo, usuarioPaisesCiudades, createPdfName) => {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.user,
        pass: process.env.pass
      }
    });
    const mailOptions = {
      from: "paises@paisesmundo.cl",
      to: usuarioPaisesCiudades.correo,
      subject: 'Pdf Paises y Ciudades',
      text: '',
      html: textoDeCorreo,
      attachments: { filename: "file.pdf", path: path.join(__dirname, "./path/" + createPdfName), contentType: 'application/pdf' }

    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        resolve(false);
      }
      else {
        fs.unlinkSync(path.join(__dirname, "./path/" + createPdfName))

        resolve(true);
      }
    });
  });
}

const sendEmailCode = async (correo, codigo) => {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.user,
        pass: process.env.pass
      }
    });
    const mailOptions = {
      from: "app@app.cl",
      to: correo,
      subject: 'Codigo recuperacion',
      text: '',
      html: codigo,

    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        resolve(false);
      }
      else {
        resolve(true);
      }
    });
  });
}
const sendmailCode = async (correo, codigo) => {
  await sendEmailCode(correo, codigo);
}



module.exports = {
  getOffset,
  emptyOrRows,
  verifyToken,
  exportXlsx,
  encrypt,
  decrypt,
  decryptQuery,
  reqToken,
  logger,
  createAssessment,
  validateUser,
  sendEmail,
  sendmailCode
}