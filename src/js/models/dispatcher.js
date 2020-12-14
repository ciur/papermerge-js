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
export let PERMISSION_CHANGED = "permission_changed";

// sent by menu items of "select" menu to browser module
export let SELECT_ALL = "select_all";
export let SELECT_FOLDERS = "select_folders";
export let SELECT_DOCUMENTS = "select_documents";
export let DESELECT = "deselect";
export let INVERT_SELECTION = "invert_selection";
export let DOCUMENT_IMAGE_LOADED = "document_image_loaded";