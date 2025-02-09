/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema.createTable('pong_player', (table) => {
    table.increments('id').primary();
    table.string('username', 60).notNullable();
    table.string('email', 255).notNullable();
    table.string('first_name', 30);
    table.string('last_name', 30);
    table.string('bio', 500);
    table.string('avatar_url');
    table.enum('status', ['ON', 'OF', 'IG']).defaultTo('ON');
    table.boolean('two_FA').defaultTo(false);
    table.dateTime('created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  
};


