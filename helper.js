
const ExcelJS = require('exceljs');
const CryptoJS = require("crypto-js");
const config = require("./config");
const fs = require('fs');
const axios = require('axios').default;
require('dotenv').config();
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const admin = require("firebase-admin");
const path = require('path');
const serviceAccount = require("./path/proyecto-angular-12-firebase-adminsdk-3b0cj-ba2223cc30.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://proyecto-angular-12-default-rtdb.firebaseio.com"
});
const auth = admin.auth();


function getOffset(currentPage = 1, listPerPage) {
  return (currentPage - 1) * [listPerPage];
}

function encrypt(data) {
  if (process.env.encrypt == true) {
    const resp = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.secret).toString();
    return resp;
  } else {
    return data;
  }
}
function decrypt(data) {
  console.log(process.env.encrypt)
  if (process.env.encrypt == true) {
    const bytes = CryptoJS.AES.decrypt(data, process.env.secret);
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
    const bytes = CryptoJS.AES.decrypt(data.toString(), process.env.secret);
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

async function createAssessment(token, tokenv2) {
  if (tokenv2) {
    token = tokenv2;
    secretkey = process.env.secretrecaptchav2;
    const result = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${token}`,
      {},
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        },
      },
    );
    result.data.score = 1;
    return result.data;
  } else {
    projectID = process.env.projectID;
    recaptchaAction = process.env.recaptchaAction
    recaptchaKey = process.env.recaptchaKey;



    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(projectID);
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

    if (!response.tokenProperties.valid) {
      console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
      return { success: false, score: null };
    }
    if (response.tokenProperties.action === recaptchaAction) {
      console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
      response.riskAnalysis.reasons.forEach((reason) => {
        console.log(reason);
      });

      return { success: true, score: response.riskAnalysis.score };
    } else {
      console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
      return { success: false, score: null };
    }
  }
}
async function validateUser(correo, password) {
  let token = "";
  const searchUser = await admin.auth().getUserByEmail(correo);
  if (searchUser && searchUser.uid) {
    const createToken = await auth.createCustomToken(searchUser.uid)
    if (createToken) {
      token = createToken;
    } else {
      console.error('Error al crear el token personalizado:', error);
    }
  } else {
    const createUser = await admin.auth().createUser({
      email: correo,
      password: password,
    });
    if (createUser && createUser.uid) {
      const createToken = await auth.createCustomToken(userRecord.uid)
      if (createToken) {
        token = createToken;
      } else {
        console.error('Error al crear el token personalizado:', error);
      }

    } else {
      console.error('Error al crear el token personalizado:', error);
    }
  }
  console.log("token")
  console.log(token)
  return token;
}

async function createPdf() {
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const doc = new PDFDocument;
  const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus.  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl.';

  doc.fontSize(8);
  doc.text(`This text is left aligned. ${lorem}`, {
    width: 410,
    align: 'left'
  }
  );
  //doc.pipe(res);                                       // HTTP response
  doc.image('./images/world.jpg', 0, 15, { width: 300 })
    .text('Proportional to width', 0, 0);

  // add stuff to PDF here using methods described below...

  // finalize the PDF and end the stream
  doc.pipe(fs.createWriteStream(path.join(__dirname, "./path/file.pdf"))); // write to PDF

  doc.end();
  return "";
}
function todayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedToday = dd + '/' + mm + '/' + yyyy;
  return formattedToday;
}

async function sendEmail(object) {
  await createPdf();


  const nodemailer = require('nodemailer');

  let textoDeCorreo = "Estimad@ " + object.nombre + "<br> Con fecha " + todayDate() + " se adjunta pdf con sus registros: <br><br>";

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'secros18@gmail.com',
      pass: 'khbw uozi shmo tfly'
    }
  });

  const mailOptions = {
    from: "paises@paisesmundo.cl",
    to: object.correo,
    subject: 'Pdf Paises y Ciudades',
    text: '',
    html: textoDeCorreo,
    attachments: { filename: "file.pdf", path: path.join(__dirname, "./path/file.pdf"), contentType: 'application/pdf' }

  };

  transporter.sendMail(mailOptions, function (error, cb) {
    console.log(error);
    try {
      fs.unlinkSync(path.join(__dirname, "./path/file.pdf"))
    } catch (err) {
      console.error(err)
    }

  });
}
const cron = require('node-cron');
//min hr day mon year
cron.schedule('10 10 * * *', async function (now) {
  await sendEmail();

});


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
  sendEmail
}