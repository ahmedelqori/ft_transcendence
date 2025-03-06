// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    client: 'sqlite3',
    connection: {
      filename: './database/sqlite.db'
    },
    useNullAsDefault: true
};
