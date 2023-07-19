const env = process.env;

const config = {
  db: { 
    host: env.DB_HOST || '18.117.196.27',
    user: env.DB_USER || 'secros',
    port:env.port || 3306,
    password: env.DB_PASSWORD || 'sovier',
    database: env.DB_NAME || 'bdpaises',
  },
  listPerPage: env.LIST_PER_PAGE || 10,
  secret:'papucho'
};


module.exports = config;