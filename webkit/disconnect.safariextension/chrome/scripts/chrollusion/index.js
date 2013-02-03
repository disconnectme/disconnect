var backgroundPage = chrome.extension.getBackgroundPage();
var deserialize = backgroundPage.deserialize;
var sidebarCollapsed = parseInt(localStorage.sidebarCollapsed, 10);
var sitesHidden = deserialize(localStorage.sitesHidden);
var updateClosed = deserialize(localStorage.updateClosed);
var recommendsActivated =
    deserialize(localStorage.recommendsExperiment) &&
        !deserialize(localStorage.recommendsClosed);
var graph;
var addon = CollusionAddon;
var domain;
var tabId;
var whitelist;
var siteWhitelist;
var blacklist;
var siteBlacklist;
var ranOnce;

/* Paints the graph UI. */
function renderGraph() {
  if (SAFARI) {
    $("body").add("#update").add("#chart").addClass("safari");
    $("#update .safari").show();
    $("#logo").attr({
      src: "../images/chrollusion/safari.png", alt: "Collusion for Safari"
    });
  } else {
    if (!deserialize(localStorage.promoHidden)) {
      localStorage.promoHidden = true;
      setTimeout(function() {
        chrome.browserAction.setBadgeText({text: ''});
      }, 200);
    }
    $("#update .chrome").show();
    $("#logo").attr({
      src: "../images/chrollusion/chrome.png", alt: "Collusion for Chrome"
    });
  }
  $("a").click(function() {
    chrome.tabs.create({url: $(this).attr("href")});
    return false;
  });
  updateClosed || $("#update").show();
  recommendsActivated && $("#recommends").show();
  $("#domain-infos").hide();
  whitelist = deserialize(localStorage.whitelist) || {};

  backgroundPage.TABS.query({currentWindow: true, active: true}, function(tabs) {
    var domain = GET(tabs[0].url);
    siteWhitelist = whitelist[domain] || (whitelist[domain] = {});
    var serviceWhitelist = (siteWhitelist.Disconnect || {}).services || {};
    if (
      serviceWhitelist.Facebook && serviceWhitelist.Google &&
          serviceWhitelist.Twitter &&
              (siteWhitelist.Advertising || {}).whitelisted &&
                  (siteWhitelist.Analytics || {}).whitelisted &&
                      (siteWhitelist.Content || {}).whitelisted &&
                          (siteWhitelist.Social || {}).whitelisted
    ) {
      $("#unblock-tracking").addClass("invisible").html("Block tracking sites");
    } else {
      $("#unblock-tracking").html("Unblock tracking sites");
    }
  });

  if (!deserialize(localStorage.browsingHardened)) {
    $("#disable-wifi").addClass("invisible").html("Enable Wi-Fi security");
  } else {
    $("#disable-wifi").removeClass("invisible").html("Disable Wi-Fi security");
  }
  $("#show-instructions").hide();

  var runner = GraphRunner.Runner({
    width: sidebarCollapsed ? SAFARI ? 697 : 700 : SAFARI ? 485 : 484,
    height:
        updateClosed ?
            (SAFARI ? 495 : (recommendsActivated ? 434 : 484)) :
                (SAFARI ? 454 : (recommendsActivated ? 387 : 446)),
    hideFavicons: false 
  });
  graph = runner.graph;

  if (addon.isInstalled()) {
    // You should only ever see this page if the addon is installed, anyway
    graph.update(backgroundPage.LOG);

    if (!ranOnce) {
      ranOnce = true;
      if (sidebarCollapsed) {
        $("#show-sidebar").show();
        $("#chart").addClass("fullscreen");
      } else {
        $("#sidebar, #domain-infos").show();
        $("#chart").removeClass("fullscreen");
      }
      $("#update .close").click(function() {
        localStorage.updateClosed = true;
        window.location.reload();
      });
      $("#recommends .close").click(function() {
        setTimeout(function() {
          window.location.reload();
          localStorage.recommendsClosed = true;          
        }, 100);
      });
      $("#unblock-tracking").click(function() {
        whitelist = deserialize(localStorage.whitelist) || {};
        siteWhitelist = whitelist[domain] || (whitelist[domain] = {});
        var disconnectWhitelist =
            siteWhitelist.Disconnect || (siteWhitelist.Disconnect = {});
        var serviceWhitelist =
            disconnectWhitelist.services || (disconnectWhitelist.services = {});
        var advertisingWhitelist =
            siteWhitelist.Advertising || (siteWhitelist.Advertising = {});
        var analyticsWhitelist =
            siteWhitelist.Analytics || (siteWhitelist.Analytics = {});
        var contentWhitelist =
            siteWhitelist.Content || (siteWhitelist.Content = {});
        var socialWhitelist =
            siteWhitelist.Social || (siteWhitelist.Social = {});
        var trackingUnblocked =
            serviceWhitelist.Facebook && serviceWhitelist.Google &&
                serviceWhitelist.Twitter && advertisingWhitelist.whitelisted &&
                    analyticsWhitelist.whitelisted &&
                        contentWhitelist.whitelisted &&
                            socialWhitelist.whitelisted;
        serviceWhitelist.Facebook =
            serviceWhitelist.Google =
                serviceWhitelist.Twitter =
                    advertisingWhitelist.whitelisted =
                        analyticsWhitelist.whitelisted =
                            contentWhitelist.whitelisted =
                                socialWhitelist.whitelisted =
                                    !trackingUnblocked;
        advertisingWhitelist.services = analyticsWhitelist.services =
            contentWhitelist.services = socialWhitelist.services = {};
        localStorage.whitelist = JSON.stringify(whitelist);
        blacklist = deserialize(localStorage.blacklist);
        blacklist && delete blacklist[domain];
        localStorage.blacklist = JSON.stringify(blacklist);
        $(this).
          toggleClass("invisible").
          text((trackingUnblocked ? "Unblock" : "Block") + " tracking sites");
        d3.selectAll("line.tracker").classed("hidden", !trackingUnblocked);
        var disconnectRequests =
            (backgroundPage.REQUEST_COUNTS[tabId] || {}).Disconnect || {};

        for (var i = 0; i < SHORTCUT_COUNT; i++) {
          var name = SHORTCUTS[i];
          var shortcutRequests = disconnectRequests[name];
          var control = $('.shortcut')[i + 1];
          renderShortcut(
            name,
            name.toLowerCase(),
            trackingUnblocked,
            shortcutRequests ? shortcutRequests.count : 0,
            control,
            $(control),
            control.
              getElementsByClassName('badge')[0].
              getElementsByTagName('img')[0],
            control.getElementsByClassName('text')[0]
          );
        }

        for (i = 0; i < CATEGORY_COUNT; i++) {
          var name = CATEGORIES[i];
          var control = $('.category')[i + 1];
          var wrappedControl = $(control);
          var wrappedBadge = wrappedControl.find('.badge');
          var wrappedText = wrappedControl.find('.text');
          renderCategory(
            name,
            name.toLowerCase(),
            trackingUnblocked,
            0,
            control,
            wrappedControl,
            wrappedBadge[0],
            wrappedBadge.find('img')[0],
            wrappedText[0],
            wrappedText.find('.name'),
            wrappedText.find('.count')
          );
        }

        chrome.tabs.reload(tabId);
      });
      $("#disable-wifi").click(function() {
        var wifiDisabled =
            localStorage.browsingHardened =
                !deserialize(localStorage.browsingHardened);
        $(this).
          toggleClass("invisible").
          text((wifiDisabled ? "Disable" : "Enable") + " Wi-Fi security");
        $('.wifi input')[0].checked = wifiDisabled;
      });
      $("#show-list").click(function() {
        localStorage.displayMode = 'standard';

        $('#graph').fadeOut(function() {
          $('#chart svg').remove();
          var visualization = $('.visualization table');
          visualization.off('mouseenter');

          $('#standard').fadeIn(function() {
            animate(visualization.find('img')[0], function() {
              visualization.mouseenter(handleHover);
            });
          });
        });
      });
      $("#hide-sidebar").click(function() {
        sidebarCollapsed = localStorage.sidebarCollapsed = 3;
        $("#sidebar, #domain-infos, #show-instructions").
          slideUp(function() {
            $('#chart svg').remove();

            setTimeout(function() {
              $("#show-sidebar").slideDown(100);
            }, 400);

            $("#chart").addClass("fullscreen");
            renderGraph();
          });
      });
      $("#show-instructions").click(function() {
        $("#domain-infos, #show-instructions").hide();
        $(".live-data").show();
      });
      $("#show-sidebar").click(function() {
        delete localStorage.sidebarCollapsed;
        sidebarCollapsed = localStorage.sidebarCollapsed;
        $("#show-sidebar").slideUp(100, function() {
          $('#chart svg').remove();
          $("#sidebar, #domain-infos, #show-instructions").slideDown();
          $("#chart").removeClass("fullscreen");
          renderGraph();
        });
      });
    }
  }
}
