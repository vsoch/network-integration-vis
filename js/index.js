(function() {
  'use strict';
  
  var isOpen  = true;
  var button  = document.querySelector('#expand-navigation');
  var wrapper = document.querySelector('.wrapper');
  var overlay = document.querySelector('.overlay');
  
  button.addEventListener('click', navigationHandler);
  document.addEventListener('click', closeNavigation);
  
  function navigationHandler(event) {
    if (event == null) {
      event = window.event;
    }
    
    event.stopPropagation();
    
    !isOpen ? openNavigation() : closeNavigation();
  }
  
  function openNavigation() {
    isOpen = true;
    
    button.innerHTML  = '-';
    wrapper.className = 'wrapper opened';
    overlay.className = 'overlay on-overlay';
  }

  function closeNavigation() {
    isOpen = false;
    
    button.innerHTML = '+';
    wrapper.className = 'wrapper';
    overlay.className = 'overlay';
  }  
})();