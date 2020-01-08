import $ from "jquery";
import {DgEvents} from "./events";


function password_validator(pwd) {
   if ( !pwd ){
       // no charcters at all - first condition failed.
       return "Too short. Min of 8 characters required";
   }
   if ( pwd.length < 8 ) {
       return "Too short. Min of 8 characters required";
   }
   if ( pwd.length > 32 ) {
       return "Too long. Max of 32 characters required";
   }

   return false; 
}


export class DgPassword {
    /**
    Following structure is expected
    <div class="container">
        <input type="password">    // dom_ref_input
        <i class="icon-eye"></i>   // dom_ref_eye 
        <i class="icon-cross"></i> // dom_ref_cross
    </div>
    **/
    constructor(dom_ref_input) {
        this._dom_ref = dom_ref_input;
        this._dom_ref_eye = this.get_dom_eye();
        this._dom_ref_cross = this.get_dom_cross();
        this._events = new DgEvents();

        this.config_events();
        if (this._dom_ref_cross) {
            $(this._dom_ref_cross).hide();
        }
    }

    subscribe(name, handler, context) {
        this._events.subscribe(name, handler, context);
    }

    get_dom_eye() {
        let icon_eye = $(this._dom_ref).siblings(".icon-eye");
        
        if (icon_eye && icon_eye.length > 0) {
            return icon_eye[0];
        }

        return undefined;
    }


    get_dom_cross() {
        let icon_cross = $(this._dom_ref).siblings(".icon-cross");
        
        if (icon_cross && icon_cross.length > 0) {
            return icon_cross[0];
        }

        return undefined;
    }

    config_events() {
        let that = this, 
            eye = this._dom_ref_eye,
            input = this._dom_ref;

        if (eye) {
            $(eye).click(function(){
                console.log("Eye clicked");
                $(this).toggleClass('icon-eye icon-eye-blocked');
                if ($(input).attr("type") == "password") {
                  $(input).attr("type", "text");
                } else {
                  $(input).attr("type", "password");
                }
            });
        }

        $(input).keyup(function(){
            that._events.notify('keyup', that);
        }); 
    }

    text() {
        return $(this._dom_ref).val();
    }

    mark_correct() {
        let icon = this._dom_ref_cross,
            input = this._dom_ref;

        $(icon).removeClass("fail");
        $(icon).removeClass("icon-cross");
        $(icon).addClass("success");
        $(icon).addClass("icon-checkmark");
        $(icon).show();
        $(input).parent().prev('span').html('');
        $(input).parent().prev('span').removeClass('fail');
    }

    mark_wrong(reason) {
        let icon = this._dom_ref_cross,
            input = this._dom_ref;

        $(icon).addClass("fail");
        $(icon).addClass("icon-cross");
        $(icon).removeClass("success");
        $(icon).removeClass("icon-checkmark");
        $(icon).show();
        $(input).prop('title', reason);
        $(input).parent().prev('span').html(reason);
        $(input).parent().prev('span').addClass('fail');
    }
}

export class DgPasswordDuo {

    constructor(pass1, pass2) {
        this._pass1 = pass1;
        this._pass2 = pass2;

        this.config_events();
    }

    config_events() {
        this._pass1.subscribe('keyup', this.on_key_up, this);
        this._pass2.subscribe('keyup', this.on_key_up, this);
    }

    on_key_up(pass) {

        let text1 = this._pass1.text(), text = pass.text();
        let text2 = this._pass2.text(), reason = password_validator(text);

        if (!reason) {
            pass.mark_correct();
        } else {
            pass.mark_wrong(reason);
        }

        if ( text1 && text2 && text1.length >0 && text2.length > 0) {
            if (text1 != text2) {
                pass.mark_wrong("Password do not match");
            } else if (!reason) {
                this._pass1.mark_correct();
                this._pass2.mark_correct();
            } else {
                pass.mark_wrong(reason);
            }
        }
    }
}


export function decorate_passwords() {
    let pwd1, pwd2, duo, pwd_arr = Array.from(
        document.getElementsByClassName("password")
    );

    if (pwd_arr.length == 1) {
        pwd1 = new DgPassword(pwd_arr[0]);

    } else if (pwd_arr.length == 2 || pwd_arr.length == 4) {
        pwd1 = new DgPassword(pwd_arr[0]);
        pwd2 = new DgPassword(pwd_arr[1]);
        duo = new DgPasswordDuo(pwd1, pwd2);

        
    } 

}