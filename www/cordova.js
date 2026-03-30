/* cordova.js browser stub — replaced by real cordova.js at build time */
window.cordova = {
  platformId: 'browser',
  version: '12.0.0',
  define: function(){},
  require: function(){ return {}; },
  exec: function(success, fail, service, action, args) {
    console.log('[cordova stub] exec:', service, action, args);
    if (typeof success === 'function') setTimeout(success, 0);
  }
};
document.addEventListener('DOMContentLoaded', function() {
  var e = new Event('deviceready');
  document.dispatchEvent(e);
});
