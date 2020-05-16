import $ from "jquery";

function set_cookie(name, value, days) {
    
    console.log(`setting cookie named ${name} with value ${value}`);

    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

export function sort_cookie() {
    /**
        This function resolves the ticket #15.
        Automatically sort by alphabet - feature request...

        The 'automatic sort' is accomplished with help of cookie.
        A cookie file is saved every time user clicks on:
            title asc/desc -> 1 / -1
            date asc/desc  -> 2 / -2
            type asc/desc  -> 3 / -3 
        sorting. 
        Cookie file name is 'save_last_sort' and it contains the corresponding
        number of the sort user chose (1, -1 etc).
        In changelist of basetreenode (on the server side), this cookie will
        be read in basetreenodes will be sorted accordingly. This so called
        cookie based sorting has lower precedence than 'o' parameter.
    **/
    $(".dropdown-item.sort").on('click', function(){
        let _$this = $(this);
        let value;

        if (_$this.hasClass("title") && _$this.hasClass("asc")) {
            value = 1;
        } else if (_$this.hasClass("title") && _$this.hasClass("desc")) {
            value = -1;
        } else if (_$this.hasClass("date") && _$this.hasClass("asc")) {
            value = 2;
        } else if (_$this.hasClass("date") && _$this.hasClass("desc")) {
            value = -2;
        } else if (_$this.hasClass("type") && _$this.hasClass("asc")) {
            value = 3;
        } else if (_$this.hasClass("type") && _$this.hasClass("desc")) {
            value = -3;
        }

        set_cookie("save_last_sort", value, 365);
    });
}
