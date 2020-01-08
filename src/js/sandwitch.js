dglReady(
    function(event) {
      var doc = document, sandwich;

      sandwich = doc.querySelector(".nav-icon");
      if (sandwich) {
        sandwich.onclick = function() {

            var menu_items = doc.querySelectorAll("nav.sandwich > ul > li");

            if (menu_items) {
                menu_items.forEach(function(item){

                    if (item.classList.contains('visible')) {
                        item.classList.remove('visible');            
                    } else {
                        item.classList.add('visible');
                    }
                });
            }
        }
      }
    }
);