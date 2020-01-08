export function get_win_param(param_name) {
      let searchString = window.location.search.substring(1),
          i,
          val,
          params = searchString.split("&");

      for (i=0; i<params.length; i++) {
        val = params[i].split("=");
        if (val[0] == param_name) {
          return val[1];
        }
      }
      return null;
}

export function delete_elem_children(dom_elem) {
    while (dom_elem.firstChild) {
        dom_elem.removeChild(dom_elem.firstChild);
    }
}


export function is_visible(dom_page_item) {
    let rect = dom_page_item.getBoundingClientRect();
    let top_visible = false; 
    let bottom_visible = false;
    let top_and_bottom_visible = false;
    let ret;

    if ( (rect.top >= 0) && (rect.top < window.innerHeight) ) {
        top_visible = true;
    }

    if ( (rect.bottom >=0) && (rect.bottom <= window.innerHeight) ) {
        bottom_visible = true;
    }

    if ( (rect.top <= 0) && (rect.bottom >= window.innerHeight) ) {
        top_and_bottom_visible = true;
    }

    ret = top_visible || bottom_visible || top_and_bottom_visible;

    return top_visible || bottom_visible || top_and_bottom_visible;
}


export function build_elem(tag_name, attrs, text='') {
    let el = document.createElement(tag_name),
        text_content;

    for (let k in attrs) {
        el.setAttribute(k, attrs[k]);
    }

    if (text && text.length > 0) {
        text_content = document.createTextNode(text);
        el.appendChild(text_content);
    }

    return el;
}


export function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


export function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
