import { Model } from 'objection';
import knex from '../knex';

Model.knex(knex);

class Game extends Model {
  static get tableName() {
    return 'games';
  }
  static get idColumn() {
    return 'id';
  }
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'genre'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        genre: { type: 'string' },
        releaseYear: { type: 'integer' }
      }
    };
  }
}

export default Game;
