/* The input keyword. */
const INPUT = 'input';

$(function() {
  const INDICATOR = $('#indicator ' + INPUT)[0];
  INDICATOR.checked = DESERIALIZE(options.blockingIndicated);
  $(INDICATOR).off('click');

  INDICATOR.onclick = function() {
    const BLOCKING_INDICATED = DESERIALIZE(options.blockingIndicated);
    this.checked = options.blockingIndicated = !BLOCKING_INDICATED;

    if (BLOCKING_INDICATED) {
      TABS.query({}, function(tabs) {
        const TAB_COUNT = tabs.length;
        for (var i = 0; i < TAB_COUNT; i++)
            BACKGROUND.chrome.browserAction.setBadgeText({
              tabId: tabs[i].id, text: ''
            });
      });
    }
  };

  const CAP = $('#cap ' + INPUT)[0];
  CAP.checked = DESERIALIZE(options.blockingCapped);
  $(CAP).off('click');

  CAP.onclick = function() {
    this.checked =
        options.blockingCapped = !DESERIALIZE(options.blockingCapped);
  };

  const NOTIFICATION = $('#notifications ' + INPUT)[0];
  NOTIFICATION.checked = DESERIALIZE(options.notificationsEnabled);
  $(NOTIFICATION).off('click');

  NOTIFICATION.onclick = function() {
    this.checked =
        options.notificationsEnabled = !DESERIALIZE(options.notificationsEnabled);
  };

  const SURROGATES = $('#surrogates ' + INPUT)[0];
  SURROGATES.checked = DESERIALIZE(options.surrogatesEnabled);
  $(SURROGATES).off('click');

  SURROGATES.onclick = function() {
    this.checked =
        options.surrogatesEnabled = !DESERIALIZE(options.surrogatesEnabled);
  };

  const BLOCKCONTENT = $('#content-block ' + INPUT)[0];
  BLOCKCONTENT.checked = DESERIALIZE(options.blockContent);
  $(BLOCKCONTENT).off('click');

  BLOCKCONTENT.onclick = function() {
    this.checked =
        options.blockContent = !DESERIALIZE(options.blockContent);
  };

});
