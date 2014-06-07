/* The input keyword. */
var INPUT = 'input';

/* Destringifies an object. */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

$(function() {
  var INDICATOR = $('#indicator');
  INDICATOR.prop('checked', deserialize(localStorage.blockingIndicated));
  $(INDICATOR).off('click');

  INDICATOR.click(function() {
    var BLOCKING_INDICATED = deserialize(localStorage.blockingIndicated);
    this.checked = !BLOCKING_INDICATED;
    localStorage.blockingIndicated = !BLOCKING_INDICATED;
    /*
    if (BLOCKING_INDICATED) {
      TABS.query({}, function(tabs) {
        var TAB_COUNT = tabs.length;
        for (var i = 0; i < TAB_COUNT; i++)
            BACKGROUND.chrome.browserAction.setBadgeText({
              tabId: tabs[i].id, text: ''
            });
      });
    }
    */
  });

  var CAP = $('#cap');
  CAP.prop('checked', deserialize(localStorage.blockingCapped));
  $(CAP).off('click');

  CAP.click(function() {
    this.checked = !deserialize(localStorage.blockingCapped);
    localStorage.blockingCapped = !deserialize(localStorage.blockingCapped);
  });

  var NOTIFICATION = $('#notifications');
  NOTIFICATION.prop('checked', deserialize(localStorage.notificationsDisabled));
  $(NOTIFICATION).off('click');

  NOTIFICATION.click(function() {
    this.checked = !deserialize(localStorage.notificationsDisabled);
    localStorage.notificationsDisabled = !deserialize(localStorage.notificationsDisabled);
  });

  var disconnectStats = $('#stats');
  disconnectStats.prop('checked', deserialize(localStorage.disconnectStats));
  $(disconnectStats).off('click');

  disconnectStats.click(function() {
    this.checked = !deserialize(localStorage.disconnectStats);
    localStorage.disconnectStats = !deserialize(localStorage.disconnectStats);
  });

  var SURROGATES = $('#surrogates');
  SURROGATES.prop('checked', deserialize(localStorage.surrogatesEnabled));
  $(SURROGATES).off('click');

  SURROGATES.click(function() {
    this.checked = !deserialize(localStorage.surrogatesEnabled);
    localStorage.surrogatesEnabled = !deserialize(localStorage.surrogatesEnabled);
  });

  var BLOCKCONTENT = $('#content-block');
  BLOCKCONTENT.prop('checked', deserialize(localStorage.blockContent));
  $(BLOCKCONTENT).off('click');

  BLOCKCONTENT.click(function() {
    this.checked = !deserialize(localStorage.blockContent);
    localStorage.blockContent = !deserialize(localStorage.blockContent);
  });

});
