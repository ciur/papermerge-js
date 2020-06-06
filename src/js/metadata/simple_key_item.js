
export class MgSimpleKeyItem {
    constructor(simple_key_item=undefined) {
        if (!simple_key_item) {
            this._name = undefined;
            this._inherited = false;
        } else {
            this._name = simple_key_item.name;
            this._inherited = simple_key_item.inherited;
        }
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = name;
    }

}