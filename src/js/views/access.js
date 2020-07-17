import $ from "jquery";
import _ from "underscore";
import { Access, AccessCollection } from "../models/access";
import { View } from 'backbone';

let TEMPLATE = require('../templates/access.html');

export class AccessView extends View {
    el() {
        return $('#access-modal');
    } 

    initialize(node) {
        this.access = new Access(node);
        this.render();
    }

    events() {
        let event_map = {
        }

        return event_map;
    }

    render() {
        let compiled, context;

        context = {
        }

        compiled = _.template(TEMPLATE({
            access: this.access,
        }));

        this.$el.html(compiled);
        
        return this;
    }
};
