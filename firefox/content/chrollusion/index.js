/* Toggles the blocking state globally. */
function whitelistSite() {
  whitelist = deserialize(Disconnect.localStorage.whitelist) || {};
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
  Disconnect.localStorage.whitelist = JSON.stringify(whitelist);
  blacklist = deserialize(Disconnect.localStorage.blacklist);
  blacklist && delete blacklist[domain];
  Disconnect.localStorage.blacklist = JSON.stringify(blacklist || {});
  Disconnect.reloadTab();
  return trackingUnblocked;
}

  /* Destringifies an object. */
  function deserialize(object) {
    return typeof object == 'string' ? JSON.parse(object) : object;
  }

  function tabsQuery(url) {
    domain = url.host; //new Sitename().get(url.toString());
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
var localStorage = Disconnect.localStorage;
/* var deserialize = backgroundPage.deserialize;
var updateClosed = deserialize(Disconnect.localStorage.updateClosed);
var recommendsActivated =
    deserialize(Disconnect.localStorage.recommendsExperiment) &&
        !deserialize(Disconnect.localStorage.recommendsClosed); */ 
var deserialize;
var updateClosed;
var recommendsActivated;

var tabApi;
var whitelist;
var domain;
var tabId;
var siteWhitelist;
var graph;
var addon = CollusionAddon;
var sitesHidden = deserialize(Disconnect.localStorage.sitesHidden);
var ranOnce;
var sidebarCollapsed = parseInt(Disconnect.localStorage.sidebarCollapsed, 10);
var blacklist;
var siteBlacklist;

var gbrowserA; 

/* Paints the graph UI. */
function renderGraph(gbrowser) {
  backgroundPage = gbrowser;
  tabApi = gbrowser.tabContainer;

 updateClosed = deserialize(Disconnect.localStorage.updateClosed);
 recommendsActivated =
    deserialize(Disconnect.localStorage.recommendsExperiment) &&
        !deserialize(Disconnect.localStorage.recommendsClosed);

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
  whitelist = deserialize(Disconnect.localStorage.whitelist) || {};

  tabsQuery(gbrowser.location); 

  if (!deserialize(Disconnect.localStorage.browsingHardened)) {
    $("#disable-wifi").addClass("invisible").html("Enable Wi-Fi security");
  } else {
    $("#disable-wifi").removeClass("invisible").html("Disable Wi-Fi security");
  }

  $("#show-instructions").hide();

  var runner = GraphRunner.Runner();
  graph = runner.graph;

  if (CollusionAddon.isInstalled()) {

    // You should only ever see this page if the addon is installed, anyway
    graph.update(Disconnect.LOG);

    if (!ranOnce) {
      ranOnce = true;

      $("#update .close").click(function() {
        Disconnect.localStorage.updateClosed = true;
        window.location.reload();
      });

      $("#recommends .close").click(function() {
        setTimeout(function() {
          Disconnect.localStorage.recommendsClosed = true;
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
        var wifiDisabled =
            Disconnect.localStorage.browsingHardened =
                !deserialize(Disconnect.localStorage.browsingHardened);
        $(this).
          toggleClass("invisible").
          text((wifiDisabled ? "Disable" : "Enable") + " Wi-Fi security");
          document.getElementById('disconnect-wifi-check').checked = wifiDisabled;
          //$("#disconnect-wifi-check").attr("checked",wifiDisabled);

      });

      $("#hide-sidebar").click(function() {
        sidebarCollapsed = Disconnect.localStorage.sidebarCollapsed = 3;

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
        delete Disconnect.localStorage.sidebarCollapsed;
        sidebarCollapsed = Disconnect.localStorage.sidebarCollapsed;

        $("#show-sidebar").slideUp(100, function() {
          $("#chart svg").remove();
          $("#sidebar, .live-data, show-instructions").slideDown();
          $("#chart").removeClass("fullscreen");
          renderGraph(backgroundPage);
        });
      });

      $("#show-list").click(function() {
        Disconnect.localStorage.displayMode = "list";

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
