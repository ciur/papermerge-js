import _ from "underscore";
import { Events } from 'backbone';

export let mg_dispatcher = _.clone(Events);

export let PARENT_CHANGED = "parent_changed";
export let SELECTION_CHANGED = "selection_changed";
