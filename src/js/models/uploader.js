import _ from "underscore";
import { Model, Collection } from 'backbone';

export class UploaderItem extends Model {
    defaults() {
      return {
        title: '',
        size: '',
        file: '',
        lang: '',
        status: '',
        file_type: '',
        progress: 0
      };
    }

    initialize(file, lang) {
        this.set({
            'title': file.name,
            'size': file.size,
            'lang': lang,
            'file_type': file.type,
            'progress': 0,
            'status': UploaderItem.INIT
        });
        // once uploader item instance is created
        // immediately start upload process.
        this.send();
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

    get human_size() {
      return "5KB";
    }

    send() {
      /*
      This model class does NOT use Backbone's sync. The
      reason is that we need to closely monitor the progress of file uploads.
       */
    }
}

export class Uploader extends Collection {
    get model() {
        return UploaderItem;
    }
}
