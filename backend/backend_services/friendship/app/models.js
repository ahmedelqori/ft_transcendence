import { Model } from "objection";



class Friendship extends Model {
  static get tableName() {
    return 'friendship';
  }

  static get idColumn() {
    return 'id';
  }


  static get jsonSchema(){
    return {
      type: 'object',
      required: ['sender_id', 'received_id'],

      properties: {
            id: { type: 'integer' },
            sender_id: { type: 'integer' },
            received_id: { type: 'integer' },
            requested_at: { type: 'string' },
            status: {
                type: 'string',
                enum: ['PN', 'AC', 'BL'],
                default: 'PN'
            },
        }
    };
  }


  $beforeInsert() {
    this.requested_at = new Date().toISOString();
  }

}

export default Friendship;

