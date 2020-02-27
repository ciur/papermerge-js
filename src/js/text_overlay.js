import $ from "jquery";

Number.isNumeric = function(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

function build_svg(tag, attrs) {
    let el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  
    for (var k in attrs) {
        el.setAttribute(k, attrs[k]);
    }

    return el;
}

class DgSVGText {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
    }

    make_svg() {
        let dom = build_svg(
            'text', {
                'x': this.x,
                'y': this.y
            }
        );
        let text_node = document.createTextNode(this.text);

        dom.appendChild(text_node);

        return dom;
    }
}

class DgBBox {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    get width() {
        return this.x2 - this.x1;
    }

    get height() {
        return this.y2 - this.y1;
    }
}

export class DgTextOverlay {
    /*
        Creates an svg overlay for given image_id
    */
    constructor(
        dom_img,
        dom_parent,
        orig_img_rect,
    ) {
        /* Image width and height */
        let img_rect, height, width; 

        img_rect = dom_img.getBoundingClientRect();
        this.height = img_rect.height;
        this.width = img_rect.width;
        this.dom_img = dom_img;
        this.dom_parent = dom_parent;
        this.orig_img_rect = orig_img_rect;
    }

    make_svg_container() {
        let dom = build_svg(
            'svg', {
                'width': this.width,
                'height': this.height
            }
        );

        return dom;
    }

    fit_text_to_bbox(dest_bbox, svg_item, dg_svg_text) {
        // http://kba.cloud/hocr-spec/1.2/#bbox
        let bb = svg_item.getBBox();
        let w, h, tx, ty, ratio;

        if (!this.orig_img_rect) {
            return;
        }

        ratio = parseInt(this.width) / this.orig_img_rect.width;

        if (Number.isNumeric(bb.width) && bb.width > 0) {
            /**
                w = (img_cur_w / img_orig_w) * (server_text_w / text_w)

                img_cur_w = img width from current DOM (adjusted to fit page width)
                img_orig_w = img original width
                server_text_w = text width as per HOCR data (retrieved from server)
                text_w = width of text as in current DOM: svg.getBBox()

                ISSUE: for some elements server_text_w (dest_bbox.width in code)
                is too large, i.e. it has width of whole page. This happens because
                HOCR data is wrong. Example: 
                    <span class='ocrx_word' 
                            id='word_1_217' 
                            title='bbox 0 0 1240 1755; 
                            x_wconf 92'>:</span>

                In example above, as per server data, bbox's width (width of ":") will be
                1240 - 0 = 1240 which is obviously wrong.

                To avoid one bbox element covering whole page, below code will
                not scale all elemetns with where server_text_w / text_w > 20
            **/
            w = ratio * dest_bbox.width / bb.width;
        } else {
            return;
        }

        if (Number.isNumeric(bb.height) && bb.height > 0) {
            h = dest_bbox.height / bb.height;    
        } else {
            return;
        }

        if (!Number.isNumeric(w)) {
            console.log(`[${dg_svg_text.text}] invalid scale value. dest_bbox.width = ${dest_bbox.width}; bb.width=${bb.width}; w=${w}`);
            return;
        }
        
        tx = ratio * dest_bbox.x1 / w ;
        ty = ratio * dest_bbox.y2 / w;

        //  To avoid one bbox element covering whole page, below code will
        //  not scale all elemetns with where server_text_w / text_w > 20
        if (dest_bbox.width / bb.width <= 20) {
            svg_item.setAttribute(
                "transform",
                "scale(" + w + ")"
            );
            /*
            console.log(
                `OK w=${w}`
            );
            console.log(
                `OK width=${this.width} / orig_img_rect.width=${this.orig_img_rect.width}`
            );
            console.log(
                 `OK dest_bbox.width=${dest_bbox.width} / bb.width=${bb.width} = ratio=${ratio}`
            );
            console.log(
                `OK SVGText = [${dg_svg_text.text}]`
            );
            console.log(svg_item);
            */
        } else {
            console.log(
                `SVG Scale factor > 20:  ${dest_bbox.width / bb.width}`
            );
            console.log(
                `width=${this.width} / orig_img_rect.width=${this.orig_img_rect.width}`
            );
            console.log(
                 `dest_bbox.width=${dest_bbox.width} / bb.width=${bb.width} = ratio=${ratio}`
            );
            console.log(
                `SVGText = [${dg_svg_text.text}]`
            );
            console.log(svg_item);
        }
        svg_item.setAttribute("x", tx);
        svg_item.setAttribute("y", ty);
    }

    build_for(words_arr, highlight_text_arr) {

        let svg_container = this.make_svg_container();
        let that = this;
        let older_svg;

        if (this.dom_parent) {
            older_svg = this.dom_parent.querySelectorAll('svg');
            $(older_svg).remove();
        }

        this.dom_parent.insertBefore(
            svg_container,
            this.dom_img
        );

        words_arr.forEach(function(dom_item, index, array) {
            let x1 = dom_item.getAttribute('x1'),
                y1 = dom_item.getAttribute('y1'),
                x2 = dom_item.getAttribute('x2'),
                y2 = dom_item.getAttribute('y2');
            let bbox, dg_svg_text, svg_item;
            
            bbox = new DgBBox(x1, y1, x2, y2);

            dg_svg_text = new DgSVGText(bbox.x1, bbox.y2, dom_item.textContent);
            svg_item = dg_svg_text.make_svg();

            svg_container.appendChild( svg_item );

            that.fit_text_to_bbox(
                bbox,
                svg_item,
                dg_svg_text
            );

            // used to track back original words (i.e. for debugging)
            svg_item.setAttribute(
                'id', dom_item.getAttribute('id')
            );
            svg_item.setAttribute(
                'title', dom_item.getAttribute('title')
            );
            // changed to yellow when highliting text
            // as user search result.
            svg_item.setAttribute(
                'fill', 'transparent'
            );
            svg_item.setAttribute(
                'opacity', '0.4'
            );
            if (highlight_text_arr) {
                for(let word of highlight_text_arr) {
                    if (word == dom_item.textContent) {
                        svg_item.setAttribute(
                            'stroke', 'yellow'
                        );
                        svg_item.setAttribute(
                            'stroke-width', '10'
                        );
                    }
                }                
            }

        });

        return svg_container;
    }
}