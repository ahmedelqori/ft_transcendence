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



module.exports = config;