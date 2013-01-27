var backgroundPage = chrome.extension.getBackgroundPage();
var query = chrome.tabs.query;
var setBadgeText = chrome.browserAction.setBadgeText;
var deserialize = backgroundPage.deserialize;
var sidebarCollapsed = parseInt(localStorage.sidebarCollapsed, 10);
var trackingUnblocked = deserialize(localStorage.trackingUnblocked);
var sitesHidden = deserialize(localStorage.sitesHidden);
var badgeHidden = deserialize(localStorage.badgeHidden);
var updateClosed = deserialize(localStorage.updateClosed);
var recommendsActivated =
    deserialize(localStorage.recommendsExperiment) &&
        !deserialize(localStorage.recommendsClosed);
var addon = CollusionAddon;
var graph;

$(window).ready(function() {
  if (SAFARI) {
    $("body").add("#update").add("#chart").addClass("safari");
    $("#update .safari").show();
    $("#logo").attr({
      src: "../images/chrollusion/safari.png", alt: "Collusion for Safari"
    });
    $("#show-badge").hide();
  } else {
    if (!deserialize(localStorage.promoHidden)) {
      localStorage.promoHidden = true;
      setTimeout(function() { setBadgeText({text: ''}); }, 200);
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
  $("#domain-infos").hide();
  if (sitesHidden) {
    $("#hide-sites").addClass("invisible").html("Show inactive sites");
  } else {
    $("#hide-sites").html("Hide inactive sites");
  }
  if (badgeHidden) {
    $("#show-badge").addClass("invisible").html("Show the tracking counter");
  } else {
    $("#show-badge").html("Hide the tracking counter");
  }
  $("#show-instructions").hide();
  if (trackingUnblocked) {
    $("#block-tracking").html("Block known tracking sites");
  } else {
    $("#block-tracking").addClass("blocked").html("Unblock known tracking sites");
  }
  updateClosed || $("#update").show();
  recommendsActivated && recommender.hasCampaign() && $("#recommends").show();
  var runner = GraphRunner.Runner({
    width: sidebarCollapsed ? SAFARI ? 791 : 794 : SAFARI ? 576 : 575,
    height:
        updateClosed ?
            SAFARI ? 597 : recommendsActivated ? 536 : 586 :
                SAFARI ? 556 : recommendsActivated ? 489 : 548,
    hideFavicons: false 
  });
  graph = runner.graph;

  if (addon.isInstalled()) {
    // You should only ever see this page if the addon is installed, anyway
    if (sidebarCollapsed) {
      $("#show-ui").slideDown(100);
      $("#chart").addClass("fullscreen");
    } else
      $("#sidebar").slideDown('fast');
    graph.update(backgroundPage.LOG);
    $("#reset-graph").click(function() {
      if (addon.resetGraph) {
        backgroundPage.LOG = {};
        window.location.reload();
      } else
        alert("You need to update your add-on to use this feature.");
    });
    $("#hide-sites").click(function() {
      localStorage.sitesHidden = sitesHidden = !sitesHidden;
      if (sitesHidden) location.reload();
      else {
        graph.update(backgroundPage.LOG);
        $(this).removeClass('invisible').html('Hide inactive sites');
      }
    });
    $("#hide-ui").click(function() {
      localStorage.sidebarCollapsed = 3;
      $("#sidebar, #domain-infos, #show-instructions").slideUp('fast');
      window.setTimeout(function() { window.location.reload(); }, 200);
    });
    $("#show-badge").click(function() {
      localStorage.badgeHidden = badgeHidden = !badgeHidden;
      if (badgeHidden) {
        $("#show-badge").addClass("invisible").html("Show the tracker counter");
        query({}, function(tabs) {
          var tabCount = tabs.length;
          for (var i = 0; i < tabCount; i++) {
            setBadgeText({text: '', tabId: tabs[i].id});
          }
        });
      } else {
        $("#show-badge").removeClass("invisible").html("Hide the tracker counter");
        query({}, function(tabs) {
          var tabCount = tabs.length;
          for (var i = 0; i < tabCount; i++) {
            var tabId = tabs[i].id;
            setBadgeText({
              text: (Object.keys(backgroundPage.tabs[tabId] || {}).length || '') + '',
              tabId: tabId
            });
          }
        });
      }
    });
    $("#show-instructions").click(function() {
      $("#domain-infos, #show-instructions").hide();
      $(".live-data").show();
    });
    $("#show-ui").click(function() {
      delete localStorage.sidebarCollapsed;
      $("#show-ui").slideUp(100);
      window.setTimeout(function() { window.location.reload(); }, 100);
    });
    $("#block-tracking").click(function() {
      localStorage.trackingUnblocked = !trackingUnblocked;
      window.location.reload();
    });
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
  }
});
