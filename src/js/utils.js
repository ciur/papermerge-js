import $ from "jquery";

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function sanitize(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]));
}

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

// polyfill for dom.remove function for IE
// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        if (this.parentNode === null) {
          return;
        }
        this.parentNode.removeChild(this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);


// Polyfill for Array.includes for IE.
// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(searchElement, fromIndex) {

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If len is 0, return false.
      if (len === 0) {
        return false;
      }

      // 4. Let n be ? ToInteger(fromIndex).
      //    (If fromIndex is undefined, this step produces the value 0.)
      var n = fromIndex | 0;

      // 5. If n ≥ 0, then
      //  a. Let k be n.
      // 6. Else n < 0,
      //  a. Let k be len + n.
      //  b. If k < 0, let k be 0.
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }

      // 7. Repeat, while k < len
      while (k < len) {
        // a. Let elementK be the result of ? Get(O, ! ToString(k)).
        // b. If SameValueZero(searchElement, elementK) is true, return true.
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        // c. Increase k by 1. 
        k++;
      }

      // 8. Return false
      return false;
    }
  });
}


export function human_size(bytes_count) {
    var 
        arr = ['B', 'KB', 'MB', 'GB', 'TB'],
        output = ""
    ;

    if (!bytes_count) {
        console.log("Invalid bytes count provided");
        return;
    };

    for (var x = bytes_count, mult = 0; x > 1; x = x/1024, mult++) {
        output = x.toFixed(1) + " " + arr[mult]; 
    };

    return output;
}

export function find_by_id(dom_id) {
    if ( document.getElementById(dom_id) ) {
        return true;
    }

    return false;
}

function get_object_id(pathname) {
  var my_regexp = /basetreenode\/(\d+)\//g,
    match;

  match = my_regexp.exec(pathname);
  if (match != null) {
    return match[1]
  }

  return -1;
}

export function get_parent_id() {
  return get_object_id(window.location.pathname);
}

export function value(elem_id) {
    var elem = document.getElementById(elem_id);

    if (!elem) {
        return undefined;
    } else {
        return elem.value;
    }
}

export function insert(tag_name, attrs) {
    let new_elem = document.createElement(tag_name),
        keys = Object.keys(attrs);

    for(let i=0; i < keys.length; i++) {
        let key = keys[i],
            value = attrs[keys[i]]
        ;
        new_elem.setAttribute(key, value);    
    }

    document.body.appendChild(new_elem);
}

export function proxy_click(from_elem_id, to_elem_id) {
    let $from_elem = $(from_elem_id),
        $to_elem = $(to_elem_id);

    if (!$from_elem) {
        console.log("dglUtils -> proxy_click -> from_elem is not defined");
        return;
    }

    $from_elem.click(function (e) {
        e.preventDefault();
        if ($to_elem) {
          $to_elem.click();
        }
    });
}


export class MgRect {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = parseInt(width);
      this.height = parseInt(height);
    }

    intersect(rect) {
      /*
      Returns true if this rectangle intersects with rect.

      Two rectangle intersect if one of them has a point inside other.
      */
      if (this.contains_point(rect.x, rect.y)) {
        return true;
      }

      if (this.contains_point(rect.x + rect.width, rect.y)) {
        return true;
      }

      if (this.contains_point(rect.x + rect.width, rect.y + rect.height)) {
        return true;
      }

      if (this.contains_point(rect.x, rect.y + rect.height)) {
        return true;
      }

      return false;
    }

    contains_point(x, y) {
      /*
        Is point (x, y) inside this rectangle ?  
      */
      let x_is_within = false, y_is_within = false;



      if (this.x <= x && x <= this.x + this.width) {  
        x_is_within = true;
      }

      if (this.y <= y && y <= this.y + this.height) {  
        y_is_within = true;
      }

      //console.log(`x: ${this.x} ${x} ${this.x + this.width}`);
      //console.log(`y: ${this.y} ${y} ${this.y + this.height}`);

      return x_is_within && y_is_within;
    }
}


export function get_url_param(param) {
    var page_url = window.location.search.substring(1),
        url_variables = page_url.split('&'),
        param_name,
        i;

    for (i = 0; i < url_variables.length; i++) {
        param_name = url_variables[i].split('=');

        if (param_name[0] === param) {
            return param_name[1] === undefined ? true : decodeURIComponent(param_name[1]);
        }
    }
};

export function get_hash_param(param) {
  /**
  Used to extract parameters after hash character.

  For example for window.location:

    http://dms.domain#30?page=3

  location.hash will be #30?page=3
  and get_hash_param('page') will return 3.

  It is used for pagination of items within a folder.
  **/
    var location_hash = window.location.hash,
        search_str,
        url_variables,
        param_name,
        i;

    if (location_hash && location_hash.split('?').length > 1) {

      search_str = location_hash.split('?')[1];
      url_variables = search_str.split('&');

      for (i = 0; i < url_variables.length; i++) {
          param_name = url_variables[i].split('=');

          if (param_name[0] === param) {
              return param_name[1] === undefined ? true : decodeURIComponent(param_name[1]);
          }
      }
    }


};