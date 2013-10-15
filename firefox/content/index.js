/* Toggles the blocking state globally. */
function whitelistSite() {
  whitelist = JSON.parse(preferences.getCharPref("whitelist"));
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
  preferences.setCharPref("whitelist", JSON.stringify(whitelist));
  blacklist = JSON.parse(preferences.getCharPref("blacklist"));
  blacklist && delete blacklist[domain];
  preferences.setCharPref("blacklist", JSON.stringify(blacklist));
  Disconnect.reloadTab();
  return trackingUnblocked;
}

function tabsQuery(url) {
  domain = url.host;
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
}

/* Constants. */
var backgroundPage;
var preferences =
    Components.
      classes['@mozilla.org/preferences-service;1'].
      getService(Components.interfaces.nsIPrefService).
      getBranch('extensions.disconnect.');
var updateClosed = preferences.getBoolPref("updateClosed");
var recommendsActivated =
    preferences.getBoolPref("recommendsExperiment") &&
        !preferences.getBoolPref("recommendsClosed");
var tabApi;
var whitelist;
var domain;
var tabId;
var siteWhitelist;
var graph;
var addon = CollusionAddon;
var sitesHidden = preferences.getBoolPref("sitesHidden");
var ranOnce;
var sidebarCollapsed = preferences.getIntPref("sidebarCollapsed");
var blacklist;
var siteBlacklist;

var gbrowserA; 


function updateGraph() {
  try { graph.update(log); } catch(e) {}
}


/* Paints the graph UI. */
function renderGraph(gbrowser) {
  backgroundPage = gbrowser;
  tabApi = gbrowser.tabContainer;

  $("#chart svg").remove(); 
  $("update").css('display', 'block');
  $("body").add("update").add("chart").addClass("safari");

  updateClosed || $("#update").css('display', 'block');
  recommendsActivated && $("#recommends").css('display', 'block');

  $("a").click(function() {
    tabApi.create({url: $(this).attr("href")});
    return false;
  });

  $("#domain-infos").hide();
  whitelist = JSON.parse(preferences.getCharPref("whitelist"));

  tabsQuery(gbrowser.location); 

  if (!preferences.getBoolPref("browsingHardened")) {
    $("#disable-wifi").addClass("invisible").html("Enable Wi-Fi security");
  } else {
    $("#disable-wifi").removeClass("invisible").html("Disable Wi-Fi security");
  }

  $("#show-instructions").hide();

  var runner = GraphRunner.Runner();
  graph = runner.graph;

  if (CollusionAddon.isInstalled()) {

    // You should only ever see this page if the addon is installed, anyway

    try { graph.update(log); } catch(e) {}

    if (!ranOnce) {
      ranOnce = true;

      $("#update .close").click(function() {
        preferences.setBoolPref("updateClosed", true);
        window.location.reload();
      });

      $("#recommends .close").click(function() {
        setTimeout(function() {
          preferences.setBoolPref("recommendsClosed", true);
          window.location.reload();
        }, 100);
      });

      if (sidebarCollapsed) {
        $('#show-sidebar').css('display', 'block');
        $("#chart").addClass("fullscreen");

      } else {
        $("#sidebar").css('display', 'block');
        $("#chart").removeClass("fullscreen");
      }

      $("#unblock-tracking").click(function() {
        var trackingUnblocked = whitelistSite();
        $(this).
          toggleClass("invisible").
          text((trackingUnblocked ? "Unblock" : "Block") + " tracking sites");
        d3.selectAll("line.tracker").classed("hidden", !trackingUnblocked);
        $(".disconnect-whitelisting img").alt =
            trackingUnblocked ? "Whitelist" : "Blacklist";
        $(".disconnect-whitelisting.text").
          text((trackingUnblocked ? "Whitelist" : "Blacklist") + " site");
      });

      $("#disable-wifi").click(function() {
        var wifiDisabled = !preferences.getBoolPref("browsingHardened");
        preferences.setBoolPref("browsingHardened", wifiDisabled);
        $(this).
          toggleClass("invisible").
          text((wifiDisabled ? "Disable" : "Enable") + " Wi-Fi security");
          document.getElementById('disconnect-wifi-check').checked = wifiDisabled;

      });

      $("#hide-sidebar").click(function() {
        sidebarCollapsed = 3;
        preferences.setIntPref("sidebarCollapsed", sidebarCollapsed);

        $("#sidebar").slideUp(function() {
          $("#chart svg").remove();

          $('#show-sidebar').css('display', 'block');  
          //setTimeout(function() { $("#show-sidebar").slideDown(100); }, 400);

          $("#chart").addClass("fullscreen");
          renderGraph(backgroundPage);
        });
      });

      $("#show-instructions").click(function() {
        $("#domain, show-instructions").hide();
        $(".live-data").css('display', 'block');
      });

      $("#show-sidebar").click(function() {
        sidebarCollapsed = 0;
        preferences.setIntPref("sidebarCollapsed", sidebarCollapsed);

        $("#show-sidebar").slideUp(100, function() {
          $("#chart svg").remove();
          $("#sidebar, .live-data, show-instructions").slideDown();
          $("#chart").removeClass("fullscreen");
          renderGraph(backgroundPage);
        });
      });

      $("#show-list").click(function() {
        preferences.setCharPref("displayMode", "list");

        $("#graph").fadeOut(function() {
          $("#chart svg").remove();
          var previousScene = Disconnect.currentScene;
          var currentScene = Disconnect.getScene();
          Disconnect.SCENES.push(previousScene);
          $(".disconnect-visualization img").src = Disconnect.imageDirectory + currentScene + "/1.png"; 

          d3.selectAll(".total").remove();
          d3.selectAll(".subtotal").remove();

          $("#disconnect-list").fadeIn(function() { renderGraph(backgroundPage); });
        });
      });
    }
  }
}
