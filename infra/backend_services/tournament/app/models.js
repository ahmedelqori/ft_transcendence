import { Model } from "objection";


export class tournament extends Model {
  static get tableName() {
    return 'tournament';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['owner_id', 'tournament_name', 'players_number'],

      properties: {
        id: { type: 'integer' },
        owner_id: { type: 'integer' },
        tournament_name: { type: 'string' },
        players_number: { type: 'integer' },
        status: { type: 'string' },
        created_at: { type: 'string' },
      }
    };
  }
}

export class tournament_players extends Model {
  static get tableName() {
    return 'tournament_players';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tournament_id', 'player_id'],

      properties: {
        id: { type: 'integer' },
        tournament_id: { type: 'integer' },
        player_id: { type: 'integer' },
        round: { type: 'integer' },
        nickname: { type: 'string' },
        created_at: { type: 'string' },
      }
    };
  }
}

export class tournament_settings extends Model {
  static get tableName() {
    return 'tournament_settings';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['tournament_id', 'code'],

      properties: {
        id: { type: 'integer' },
        tournament_id: { type: 'integer' },
        code: { type: 'integer' },
      }
    };
  }
}