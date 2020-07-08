import _ from "underscore";
import { Events } from 'backbone';

export let mg_dispatcher = _.clone(Events);

export let PARENT_CHANGED = "parent_changed";
// selection changed event is used to refresh metadata view
// for nodes i.e. while user is browsing documents and folders.
export let SELECTION_CHANGED = "selection_changed";

// page_selection_changed event is used to refresh metadata view
// in DOCUMENT VIEWER. In Document viewer, it is displayed is per Page
// If nothing is selected - metadata for first page is displayed.
export let PAGE_SELECTION_CHANGED = "page_selection_changed";
export let BROWSER_REFRESH = "browser_refresh";
