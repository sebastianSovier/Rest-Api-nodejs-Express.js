const helper = require('../helper.js');
const axios = require('axios').default;
const https = require('https');
const cron = require('node-cron');
require('dotenv').config();

// Validación de configuración crítica
if (!process.env.URLCORELOCAL) {
  throw new Error("La variable de entorno 'URLCORELOCAL' no está configurada.");
}

// Crear instancia de Axios
const axiosInstance = axios.create({
  baseURL: process.env.URLCORELOCAL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  responseType: "json",
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: { "Content-Type": "application/json" },
});

// Función genérica para manejar solicitudes Axios
const makePostRequest = async (endpoint, data = {}) => {
  try {
    const response = await axiosInstance.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error al realizar POST a ${endpoint}:`, error.message);
    helper.logger.error(`Error en ${endpoint}: ${error.stack || error}`);
    throw error;
  }
};

// Job para enviar correos diarios sobre países
cron.schedule('0 10 * * *', async () => {
  console.log("[CRON] Ejecutando envío de correos sobre países...");
  try {
    const data = await makePostRequest('/Countries/TodosLosPaisesByUsuarios');
    helper.sendEmail(data);
    console.log("[CRON] Correos enviados correctamente.");
  } catch (error) {
    console.error("[CRON] Error al enviar correos:", error.message);
  }
});

// Job para cerrar sesiones inactivas cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  console.log("[CRON] Ejecutando cierre de sesiones inactivas...");
  try {
    await makePostRequest('/Session/CierreSessionesInactivas');
    console.log("[CRON] Sesiones inactivas cerradas correctamente.");
  } catch (error) {
    console.error("[CRON] Error al cerrar sesiones inactivas:", error.message);
  }
});
