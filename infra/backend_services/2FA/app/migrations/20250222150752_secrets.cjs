



exports.up = function (knex) {
    return knex.schema.createTable('secrets', (table) => {
      table.increments('user_id').primary(); // Optional: auto-incrementing ID
      table.string('secret').notNullable(); // The 'secret' column from your error
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('secrets'); // Reverses the migration
  };