// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
// knexfile.cjs
// knexfile.cjs
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './data.db',
    },
    useNullAsDefault: true,
  },
};
