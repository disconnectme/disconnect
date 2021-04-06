/* Destringifies an object. */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

/* Toggles the blocking state globally. */
function whitelistSite() {
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
  localStorage.whitelist = JSON.stringify(whitelist);
  blacklist = deserialize(localStorage.blacklist);
  blacklist && delete blacklist[domain];
  localStorage.blacklist = JSON.stringify(blacklist || {});
  clearServices(tabId);
  return trackingUnblocked;
}

/* Constants. */
var updateClosed = deserialize(localStorage.updateClosed = true);
var recommendsActivated =
    deserialize(localStorage.recommendsExperiment) &&
        !deserialize(localStorage.recommendsClosed = true);
var whitelist;
var domain = 'wsj.com';
var tabId = 0;
var siteWhitelist;
var graph;
var addon = CollusionAddon;
var LOG = {
  'wsj.com': {host: 'wsj.com', referrers: {}, visited: true},
  'wsj.net': {host: 'wsj.net', referrers: {
    'wsj.com': {host: 'wsj.com', types: [1667, 'stylesheet', 'script', 'image']}
  }, visited: false},
  'msn.com': {host: 'msn.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [1746, 'script', 'sub_frame', 'image']}
  }, visited: false},
  'axf8.net': {host: 'axf8.net', referrers: {
    'wsj.com': {host: 'wsj.com', types: [2491, 'script']}
  }, visited: false},
  'typekit.net': {host: 'typekit.net', referrers: {
    'wsj.com': {host: 'wsj.com', types: [2658, 'image']}
  }, visited: false},
  'peer39.net': {host: 'peer39.net', referrers: {
    'wsj.com': {host: 'wsj.com', types: [3745, 'script']}
  }, visited: false},
  'llnwd.net': {host: 'llnwd.net', referrers: {
    'wsj.com': {host: 'wsj.com', types: [5556, 'script']}
  }, visited: false},
  'imrworldwide.com': {host: 'imrworldwide.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [5586, 'image']}
  }, visited: false},
  'facebook.net': {host: 'facebook.net', referrers: {
    'wsj.com': {host: 'wsj.com', types: [5590, 'script']}
  }, visited: false},
  'dowjoneson.com': {host: 'dowjoneson.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [5616, 'image']}
  }, visited: false},
  'akamai.net': {host: 'akamai.net', referrers: {
    'wsj.com': {host: 'wsj.com', types: [5645, 'script']}
  }, visited: false},
  'doubleclick.net': {host: 'doubleclick.net', referrers: {
    'wsj.com': {host: 'wsj.com', types: [6426, 'image', 'sub_frame', 'script']}
  }, visited: false},
  'chartbeat.com': {host: 'chartbeat.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [6429, 'script']}
  }, visited: false},
  'criteo.com': {host: 'criteo.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [6473, 'script', 'image', 'sub_frame']}
  }, visited: false},
  'scorecardresearch.com': {host: 'scorecardresearch.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [6813, 'image', 'script']}
  }, visited: false},
  'tiqcdn.com': {host: 'tiqcdn.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [7018, 'script']}
  }, visited: false},
  'krxd.net': {host: 'krxd.net', referrers: {
    'wsj.com': {host: 'wsj.com', types: [8236, 'script']}
  }, visited: false},
  'dl-rms.com': {host: 'dl-rms.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [8247, 'script']}
  }, visited: false},
  'bluekai.com': {host: 'bluekai.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [12693, 'sub_frame']}
  }, visited: false},
  'outbrain.com': {host: 'outbrain.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [14498, 'script']}
  }, visited: false},
  'insightexpressai.com': {host: 'insightexpressai.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [16926, 'image']}
  }, visited: false},
  'twitter.com': {host: 'twitter.com', referrers: {
    'wsj.com': {host: 'wsj.com', types: [18845, 'sub_frame']}
  }, visited: false}
};
var sitesHidden = deserialize(localStorage.sitesHidden = true);
var ranOnce;
var sidebarCollapsed = parseInt(localStorage.sidebarCollapsed, 10);
var blacklist;
var siteBlacklist;

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
    }

    $("#update .chrome").show();
    $("#logo").attr({
      src: "../images/chrollusion/chrome.png", alt: "Collusion for Chrome"
    });
  }

  updateClosed || $("#update").show();
  recommendsActivated && $("#recommends").show();

  $("a").click(function() {
    window.open($(this).attr("href"));
    return false;
  });

  $("#domain-infos").hide();
  whitelist = deserialize(localStorage.whitelist) || {};
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
    graph.update(LOG);

    if (!ranOnce) {
      ranOnce = true;

      $("#update .close").click(function() {
        localStorage.updateClosed = true;
        window.location.reload();
      });

      $("#recommends .close").click(function() {
        setTimeout(function() {
          localStorage.recommendsClosed = true;
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
            localStorage.browsingHardened =
                !deserialize(localStorage.browsingHardened);
        $(this).
          toggleClass("invisible").
          text((wifiDisabled ? "Disable" : "Enable") + " Wi-Fi security");
        $(".wifi input")[0].checked = wifiDisabled;
      });

      $("#hide-sidebar").click(function() {
        sidebarCollapsed = localStorage.sidebarCollapsed = 3;

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
        delete localStorage.sidebarCollapsed;
        sidebarCollapsed = localStorage.sidebarCollapsed;

        $("#show-sidebar").slideUp(100, function() {
          $("#chart svg").remove();
          $("#sidebar, .live-data, #show-instructions").slideDown();
          $("#chart").removeClass("fullscreen");
          renderGraph();
        });
      });

      $("#show-list").click(function() {
        localStorage.displayMode = "list";

        $("#graph").fadeOut(function() {
          $("#chart svg").remove();
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
