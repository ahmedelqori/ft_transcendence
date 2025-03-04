exports.up = function(knex) {
  return knex.schema.createTable('notif', (table) => {
    table.increments('id');
    table.integer('to');
    table.string('level');
    table.string('message');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('notif');
};
