import $ from "jquery";


export class ToastMessage {

    constructor(message, type) {
        this._message = message;
        this._type = type;
    }

    static get ERROR() {
        return "error";
    }

    static get INFO() {
        return "info";
    }

    static get WARNING() {
        return "warning";
    }

    get title() {
        if ( this._type == ToastMessage.ERROR ) {
            return "Error"; 
        } else if (this._type == ToastMessage.WARNING ) {
            return "Warning";
        }

        return "Info";
    }

    get_template() {
        let templ = `
            <div class="toast ${this._type}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="mr-auto">${this.title}</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="toast-body">
                  ${this._message}
                </div>
            </div>`;

        return templ;
    }

    show() {
        let templ = this.get_template();
        $('.toasts').html(templ);
        $('.toast').toast({'autohide': false});
        $('.toast').toast('show');
    }

}