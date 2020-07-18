import _ from "underscore";
import $ from "jquery";
import { Model } from 'backbone';

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
}
