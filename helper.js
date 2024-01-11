
const ExcelJS = require('exceljs');
const CryptoJS = require("crypto-js");
const config = require("./config");
function getOffset(currentPage = 1, listPerPage) {
  return (currentPage - 1) * [listPerPage];
}

function encrypt(data){
  var resp = CryptoJS.AES.encrypt(JSON.stringify(data), config.secret).toString();
  return resp;
}
function decrypt(data){
  var bytes  = CryptoJS.AES.decrypt(data,config.secret);
  var resp = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return resp;
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
    console.log(req.token);
    next();

  } else {
    // Forbidden
    res.sendStatus(403);
  }
}

function exportXlsx(array) {
  try {

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
        { name: 'Dia', filterButton: false },
      ],
      rows: array,
    });
    return workbook;
  } catch (error) {
    console.log(error);
  }

}

module.exports = {
  getOffset,
  emptyOrRows,
  verifyToken,
  exportXlsx,
  encrypt,
  decrypt
}