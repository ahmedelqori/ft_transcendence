import { Model } from "objection";

export default class notif extends Model {
    static get tableName() {
        return 'notif';
    }

    static get idColumn() {
        return 'id';
    }

    static get schema () {
        return {
            type: 'object',
            required: ['type', 'payload', 'to'],
            properties: {
                id: {type: 'integer'},
                type: {type: 'string'},
                payload: {type: 'string'},
                to: {type: 'integer'}
            }
        }
    }
}