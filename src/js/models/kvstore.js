
import _ from "underscore";
import { Model, Collection } from 'backbone';

export class KVStore extends Model {
    defaults() {
      return {
        key: '',
        kv_inherited: false,
        kv_type: 'text',
        kv_format: undefined,
        // only used on local, not passed to the server
        current_formats: []
      };
    }

    toJSON() {
        let dict = {
            key: this.get('key'),
            kv_inherited: this.get('kv_inherited'),
            kv_type: this.get('kv_type'),
            kv_format: this.get('kv_format')
        }

        return dict;
    }

    get disabled() {
        // used to disable input form for inherited
        // kv items
        if (this.get('kv_inherited')) {
            return 'disabled';
        }
        return ''
    }
}

export class KVStoreCollection extends Collection {
    get model() {
        return KVStore;
    }
}


export class KVStoreComp extends Model {
    defaults() {
      return {
        key: '',
        kv_inherited: false,
        kv_type: 'text',
        kv_format: undefined,
        // only used on local, not passed to the server
        current_formats: []
      };
    }

    toJSON() {
        let dict = {
            key: this.get('key'),
            kv_inherited: this.get('kv_inherited'),
            kv_type: this.get('kv_type'),
            kv_format: this.get('kv_format')
        }

        return dict;
    }
}

export class KVStoreCompCollection extends Collection {
    get model() {
        return KVStoreComp;
    }
}
