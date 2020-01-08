import $ from "jquery";

export class DgPageScroll {
    constructor(dom_ref, speed=0.25) {
        this._dom_ref = dom_ref;
        this._is_active = false;
        this._startX = 0;
        this._startY = 0;
        this._scrollLeft = this._dom_ref.scrollLeft;
        this._scrollTop = this._dom_ref.scrollTop;
        this._speed = speed;

        this._config_events();
    }

    _config_events() {
        let that = this;

        this._dom_ref.addEventListener('mousedown', (e) => {
          
          // dont scroll when user wants to select text
          // i.e. hovers mouse over <text> element.
          if (e.srcElement.tagName == 'text') {
            that._is_active = false;
            return;
          }

          that._is_active = true;
          that._startX = e.pageX - that._dom_ref.offsetLeft;
          that._startY = e.pageY - that._dom_ref.offsetTop;
        });

        this._dom_ref.addEventListener('mouseleave', () => {
          that._is_active = false;
        });

        this._dom_ref.addEventListener('mouseup', () => {
          that._is_active = false;
        });

        this._dom_ref.addEventListener('mousemove', (e) => {
          if(!that._is_active) { return; }

          e.preventDefault();

          const x = e.pageX - that._dom_ref.offsetLeft;
          const y = e.pageY - that._dom_ref.offsetTop;
          const walk_x = x - that._startX;
          const walk_y = y - that._startY;

          that._dom_ref.scrollLeft = that._dom_ref.scrollLeft - walk_x * that._speed;
          that._dom_ref.scrollTop = that._dom_ref.scrollTop - walk_y * that._speed;
        });
    }
}