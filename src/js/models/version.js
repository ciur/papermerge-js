import _ from "underscore";
import { Model } from 'backbone';

export class Version extends Model {

    urlRoot() {
        return '/admin/version/';
    }

}