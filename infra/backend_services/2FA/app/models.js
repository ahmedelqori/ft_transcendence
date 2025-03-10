import { Model } from "objection";



class db extends Model {
  static get tableName() {
    return 'secrets';
  }

    static get idColumn() {
        return 'user_id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['secret'],
            properties: {
                user_id: { type: 'integer' },
                secret: { type: 'string' },
            }
        }
    }
};


export default db;