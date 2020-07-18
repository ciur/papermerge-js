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
        this.acc_collection = new AccessCollection(node);
        this.acc_collection.fetch();
        this.listenTo(
            this.acc_collection, 'change', this.render()
        )
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
            acc_collection: this.acc_collection,
        }));

        this.$el.html(compiled);
        this.$el.modal();
        
        return this;
    }
};
