const STATUS = [
    'CREATED',
    'READY',
    'STARTED',
    'COMPLETE',
];

exports.up = function(knex) {
  return knex.schema
    .createTable('tournament', (table) => {
        table.increments('id').primary();
        table.integer('owner_id').unsigned();
        table.string('tournament_name').unique();
        table.integer('players_number').unsigned();
        table.enum('status', STATUS).defaultTo('CREATED');
        table.timestamp('created_at').defaultTo(knex.fn.now())
    }).createTable('tournament_players', (table) => {
        table.increments('id').primary();
        table.integer('tournament_id').unsigned()
          .references('id')
          .inTable('tournament')
          .onDelete('CASCADE')
        table.integer('player_id').unsigned();
        table.string('nickname');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    }).createTable('tournament_settings', (table) => {
        table.increments('id').primary();
        table.integer('tournament_id').unsigned()
          .references('id')
          .inTable('tournament')
          .onDelete('CASCADE')
        table.integer('code');
        // add more settings here
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('tournament_players')
    .dropTableIfExists('tournament');
};
