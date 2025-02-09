import { Model } from 'objection';

class Player extends Model {
  static get tableName() {
    return 'pong_player'; // Match your database table name
  }

  static get idColumn() {
    return 'id'; // Primary key
  }

  // Table schema validation (optional)
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['username', 'email'], // Required fields

      properties: {
        id: { type: 'integer' },
        username: { type: 'string', maxLength: 60 },
        email: { type: 'string', format: 'email', maxLength: 255 },
        first_name: { type: 'string', maxLength: 30, nullable: true },
        last_name: { type: 'string', maxLength: 30, nullable: true },
        bio: { type: 'string', maxLength: 500, nullable: true },
        avatar_url: { type: 'string', format: 'uri', nullable: true },
        status: { 
          type: 'string', 
          enum: ['ON', 'OF', 'IG'], // Equivalent to STATUS_CHOICES 
          default: 'ON',
        },
        two_FA: { type: 'boolean', default: false },
        created_at: { type: 'string', format: 'date-time', nullable: true },
      },
    };
  }

  // Hooks for validation or manipulation
  $beforeInsert() {
    this.created_at = new Date().toISOString(); // Auto-set `created_at`
  }

}

export default Player;