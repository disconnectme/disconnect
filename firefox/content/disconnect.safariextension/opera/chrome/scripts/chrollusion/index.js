/* Toggles the blocking state globally. */
function whitelistSite() {
  whitelist = deserialize(options.whitelist) || {};
  siteWhitelist = whitelist[domain] || (whitelist[domain] = {});
  var disconnectWhitelist =
      siteWhitelist.Disconnect || (siteWhitelist.Disconnect = {});
  var serviceWhitelist =
      disconnectWhitelist.services || (disconnectWhitelist.services = {});
  var advertisingWhitelist =
      siteWhitelist.Advertising || (siteWhitelist.Advertising = {});
  var analyticsWhitelist =
      siteWhitelist.Analytics || (siteWhitelist.Analytics = {});
  var socialWhitelist = siteWhitelist.Social || (siteWhitelist.Social = {});
  var trackingUnblocked =
      serviceWhitelist.Facebook && serviceWhitelist.Google &&
          serviceWhitelist.Twitter && advertisingWhitelist.whitelisted &&
              analyticsWhitelist.whitelisted && socialWhitelist.whitelisted &&
                  (siteWhitelist.Content || {}).whitelisted !== false;
  serviceWhitelist.Facebook =
      serviceWhitelist.Google =
          serviceWhitelist.Twitter =
              advertisingWhitelist.whitelisted =
                  analyticsWhitelist.whitelisted =
                      socialWhitelist.whitelisted = !trackingUnblocked;
  advertisingWhitelist.services = analyticsWhitelist.services =
      socialWhitelist.services = {};
  !trackingUnblocked &&
      (siteWhitelist.Content = {whitelisted: true, services: {}});
  options.whitelist = JSON.stringify(whitelist);
  blacklist = deserialize(options.blacklist);
  blacklist && delete blacklist[domain];
  options.blacklist = JSON.stringify(blacklist || {});
  tabApi.reload(tabId);
  return trackingUnblocked;
}

/* Constants. */
var backgroundPage = chrome.extension.getBackgroundPage();
var deserialize = backgroundPage.deserialize;
var updateClosed = deserialize(options.updateClosed);
var recommendsActivated =
    deserialize(options.recommendsExperiment) &&
        !deserialize(options.recommendsClosed);
var tabApi = chrome.tabs;
var whitelist;
var domain;
var tabId;
var siteWhitelist;
var getService = backgroundPage.getService;
var graph;
var addon = CollusionAddon;
var sitesHidden = deserialize(options.sitesHidden);
var ranOnce;
var sidebarCollapsed = parseInt(options.sidebarCollapsed, 10);
var blacklist;
var siteBlacklist;

/* Paints the graph UI. */
function renderGraph() {
  if (SAFARI) {
    $("#list").hide();
    $("#chart svg").remove();
    safari.self.width = 706;
    safari.self.height = 490;
    $("body").add("#update").add("#chart").addClass("safari");
    $("#update .safari").show();
    $("#logo").attr({
      src: "../images/chrollusion/safari.png", alt: "Collusion for Safari"
    });
  } else {
    if (!deserialize(options.promoHidden)) {
      options.promoHidden = true;

      setTimeout(function() {
        chrome.browserAction.setBadgeText({text: ""});
      }, 200);
    }

    $("#update .chrome").show();
    $("#logo").attr({
      src: "../images/chrollusion/chrome.png", alt: "Collusion for Chrome"
    });
  }

  updateClosed || $("#update").show();
  recommendsActivated && $("#recommends").show();

  $("a").click(function() {
    tabApi.create({url: $(this).attr("href")});
    return false;
  });

  $("#domain-infos").hide();
  whitelist = deserialize(options.whitelist) || {};

  tabApi.query({currentWindow: true, active: true}, function(tabs) {
    var tab = tabs[0];
    domain = backgroundPage.GET(tab.url);
    tabId = tab.id;
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

  if (!deserialize(options.browsingHardened)) {
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

      $("#update .close").click(function() {
        options.updateClosed = true;
        window.location.reload();
      });

      $("#recommends .close").click(function() {
        setTimeout(function() {
          options.recommendsClosed = true;
          window.location.reload();
        }, 100);
      });

      if (sidebarCollapsed) {
        $("#show-sidebar").show();
        $("#chart").addClass("fullscreen");
      } else {
        $("#sidebar").show();
        $("#chart").removeClass("fullscreen");
      }

      $("#unblock-tracking").click(function() {
        var trackingUnblocked = whitelistSite();
        $(this).
          toggleClass("invisible").
          text((trackingUnblocked ? "Unblock" : "Block") + " tracking sites");
        d3.selectAll("line.tracker").classed("hidden", !trackingUnblocked);
        $(".whitelisting img")[0].alt =
            trackingUnblocked ? "Whitelist" : "Blacklist";
        $(".whitelisting.text").
          text((trackingUnblocked ? "Whitelist" : "Blacklist") + " site");
      });

      $("#disable-wifi").click(function() {
        var wifiDisabled =
            options.browsingHardened = !deserialize(options.browsingHardened);
        $(this).
          toggleClass("invisible").
          text((wifiDisabled ? "Disable" : "Enable") + " Wi-Fi security");
        $(".wifi input")[0].checked = wifiDisabled;
      });

      $("#hide-sidebar").click(function() {
        sidebarCollapsed = options.sidebarCollapsed = 3;

        $("#sidebar").slideUp(function() {
          $("#chart svg").remove();

          setTimeout(function() { $("#show-sidebar").slideDown(100); }, 400);

          $("#chart").addClass("fullscreen");
          renderGraph();
        });
      });

      $("#show-instructions").click(function() {
        $("#domain-infos, #show-instructions").hide();
        $(".live-data").show();
      });

      $("#show-sidebar").click(function() {
        delete options.sidebarCollapsed;
        sidebarCollapsed = options.sidebarCollapsed;

        $("#show-sidebar").slideUp(100, function() {
          $("#chart svg").remove();
          $("#sidebar, .live-data, #show-instructions").slideDown();
          $("#chart").removeClass("fullscreen");
          renderGraph();
        });
      });

      $("#show-list").click(function() {
        options.displayMode = "list";

        $("#graph").fadeOut(function() {
          $("#chart svg").remove();

          if (SAFARI) {
            safari.self.width = 200;
            safari.self.height = 356;
          }

          var previousScene = currentScene;
          currentScene = getScene();
          SCENES.push(previousScene);
          $(".visualization img")[0].src =
              "../images/" + currentScene + "/1.png";
          d3.selectAll(".total").remove();
          d3.selectAll(".subtotal").remove();

          $("#list").fadeIn(function() { renderGraphs(); });
        });
      });
    }
  }
}
