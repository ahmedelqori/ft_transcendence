// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */ 

const config = {
    client: 'sqlite3',
    connection: {
      filename: './data.db',
    },
    useNullAsDefault: true,
};



module.exports = config;