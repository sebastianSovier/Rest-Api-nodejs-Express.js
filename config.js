const env = process.env;

const config = {
  db: { 
    host: env.DB_HOST || '3.139.87.179',
    user: env.DB_USER || 'secros',
    port:env.port || 33060,
    password: env.DB_PASSWORD || 'sovier',
    database: env.DB_NAME || 'bdpaises',
  },
  listPerPage: env.LIST_PER_PAGE || 10,
  secret:'papucho'
};


module.exports = config;