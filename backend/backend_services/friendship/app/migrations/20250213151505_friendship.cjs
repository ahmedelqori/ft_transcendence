exports.up = function(knex) {
    return knex.schema.createTable('friendship', table => {
        table.increments('id').primary();
        table.integer('sender_id').notNullable();
        table.integer('received_id').notNullable();
        table.string('requested_at').notNullable();
        table.enu('status', ['PN', 'AC', 'BL']).defaultTo('PN');
    })
};

exports.down = function() {
  
};
