const env = process.env;

const config = {
  db: { 
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'root',
    port:env.port || 3308,
    password: env.DB_PASSWORD || 'sebsov15',
    database: env.DB_NAME || 'bdpaises',
  },
  listPerPage: env.LIST_PER_PAGE || 10,
  secret:'a-very-long-radonmly-generated-secret-key-that-cannot-be-guessed'
};


module.exports = config;