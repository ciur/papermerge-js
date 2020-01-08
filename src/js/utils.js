import $ from "jquery";

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

export function id(elem_id) {
    var elem;

    elem = document.getElementById(elem_id);
    if (!elem) {
        console.log("Element " + elem_id + " was not found");
        return;
    }
    // returns a DOM Element with extra features (i.e. extended DOM element)
    return dglDOM( elem);
}

export function id_or_invoke(elem_id, func) {
    // if element with id does not exist - call function func
    // which probably will create one.
    var elem;

    elem = document.getElementById(elem_id);

    if (!elem) {
        func();
    }
}

export function q(sel) {
    return dglDOM( document.querySelector(sel) );
}

export function qall(sel) {
    return dglDOM( document.querySelectorAll(sel) );
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


var dglDOM = (function(){
    var wrapper, DOMPlus, extend, DglMethods, foreach;

    extend = function(out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
              continue;

            for (var key in arguments[i]) {
              if (arguments[i].hasOwnProperty(key))
                out[key] = arguments[i][key];
        }
        }
        return out;
    };

    DglMethods = {
        forEach : function(foo) {
            var elems = this.collection;
            for (var i = 0, l = elems.length; i < l; i++) {
                foo( elems[i], i );
            }
            return this;
        },
        addStyles : function(styles) {
            var elems = this.collection;
            for (var i = 0, l = elems.length; i < l; i++) {
                for (var prop in styles) {
                    elems[i].style[prop] = styles[prop];
                }
            }
            return this;
        },
        xclick: function(foo) {
            var elems = this.collection;
            for (var i = 0, l = elems.length; i < l; i++) {
                elems[i].addEventListener('click', foo);
            }
            return this;
        },
        xchange: function(foo) {
            var elems = this.collection;
            for (var i = 0, l = elems.length; i < l; i++) {
                elems[i].addEventListener('change', foo);
            }
            return this;
        },
        hide: function() {
            var elems = this.collection;
            for (var i = 0, l = elems.length; i < l; i++) {
                elems[i].classList.add('hidden');
            }
            return this
        },
        cycle: function(css_class_list) {
            var elems = this.collection, css1, css2;

            css1 = css_class_list[0];
            css2 = css_class_list[1];

            for (var i = 0, l = elems.length; i < l; i++) {
                if (elems[i].classList.contains(css1)) {

                    elems[i].classList.remove(css1);
                    elems[i].classList.add(css2);

                } else if (elems[i].classList.contains(css2)){

                    elems[i].classList.remove(css2);
                    elems[i].classList.add(css1);
                }
            }
            return this;
        },
        toggle: function(css_class) {
            var elems = this.collection;

            for (var i = 0, l = elems.length; i < l; i++) {
                if (elems[i].classList.contains(css_class)) {
                    elems[i].classList.remove(css_class);
                } else {
                    elems[i].classList.add(css_class);
                }
            }
            return this;
        },
        toggle_visibility: function() {
            var elems = this.collection;

            for (var i = 0, l = elems.length; i < l; i++) {
                if (elems[i].classList.contains("hidden")) {
                    elems[i].classList.remove("hidden");
                } else {
                    elems[i].classList.add("hidden");
                }
            }
            return this;
        }
    };

    wrapper = function(elems){
        return new DOMPlus(elems);
    };

    DOMPlus = function(elems) {

        if (elems === null || elems === undefined) {
            return undefined
        };

        this.collection = elems[1] ? Array.prototype.slice.call(elems) : [elems];

        return extend(elems, this, DglMethods);
    };

    return wrapper;
})();

export function dglReady(func){
    document.addEventListener('DOMContentLoaded', func);
};
