import { Model } from 'objection';

class Player extends Model {
  static get tableName() {
    return 'pong_player';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['username', 'email'],

      properties: {
        id: { type: 'integer' },
        username: { type: 'string', maxLength: 60 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        first_name: { type: 'string', maxLength: 30, nullable: true },
        last_name: { type: 'string', maxLength: 30, nullable: true },
        bio: { type: 'string', maxLength: 500, default: ''},
        avatar_url: { type: 'string', format: 'uri', nullable: true },
        status: { 
          type: 'string', 
          enum: ['ON', 'OF', 'IG'],
          default: 'ON',
        },
        two_FA: { type: 'boolean', default: false },
        created_at: { type: 'string', format: 'date-time', nullable: true },
      },
    };
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
  }

}

export default Player;