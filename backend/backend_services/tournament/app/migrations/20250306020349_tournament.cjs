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
        table.integer('owner_id');
        table.string('tournament_name').unique();
        table.integer('players_number');
        table.enum('status', STATUS).defaultTo('CREATED');
        table.timestamp('created_at').defaultTo(knex.fn.now())
    }).createTable('tournament_players', (table) => {
        table.increments('id').primary();
        table.integer('tournament_id');
        table.integer('player_id');
        table.string('nickname');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('tournament')
    .dropTableIfExists('tournament_players');
};
