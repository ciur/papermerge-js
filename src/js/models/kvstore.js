
import _ from "underscore";
import { Model, Collection } from 'backbone';

export class KVStore extends Model {
}

export class KVStoreCollection extends Collection {
    get model() {
        return KVStore;
    }
}


export class KVStoreComp extends Model {
    get model() {
        return KVStoreComp;
    }
}

export class KVStoreCompCollection extends Collection {
}
