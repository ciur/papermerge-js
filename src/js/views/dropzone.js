import $ from "jquery";
import { View } from 'backbone';
import { UploaderView } from "./uploader";

export class DropzoneView extends View {
  el() {
    return $('.content-wrapper');
  }

  initialize(browse) {
    /**
      instance of browse model
    */
    this.browse = browse;
  }

  events() {
      let event_map = {
        'dragenter': 'dragenter',
        'dragover': 'dragover',
        'drop': 'drop'
      }
      return event_map;
  }

  dragenter(e) {
    e.stopPropagation();
    e.preventDefault();

    $('.content-wrapper').addClass('dragover');
  }

  dragover(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  drop(e) {
    let data_transfer,
      files,
      uploader_view,
      lang
    ;

    e.stopPropagation();
    e.preventDefault();

    data_transfer = e.originalEvent.dataTransfer;
    files = data_transfer.files;

    lang = $("#lang").val();

    uploader_view = new UploaderView(
      files,
      lang,
      this.browse.get('parent_id')
    );
    $('.content-wrapper').removeClass('dragover');

  };
}
