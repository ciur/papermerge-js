import {DgEvents} from "../events";
import {human_size} from "../utils";
import {get_parent_id} from "../utils";
import $ from "jquery";


export class DgUploadListItem {

    constructor(file, lang) {
        this._title = file.name;
        this._size = file.size; // in Bytes, as integer number
        this._lang = lang;
        this._status = DgUploadListItem.INIT
        this._file = file;
        this._file_type = file.type;
        this._progress = 0; // integer (0..100)
        this._dom_ref = $(this.get_template());
        this._events = new DgEvents();
    }

    subscribe_event(name, handler, context) {
        this._events.subscribe(name, handler, context);
    }

    get dom_ref() {
        return this._dom_ref;
    }

    static get INIT() {
        // this is initial state
        // before uploading starts
        return "init";
    }

    static get UPLOAD_START() {
        return "upload_start";
    }

    static get UPLOAD_ERROR() {
        return "upload_error";
    }

    static get UPLOAD_SUCCESS() {
        return "upload_success";
    }

    static get UPLOAD_PROGRESS() {
        return "upload_progress";
    }

    is_success() {
        return this._status == DgUploadListItem.UPLOAD_SUCCESS;
    }

    is_error() {
        return this._status == DgUploadListItem.UPLOAD_ERROR;
    }

    is_progress() {
        return this._status == DgUploadListItem.UPLOAD_PROGRESS;
    }

    set_status_success() {
        this.set_status(DgUploadListItem.UPLOAD_SUCCESS);
    }

    set_status_error() {
        this.set_status(DgUploadListItem.UPLOAD_ERROR);
    }

    set_status_progress() {
        this.set_status(DgUploadListItem.UPLOAD_PROGRESS);
    }

    set_status(status) {
        
        if ( status == DgUploadListItem.UPLOAD_ERROR ) {
            this._dom_ref.addClass("bg-c-fail-faded");
            this._dom_ref.find("li.status").removeClass("spinner");
            this._status = DgUploadListItem.UPLOAD_ERROR;

        } else if (status == DgUploadListItem.UPLOAD_SUCCESS ) {
            
            this._dom_ref.addClass("bg-c-success-faded");
            this._dom_ref.find("li.status").addClass("success-wire");
            this._dom_ref.find("li.status").removeClass("spinner");
            this._status = DgUploadListItem.UPLOAD_SUCCESS;

        } else if (status == DgUploadListItem.UPLOAD_PROGRESS) {
            this._dom_ref.find("li.status").addClass("spinner");
            this._status = DgUploadListItem.UPLOAD_PROGRESS;
        }
    }

    get_template() {
        let templ = `
        <li class="file">
            <ul class="horizontal fl-j-space-between fl-i-center">
                <li class="status"></li>
                <li class="filename">${this._title}</li>
                <li class="size">${this.get_human_size()}</li>
                <li class="lang">${this._lang}</li>
        </li>
        `;

        return templ;
    }

    set_progress(percent) {
        // percentage = (0..100), as integer
        this._progress = percent;
        this.dom_ref.attr("style", `background-size: ${percent}% 100%`);
    }

    _build_form_data() {
        let form_data;

        form_data = new FormData();
        form_data.append("language", this._lang);
        form_data.append("file_name", this._title);
        form_data.append("file_type", this._file_type);
        form_data.append("parent", get_parent_id());
        form_data.append("file", this._file);

        return form_data;
    }

    send() {
        let xhr, percent, token, that = this;

        xhr = new XMLHttpRequest();
        xhr.addEventListener('progress', function(e){
            if (e.lengthComputable) {
                percent = Math.round((e.loaded * 100) / e.total);
                // notify subscribers of "upload_progress" event
                that._events.notify(
                    DgUploadListItem.UPLOAD_PROGRESS,
                    that,
                    percent
                );
            }
        });

        function transferFailed(e) {
            console.log("ERROR");
            that._events.notify(
                DgUploadListItem.UPLOAD_ERROR,
                that
            );
        }

        function transferComplete(e) {
            if (e.currentTarget.status == 200) {
                that._events.notify(
                    DgUploadListItem.UPLOAD_SUCCESS,
                    that
                );                
            }
            if (e.currentTarget.status == 500) {
                that._events.notify(
                    DgUploadListItem.UPLOAD_ERROR,
                    that
                );
            }

        }

        function transferCanceled(e) {
            console.log("Canceled");
        }

        xhr.addEventListener("abort", transferCanceled);
        xhr.addEventListener("error", transferFailed);
        xhr.addEventListener("load", transferComplete);

        token = $("[name=csrfmiddlewaretoken]").val();

        xhr.open("POST", "/upload/");
        xhr.setRequestHeader(
            "X-CSRFToken",
            token
        )

        xhr.send(this._build_form_data());
        
        this._events.notify(
            DgUploadListItem.UPLOAD_START,
            this,
        );
    }

    get_human_size() {
        return human_size(this._size);
    }
}