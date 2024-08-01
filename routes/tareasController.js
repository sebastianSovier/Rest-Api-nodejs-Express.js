
const helper = require('../helper');
const axios = require('axios').default;
const https = require('https');
require('dotenv').config();
const instance = axios.create({
  baseURL: process.env.URLCORELOCAL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  responseType: "json",
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: { "Content-Type": "application/json" }
});
const cron = require('node-cron');



cron.schedule('0 10 * * *', function (now) {
  instance.post('/Countries/TodosLosPaisesByUsuarios'
  ).then(function (response) {
    if (response && response.data) {
      helper.sendEmail(response.data);
    }
  })
    .catch(function (error) {
      console.log(error);
      helper.logger.error(error);
    })
    .finally(function () {
    });

});

cron.schedule('*/5 * * * *', function (now) {
  instance.post('/Session/CierreSessionesInactivas'
  ).then(function (response) {
    //console.log(response);
  })
    .catch(function (error) {
      console.log(error);
      helper.logger.error(error);
    })
    .finally(function () {
    });

});