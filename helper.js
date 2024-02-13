
const ExcelJS = require('exceljs');
const CryptoJS = require("crypto-js");
const config = require("./config");
const fs = require('fs');
require('dotenv').config();
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');


function getOffset(currentPage = 1, listPerPage) {
  return (currentPage - 1) * [listPerPage];
}

function encrypt(data) {
  if (process.env.encrypt == true) {
    const resp = CryptoJS.AES.encrypt(JSON.stringify(data), config.secret).toString();
    return resp;
  } else {
    return data;
  }
}
function decrypt(data) {
  console.log(process.env.encrypt)
  if (process.env.encrypt == true) {
    const bytes = CryptoJS.AES.decrypt(data, config.secret);
    const resp = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return resp;
  } else {
    return data;
  }

}
function decryptQuery(data) {
  const r1 = new RegExp("/", 'g')
  const r2 = new RegExp("'", 'g')
  const r3 = new RegExp("=", 'g')
  const r4 = new RegExp("&", 'g')
  console.log("data: " + data);
  let resp;
  if (process.env.encrypt == true) {
    const bytes = CryptoJS.AES.decrypt(data.toString(), config.secret);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    console.log("originalText: " + originalText);
    resp = originalText.replace(r3, ":").replace(r4, ",").trimStart('"').trimEnd('"').replace(r1, "").replace(r2, '"');
    console.log(JSON.parse("{" + resp + "}"));
  } else {
    resp = data.replace(r3, ":").replace(r4, ",").trimStart('"').trimEnd('"').replace(r1, "").replace(r2, '"');
  }
  return JSON.parse("{" + resp + "}");
}

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    // console.log(req.token);
    next();

  } else {
    // Forbidden
    return res.sendStatus(403);
  }
}
function reqToken(req) {
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    //  console.log(bearerToken);
    return bearerToken;
  } else {
    // Forbidden
    return res.sendStatus(401);
  }

}

function exportXlsx(array) {
  try {
    console.log(array);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Paises');
    sheet.addTable({
      name: 'MisPaises',
      ref: 'A1',
      headerRow: true,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        { name: 'Id', filterButton: true },
        { name: 'Pais', filterButton: false },
        { name: 'Capital', filterButton: false },
        { name: 'Region', filterButton: false },
        { name: 'Poblacion', filterButton: false },
        { name: 'fecha_registro', filterButton: false },
        { name: 'Usuario_id', filterButton: false },
        { name: 'usuario', filterButton: false },
      ],
      rows: array,
    });

    return workbook;
  } catch (error) {
    console.log("helper");
    console.log(error);
  }

}


function logToFile(message) {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedToday = dd + '_' + mm + '_' + yyyy;

  const logStream = fs.createWriteStream('Logs' + formattedToday + '.txt', { flags: 'a' });
  logStream.write(`${message}\n`);
  logStream.end();
}
const logger = {
  info: (message) => logToFile(`[INFO] ${message}`),
  warn: (message) => logToFile(`[WARN] ${message}`),
  error: (message) => logToFile(`[ERROR] ${message}`),
};

async function createAssessment(token) {
  projectID = process.env.projectID;
  recaptchaAction = process.env.recaptchaAction
  recaptchaKey = process.env.recaptchaKey;
  // Crea el cliente de reCAPTCHA.
  // TODO: almacena en caché el código de generación de clientes (recomendado) o llama a client.close() antes de salir del método.
  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);

  // Crea la solicitud de evaluación.
  const request = ({
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  });

  const [response] = await client.createAssessment(request);

  // Verifica si el token es válido.
  if (!response.tokenProperties.valid) {
    console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
    return null;
  }

  // Verifica si se ejecutó la acción esperada.
  // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
  if (response.tokenProperties.action === recaptchaAction) {
    // Obtén la puntuación de riesgo y los motivos.
    // Para obtener más información sobre cómo interpretar la evaluación, consulta:
    // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
    response.riskAnalysis.reasons.forEach((reason) => {
      console.log(reason);
    });

    return response.riskAnalysis.score;
  } else {
    console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
    return null;
  }
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
  createAssessment
}