const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function ObtenerUsuarios(){
  const rows = await db.query(
    `SELECT usuario_id, usuario, nombre_completo, correo, fecha_registro 
    FROM usuarios order by usuario_id`
  );
  const data = helper.emptyOrRows(rows);

  return {
    data
  }
}

async function ObtenerUsuario(usuario_id){
  console.log("usuario_id: "+usuario_id)
    const rows = await db.query(
        `SELECT usuario_id, usuario, nombre_completo,contrasena, correo, fecha_registro 
        FROM usuarios where usuario = ? order by usuario_id`,
        [usuario_id]
    );
    const data = helper.emptyOrRows(rows);
      console.log("Data"+data);
    return {
      data
    }
  }

async function CrearUsuario(UsuarioRequest){
  const result = await db.query(
    `call p_crear_usuario(?,?,?,?)`, 
    [
        UsuarioRequest.usuario, UsuarioRequest.contrasena,
        UsuarioRequest.nombre_completo, UsuarioRequest.correo
    ]
  );

  let message = 'Hubo error al Insertar pais';

  if (result.affectedRows) {
    message = 'Se inserto pais correctamente';
  }

  return {message};
}

module.exports = {
    ObtenerUsuarios,
    ObtenerUsuario,
    CrearUsuario
}