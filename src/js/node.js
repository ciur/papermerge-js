import $ from "jquery";

export function get_current_parent_id() {
    // the root folder id, where we are now.
    return $("input#current_parent_id").val();
}

export class DgNode { 
  /*
    DgNode an abstraction of both Folder and Document DOM element in changelist view.
    
    Do not confuse it with DOM's node - concepts are completely unrelated.
    Also DgNode has nothing to do with node js. Well, maybe latter
    it will be moved as nodejs package.
  */
  constructor(id, title, dom_elem=undefined) {
    this._id = id;
    this._title = title;
    this._dom_elem = dom_elem;
  }

  static get selector() {
    // A DgNode is any dom element which
    // matches li.node selector.
    return "li.node";
  }

  addClass(cls) {
    $(this._dom_elem).addClass(cls);
  }

  get id() {
    return this._id;
  }

  get title() {
    return this._title;
  }

  get dom_elem() {
    return this._dom_elem;
  }

  static create_from_dom(dom_elem) {
    let title = $(dom_elem).find(".title > a").text();
    let id = $(dom_elem).find(".title > a").data("id");

    return new DgNode(title, id, dom_elem);
  }
}


export class DgFolder extends DgNode {

  static get selector() {
    // DgFolder is data abstraction of 
    // DOM elements this selector
    return "li.node.folder";
  }

  static create_from_dom(dom_elem) {
    /*
      A document node has its title in alt attribute of the
      anchor. Reason behind it is that text part of the
      anchor i.e. <a class="title">this is text part</a>
      can be truncated. As I said above the original 
      title is preserved in the alt attribute.
      Example:

      <a data-id="347" alt="Very Very Very Long Title.pdf">
        Very very very Lo...
      </a>
    */
    let title = $(dom_elem).find(".title > a").attr("alt");
    let id = $(dom_elem).find(".title > a").data("id");

    return new DgFolder(id, title, dom_elem);
  }
}


export class DgDocument extends DgNode {

  static get selector() {
    // DgDocument is data abstraction of 
    // DOM elements this selector
    return "li.node.document";
  }

  static create_from_dom(dom_elem) {
    /*
      A document node has its title in alt attribute of the
      anchor. Reason behind it is that text part of the
      anchor i.e. <a class="title">this is text part</a>
      can be truncated. As I said above the original 
      title is preserved in the alt attribute.
      Example:

      <a data-id="347" alt="Very Very Very Long Title.pdf">
        Very very very Lo...
      </a>
    */
    let title = $(dom_elem).find(".title > a").attr('alt');
    let id = $(dom_elem).find(".title > a").data("id");

    return new DgDocument(id, title, dom_elem);
  }
}
