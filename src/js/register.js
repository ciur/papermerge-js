import $ from "jquery";
import {DgPassword, DgPasswordDuo} from "./password" 


function email_validator(email) {
    // not very strict one
    let re = /\S+@\S+\.\S+/;
    
    if ( !re.test(email) ) {
        console.log("Invalid Email Format");
        return "Invalid email format";
    }

    return false;
}

function username_validator(name) {
   /**
       Validates that username is correct.
       name : str : name to validate

       A valid name is:

       1) Minumum number of characters is 3.
       2) Maximum number of characters is 32.
       3) contains only numbers 0-9, letters a-z and underscore (_).

       If name is valid, returns 0. Otherwise returns the number of condition 
       from the list above - which failed.
   **/
   if ( !name ){
       // no charcters at all - first condition failed.
       return "Too short. Min of 3 characters required";
   }
   if ( name.length < 3 ) {
       return "Too short. Min of 3 characters required";
   }
   if ( name.length > 32 ) {
       return "Too long. Max of 32 characters required";
   }
   if (!/^[0-9a-z\_]+$/.test(name)) {
       return "Contains invalid characters. Only a-z, 0-9 and underscore allowed.";
   }
   return false; 
}

function company_name_validator(name) {
    /**
        Validates that company name is correct.
        name : str : name to validate

        A valid name is:

        1) Minumum number of characters is 3.
        2) Maximum number of characters is 32.
        3) contains only numbers 0-9 and lowercase letters a-z.

        If name is valid, returns 0. Otherwise returns the number of condition 
        from the list above - which failed.
    **/
    if ( !name ){
        // no charcters at all - first condition failed.
        return "Too short. Min of 3 characters required";
    }
    if ( name.length < 3 ) {
        return "Too short. Min of 3 characters required";
    }
    if ( name.length > 32 ) {
        return "Too long. Max of 32 characters required";
    }
    if (!/^[0-9a-z]+$/.test(name)) {
        return "Contains invalid characters. Only lowercase a-z, 0-9.";
    }

    return false;
}

function Feedback(css_selector, validator){
    var $icon = $(css_selector).nextAll(".icon-cross, .icon-checkmark");

    return {
        validate: function(name) {
            return validator(name);
        }, 
        mark_correct: function() {
            // show green checkmark
            // remove error tooltip 
            $icon.removeClass("fail");
            $icon.removeClass("icon-cross");
            $icon.addClass("success");
            $icon.addClass("icon-checkmark");
            $icon.show();
            $(css_selector).parent().prev('span').html('');
            $(css_selector).parent().prev('span').removeClass('fail');

        },
        mark_wrong: function(text, reason) {
            // show red cross mark
            // add hin via tooltip
            $icon.addClass("fail");
            $icon.addClass("icon-cross");
            $icon.removeClass("success");
            $icon.removeClass("icon-checkmark");
            $icon.show();
            $(css_selector).prop('title', reason || validator(text));
            $(css_selector).parent().prev('span').html(reason || validator(text));
            $(css_selector).parent().prev('span').addClass('fail');

        }
    };
};

function username_feedback(){
    var text = $(this).val(),
        feedback = new Feedback(
            '#id_username',
            username_validator
        );

    if ( !feedback.validate(text) ) {
        feedback.mark_correct(text); 
    } else {
        feedback.mark_wrong(text);
    }
}

function email_feedback(){
    var text = $(this).val(),
        feedback = new Feedback(
            '#id_email',
            email_validator
        );

    if ( !feedback.validate(text) ) {
        $.ajax({
            'url': '/register/email/check',
            'data': {'email': text}
        }).done(function(data, textStatus){
            // means company names was not taken
            if (!data) {
                return;
            }
            if (!data.exists) {
                feedback.mark_correct(text);    
            } else {
                feedback.mark_wrong(text, "Email already taken.");
            }
        }).fail(function(){
            
        });
        feedback.mark_correct(text); 
    } else {
        feedback.mark_wrong(text);
    }
}


function company_name_feedback(){
        /* check if company name already taken */
        var text = $(this).val(),
            feedback = new Feedback(
                '#id_company',
                company_name_validator
            );

        if ( !feedback.validate(text) ) {
            $.ajax({
                'url': '/register/company/check',
                'data': {'name': text}
            }).done(function(data, textStatus){
                // means company names was not taken
                if (!data) {
                    return;
                }
                if (!data.exists) {
                    feedback.mark_correct(text);
                    $("#domain_hint").text("https://" + text + "." + document.domain);
                    $("#domain_hint").attr("href", "https://" + text + "." + document.domain);
                } else {
                    feedback.mark_wrong(text, "Name already taken.");
                    $("#domain_hint").text("");
                    $("#domain_hint").attr("href", "");
                }
            }).fail(function(){
                
            });
        } else {
            feedback.mark_wrong(text);
        }
    }


export function registration() {
    let i;

   if ($("#register-form").length > 0) {
      $('.icon-checkmark').hide();
      $('.icon-cross').hide();

      $("#id_company").keyup(company_name_feedback);
      $("#id_company").focusout(company_name_feedback);
      $("#id_username").keyup(username_feedback);
      $("#id_username").focusout(username_feedback);
      $("#id_email").keyup(email_feedback);
      $("#id_email").focusout(email_feedback);

      // in case we reload the page and form
      // has some filled in text, display correct feedback;
      let arr = [
          "#id_company",
          "#id_username",
          "#id_email",
          "#id_password1",
          "#id_password2"
      ], val;

      for (i=0; i<arr.length; i++) {
          val = $(arr[i]).val();
          if (val && val.length > 0) {
              $(arr[i]).keyup();
          }
      }

      let pwd1, pwd2, duo, pwd_arr = Array.from(
          document.getElementsByClassName("password")
      );

      if (pwd_arr.length == 2) {
          pwd1 = new DgPassword(pwd_arr[0]);
          pwd2 = new DgPassword(pwd_arr[1]);
          duo = new DgPasswordDuo(pwd1, pwd2);
      } 

   }
}