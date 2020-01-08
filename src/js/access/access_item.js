import {DgLocale} from "../locale";

// allowed access_item types
let ALLOWED_TYPES = [
    'allow',
    'deny'
]

export class DgNormAccessItem {
    /**
        An Access Item refers to a set of allowed/denied permissions
        associated to a set of users and/or groups. This is exactly
        what permission editor form is allowing to edit.        

        However, after user hits submit button in access editor form (OK), each access 
        item is inserted as normalized i.e. one row per each user or group.

        Example: 

        Access Item:
            Margaret, Elizabeth (<-users),  employee (<-group) | deny | read & write

        But when inserted, out of single access item we get 3 normalized access items:

            Margaret  | deny | read & write
            Elizabeth | deny | read & write
            employee  | deny | read & write
    **/
    static get USER() {
        return 'user';
    }

    static get GROUP() {
        return 'group';
    }

    constructor(model_type, name, access_item) {
        this._perms = access_item.perms;
        this._type = access_item.type;
        // user | group
        this._model = model_type;
        // name of model
        this._name = name;
        // will be updated by DgAccessItems class
        // when inserting an element;
        this.jq_dom_ref = undefined;
        this._inherited = access_item.inherited;
    }

    static build_from(hash) {
        let access_item = new DgAccessItem(),
            norm_ai;

        access_item.perms = hash['permissions'];
        access_item.type = hash['access_type'];
        access_item.inherited = hash['access_inherited']

        norm_ai = new DgNormAccessItem(
            hash['model'],
            hash['name'],
            access_item
        );

        return norm_ai;
    }

    as_hash() {
        let result = {};

        result['model'] = this.model;
        result['name'] = this.name;
        result['access_type'] = this.type;
        result['permissions'] = this.perms;
        result['inherited'] = this.inherited;

        return result;
    }

    get model() {
        return this._model; 
    }

    get name() {
        return this._name;
    }

    get inherited() {
        return this._inherited;
    }

    set inherited(value) {
        this._inherited = true;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        if (ALLOWED_TYPES.indexOf(value) == -1) {
            throw "Value Error for access type";
        }
        this._type = value;
    }

    get perms() {
        return this._perms;
    }

    set perms(value) {
        this._perms = value;
    }

    icon_template() {
        let template, access = '';

        // css class group-black => has svg icon associated 
        // img/icons/group_black.svg
        // group-black-disabled => has svg icon asscociated 
        // img/icons/group_black_disabled.svg
        // same for user:
        // user-black => img/icons/user_black.svg
        // user-black-disabled => img/icons/user_black_disabled.svg
        if (this.inherited) {
            access = '-disabled';
        }

        if (this.model == 'group') {
            template = `
                <div class="icon group-black${access}">
                </div>
            `
        } else {
            template = `
                <div class="icon user-black${access}">
                </div>
            `
        }
        
        return template;
    }

    localized_type() {
        let type, locale;

        locale = new DgLocale(location.hostname);
        type = locale.gettext(this._type);

        return type;
    }

    localized_perms() {
        let locale;
        let text;
        let ch = this._perms[DgAccessItem.CHPERM];
        let own = this._perms[DgAccessItem.OWN];
        let write = this._perms[DgAccessItem.WRITE];
        let read = this._perms[DgAccessItem.READ];
        let del = this._perms[DgAccessItem.DEL];

        locale = new DgLocale(location.hostname);
        if (ch && own && write && read && del) {
            text = locale.gettext('Full Control');
        } else if (read && write && !ch && !own && !del) {
            text = locale.gettext('Read & Write');
        } else if (read && !write && !ch && !own && !del) {
            text = locale.gettext('Read');
        } else if (read && write && !ch && !own && del) {
            text = locale.gettext('Read & Write & Delete');
        } else {
            text = locale.gettext('User Defined');
        }

        return text;
    }

    get_template() {
        let template, access='enabled';
        // some of the entries are not yet in server side database
        // thus we will identify 
        // entries not by id - but by (name, model_type) pairs
        if (this.inherited) {
            access = 'disabled';
        }
        template = `<div class="ft-row row1 ${access}" 
            data-model="${this._model}"
            data-name="${this._name}"
            data-access="${access}"
            >
            <div class="ft-col width10">
               ${this.icon_template()}
            </div>
            <div class="ft-col width30">
               ${this._name}
            </div>
            <div class="ft-col width30">
                ${this.localized_type()}
            </div>
            <div class="ft-col width30">
                ${this.localized_perms()}
            </div>
        </div>        
        `;

        return template;
    }
}


export class DgAccessItem {
    constructor(norm_access_item=undefined) {
        if (!norm_access_item) {
            this._perms = {}
            this._perms[DgAccessItem.CHPERM] = false;
            this._perms[DgAccessItem.OWN] = false;
            this._perms[DgAccessItem.WRITE] = false;
            this._perms[DgAccessItem.READ] = false;
            this._perms[DgAccessItem.DEL] = false;
            this._type = 'allow';
            this._users = [];
            this._groups = [];
            this._inherited = false;
        } else {
            this._perms = norm_access_item.perms;
            this._type = norm_access_item.type;
            this._inherited = norm_access_item.inherited;
            this._users = [];
            this._groups = [];

            if (norm_access_item.model == 'user') {
                this._users.push(norm_access_item.name);
            } else if (norm_access_item.model == 'group') {
                this._groups.push(norm_access_item.name);
            }
        }
    }

    static get CHPERM() {
        return 'change_perm';
    }

    static get OWN() {
        return 'take_ownership';
    }

    static get READ() {
        return 'read';
    }

    static get WRITE() {
        return 'write';
    }

    static get DEL() {
        return 'delete';
    }

    get type() {
        return this._type;
    }

    get inherited() {
        return this._inherited;
    }

    get users() {
        return this._users;
    }

    get groups() {
        return this._groups;
    }

    get perms() {
        return this._perms;
    }

    set perms(value) {
        this._perms = value;
    }

    set type(value) {
        if (ALLOWED_TYPES.indexOf(value) == -1) {
            throw "Value Error for access type";
        }
        this._type = value;
    }

    set inherited(value) {
        this._inherited = value;
    }

    add_perm(perm) {
        this._perms[perm] = true;
    }

    del_perm(perm) {
        this._perms[perm] = false;
    }

    add_user(user_id) {
        this._users.push(user_id);
    }

    del_user(user_id) {
        let index = this._users.indexOf(user_id);
        if (index > -1) {
            this._users.splice(index, 1);
        }
    }

    add_group(group_id) {
        this._groups.push(group_id);
    }

    del_group(group_id) {
        let index = this._groups.indexOf(group_id);

        if (index > -1) {
            this._groups.splice(index, 1);
        }
    }
}