"use strict"; // ES5

(function() {


  contactToggle();
  function contactToggle() {
    var trigger = $(".contacts");
    var contactWrap = $(".contacts__wrapper");
    trigger.on("click", function() {
      trigger.toggleClass('contacts--closed');
    });
  }


})();
