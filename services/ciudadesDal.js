const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function ObtenerCiudades(pais_id) {
    const rows = await db.query(
        `SELECT ciudad_id, pais_id, nombre_ciudad, poblacion, region, fecha_registro, latitud, longitud
    FROM Ciudades where pais_id = ? order by pais_id`,
    [pais_id]
    );
    const data = helper.emptyOrRows(rows);

    return {
        data
    }
}

async function InsertarCiudad(CiudadRequest) {
    const result = await db.query(
        `INSERT INTO Ciudades 
    (pais_id, nombre_ciudad, poblacion, region, latitud, longitud) 
    VALUES 
    (?, ?, ?, ?, ?, ?)`,
        [
            CiudadRequest.pais_id, CiudadRequest.nombre_ciudad,
            CiudadRequest.poblacion, CiudadRequest.region, CiudadRequest.latitud, CiudadRequest.longitud
        ]
    );

    let message = 'Hubo error al Insertar ciudad';

    if (result.affectedRows) {
        message = 'Se inserto ciudad correctamente';
    }

    return { message };
}
async function ModificarCiudad(CiudadRequest) {
    const result = await db.query(
        `UPDATE Ciudades 
    SET nombre_ciudad=?, region = ?, poblacion = ?, latitud = ?, longitud = ? 
    WHERE ciudad_id=?`,
        [
            CiudadRequest.nombre_ciudad, CiudadRequest.region,
            CiudadRequest.poblacion, CiudadRequest.latitud, CiudadRequest.longitud, CiudadRequest.ciudad_id
        ]
    );

    let message = 'Error al modificar ciudad';

    if (result.affectedRows) {
        message = 'ciudad modificado correctamente';
    }

    return { message };
}

async function EliminarCiudad(ciudad_id) {
    const result = await db.query(
        `DELETE FROM Ciudades WHERE ciudad_id=?`,
        [ciudad_id]
    );

    let message = 'Error al eliminar ciudad';

    if (result.affectedRows) {
        message = 'Ciudad eliminado correctamente';
    }

    return { message };
}

module.exports = {
    ObtenerCiudades,
    InsertarCiudad,
    ModificarCiudad,
    EliminarCiudad
}