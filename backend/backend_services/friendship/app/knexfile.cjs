// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */ 

const config = {
    client: 'sqlite3',
    connection: {
      filename: './database/sqlite.db',
    },
    useNullAsDefault: true,
};



// const config = {
//   client: 'mysql',
//   connection: {
//     host: '127.0.0.1',
//     port: 3306,
//     user: 'your_database_user',
//     password: 'your_database_password',
//     database: 'myapp_test',
//   },
// };

module.exports = config;