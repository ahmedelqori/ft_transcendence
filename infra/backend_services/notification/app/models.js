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
            required: ['level', 'message', 'to'],
            properties: {
                id: {type: 'integer'},
                level: {type: 'string'},
                message: {type: 'string'},
                to: {type: 'integer'}
            }
        }
    }
}