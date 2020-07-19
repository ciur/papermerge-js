import _ from "underscore";
import $ from "jquery";
import { Model } from 'backbone';
import { capitalize } from "../utils";

let ALLOW = 'allow';
let DENY = 'deny';

// allowed access_item types
let ALLOWED_TYPES = [
    ALLOW,
    DENY
]


export class Permission extends Model {

    defaults() {
      return {
        id: '',
        name: '',  // e.g. admin
        model: '', // e.g. user/group
        access_type: ALLOW,
        access_inherited: false,
        permissions: {
            read: false,
            write: false,
            delete: false,
            change_perm: false,
            take_ownership: false
        }
      };
    }

    set_perm(name, checked) {
        let permissions = this.get('permissions');

        permissions[name] = checked;
        this.set({'permissions': permissions});
    }

    get_perm(name) {
        let permissions = this.get('permissions');

        return permissions[name];
    }

    set_type(access_type) {
        this.set({'access_type': access_type});
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

    human_access_type() {
        return capitalize(
            this.get('access_type')
        );
    }

    human_perms() {
        let text, permissions;
        let ch;
        let own;
        let write;
        let read;
        let del;

        permissions = this.get('permissions');

        ch = permissions[Permission.CHPERM];
        own = permissions[Permission.OWN];
        write = permissions[Permission.WRITE];
        read = permissions[Permission.READ];
        del = permissions[Permission.DEL];

        if (ch && own && write && read && del) {
            text = 'Full Control';
        } else if (read && write && !ch && !own && !del) {
            text = 'Read & Write';
        } else if (read && !write && !ch && !own && !del) {
            text = 'Read';
        } else if (read && write && !ch && !own && del) {
            text = 'Read & Write & Delete';
        } else {
            text = 'User Defined';
        }

        return text;
    }
}
