exports.up = function(knex) {
  return knex.schema.createTable('notif', (table) => {
    table.increments('id');
    table.integer('to');
    table.string('type');
    table.string('payload');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notif');
};
