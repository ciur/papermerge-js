
import _ from "underscore";
import { Model, Collection } from 'backbone';

export class KVStore extends Model {
    defaults() {
      return {
        key: '',
        kv_inherited: false
      };
    }

    toJSON() {
        let dict = {
            key: this.get('key'),
            kv_inherited: this.get('kv_inherited')
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
        kv_inherited: false
      };
    }

    toJSON() {
        let dict = {
            key: this.get('key'),
            kv_inherited: this.get('kv_inherited')
        }

        return dict;
    }
}

export class KVStoreCompCollection extends Collection {
    get model() {
        return KVStoreComp;
    }
}
