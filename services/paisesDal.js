const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function ObtenerPaises(usuario_id){
  const rows = await db.query(
    `SELECT pais_id, nombre_pais, capital, region, poblacion, fecha_registro 
    FROM Paises where usuario_id = ? order by pais_id`,
    [
      usuario_id
    ]
  );
  const data = helper.emptyOrRows(rows);

  return {
    data
  }
}

async function InsertarPais(PaisRequest){
  const result = await db.query(
    `INSERT INTO Paises 
    (nombre_pais, capital, region, poblacion,usuario_id) 
    VALUES 
    (?, ?, ?, ?, ?)`, 
    [
      PaisRequest.nombre_pais, PaisRequest.capital,
      PaisRequest.region, PaisRequest.poblacion,PaisRequest.usuario_id
    ]
  );

  let message = 'Hubo error al Insertar pais';

  if (result.affectedRows) {
    message = 'Se inserto pais correctamente';
  }

  return {message};
}
async function ModificarPais(pais_id, PaisRequest){
  const result = await db.query(
    `UPDATE Paises 
    SET nombre_pais=?, capital=?, region=?, 
    poblacion=? 
    WHERE pais_id=?`, 
    [
      PaisRequest.nombre_pais, PaisRequest.capital,
      PaisRequest.region, PaisRequest.poblacion, pais_id
    ]
  );

  let message = 'Error al modificar pais';

  if (result.affectedRows) {
    message = 'pais modificado correctamente';
  }

  return {message};
}

async function EliminarPais(pais_id){
  const result = await db.query(
    `DELETE FROM Paises WHERE pais_id=?`, 
    [pais_id]
  );

  let message = 'Error al eliminar pais';

  if (result.affectedRows) {
    message = 'Pais eliminado correctamente';
  }

  return {message};
}

module.exports = {
  ObtenerPaises,
  InsertarPais,
  ModificarPais,
  EliminarPais
}