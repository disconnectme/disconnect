/*
  The script for a popup that displays and drives the blocking of requests.

  Copyright 2010-2013 Disconnect, Inc.

  This program is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  this program. If not, see <http://www.gnu.org/licenses/>.

  Authors (one per line):

    Brian Kennish <byoogle@gmail.com>
*/

/* Outputs major third-party details as per the blocking state. */
function renderShortcut(
  name,
  lowercaseName,
  blocked,
  requestCount,
  control,
  wrappedControl,
  badge,
  text,
  animation,
  callback
) {
  const COUNT =
      animation > 1 || whitelistingClicked && whitelistingClicked-- ? 21 :
          animation;

  if (blocked) {
    wrappedControl.removeClass(DEACTIVATED);
    control.title = UNBLOCK + name;
    for (var i = 0; i < COUNT; i++)
        setTimeout(function(badge, lowercaseName, index) {
          index || wrappedControl.off('mouseenter').off('mouseleave');
          badge.src =
              IMAGES + lowercaseName + '/' +
                  (index < 14 ? index + 1 : 4 - Math.abs(4 - index % 13)) +
                      (index < COUNT - 7 ? '-' + DEACTIVATED : '') + EXTENSION;

          if (index > COUNT - 2) {
            wrappedControl.mouseenter(function() {
              badge.src = badge.src.replace(EXTENSION, HIGHLIGHTED + EXTENSION);
            }).mouseleave(function() {
              badge.src = badge.src.replace(HIGHLIGHTED + EXTENSION, EXTENSION);
            });

            callback && wrappedControl.off('click').click(callback);
          }
        }, i * 40, badge, lowercaseName, i);
  } else {
    wrappedControl.addClass(DEACTIVATED);
    control.title = BLOCK + name;
    for (var i = 0; i < COUNT; i++)
        setTimeout(function(badge, lowercaseName, index) {
          index || wrappedControl.off('mouseenter').off('mouseleave');
          badge.src =
              IMAGES + lowercaseName + '/' +
                  (index < 14 ? index + 1 : 4 - Math.abs(4 - index % 13)) +
                      (index < COUNT - 7 ? '' : '-' + DEACTIVATED) + EXTENSION;

          if (index > COUNT - 2) {
            wrappedControl.mouseenter(function() {
              badge.src = badge.src.replace(EXTENSION, HIGHLIGHTED + EXTENSION);
            }).mouseleave(function() {
              badge.src = badge.src.replace(HIGHLIGHTED + EXTENSION, EXTENSION);
            });

            callback && wrappedControl.off('click').click(callback);
          }
        }, i * 40, badge, lowercaseName, i);
  }

  text.textContent = requestCount;
}

/* Restricts the animation of major third parties to 1x per click. */
function handleShortcut(
  domain,
  id,
  name,
  lowercaseName,
  requestCount,
  control,
  wrappedControl,
  badge,
  text
) {
  wrappedControl.off('click');
  var whitelisted = isWhitelisted(domain, 'Disconnect', name);
  renderShortcut(
    name,
    lowercaseName,
    !(changeWhitelist(!(whitelisted), domain, 'Disconnect', name)),
    requestCount,
    control,
    wrappedControl,
    badge,
    text,
    2,
    function() {
      handleShortcut(
        domain,
        id,
        name,
        lowercaseName,
        requestCount,
        control,
        wrappedControl,
        badge,
        text
      );
    }
  );
  renderWhitelisting(getSiteWhitelist(domain));
  TABS.reload(id);
}

/* Refreshes major third-party details. */
function updateShortcut(id, name, count) {
  TABS.query({currentWindow: true, active: true}, function(tabs) {
    if (id == tabs[0].id) {
      const DISCONNECT_LIVE =
          LIVE_REQUESTS.Disconnect || (LIVE_REQUESTS.Disconnect = {});
      DISCONNECT_LIVE[name] === undefined && (DISCONNECT_LIVE[name] = 0);

      setTimeout(function() {
        $($('.shortcut .text')[SHORTCUTS.indexOf(name) + 1]).text(count);
      }, DISCONNECT_LIVE[name]++ * 50);
    }
  });
}

/* Outputs minor third-party details as per the blocking state. */
function renderCategory(
  name,
  lowercaseName,
  blocked,
  requestCount,
  control,
  wrappedControl,
  badge,
  badgeIcon,
  text,
  textName,
  textCount,
  animation,
  callback
) {
  const CONTENT = name == CONTENT_NAME;
  const COUNT =
      animation > 1 ||
          whitelistingClicked && whitelistingClicked-- && !(
            CONTENT &&
                $('.whitelisting').filter('.text').text() == 'Whitelist site'
          ) ? 21 : animation;
  const WRAPPED_BADGE = $(badge);

  if (blocked) {
    wrappedControl.removeClass(DEACTIVATED);
    badge.title =
        UNBLOCK + lowercaseName + (CONTENT ? ' (' + RECOMMENDED + ')' : '');
    for (var i = 0; i < COUNT; i++)
        setTimeout(function(badgeIcon, lowercaseName, index) {
          index || WRAPPED_BADGE.off('mouseenter').off('mouseleave');
          badgeIcon.src =
              IMAGES + lowercaseName + '/' +
                  (index < 14 ? index + 1 : 4 - Math.abs(4 - index % 13)) +
                      (index < COUNT - 7 ? '-' + DEACTIVATED : '') + EXTENSION;

          if (index > COUNT - 2) {
            WRAPPED_BADGE.mouseenter(function() {
              badgeIcon.src =
                  badgeIcon.src.replace(EXTENSION, HIGHLIGHTED + EXTENSION);
            }).mouseleave(function() {
              badgeIcon.src =
                  badgeIcon.src.replace(HIGHLIGHTED + EXTENSION, EXTENSION);
            });

            callback && WRAPPED_BADGE.off('click').click(callback);
          }
        }, i * 40, badgeIcon, lowercaseName, i);
  } else {
    wrappedControl.addClass(DEACTIVATED);
    badge.title =
        BLOCK + lowercaseName + (CONTENT ? ' (not ' + RECOMMENDED + ')' : '');
    for (var i = 0; i < COUNT; i++)
        setTimeout(function(badgeIcon, lowercaseName, index) {
          index || WRAPPED_BADGE.off('mouseenter').off('mouseleave');
          badgeIcon.src =
              IMAGES + lowercaseName + '/' +
                  (index < 14 ? index + 1 : 4 - Math.abs(4 - index % 13)) +
                      (index < COUNT - 7 ? '' : '-' + DEACTIVATED) + EXTENSION;

          if (index > COUNT - 2) {
            WRAPPED_BADGE.mouseenter(function() {
              badgeIcon.src =
                  badgeIcon.src.replace(EXTENSION, HIGHLIGHTED + EXTENSION);
            }).mouseleave(function() {
              badgeIcon.src =
                  badgeIcon.src.replace(HIGHLIGHTED + EXTENSION, EXTENSION);
            });

            callback && WRAPPED_BADGE.off('click').click(callback);
          }
        }, i * 40, badgeIcon, lowercaseName, i);
  }

  textName.text(name);
  textCount.text(requestCount + REQUEST + (requestCount - 1 ? 's' : ''));
}

/* Restricts the animation of minor third parties to 1x per click. */
function handleCategory(
  domain,
  id,
  name,
  lowercaseName,
  requestCount,
  categoryControl,
  wrappedCategoryControl,
  badge,
  badgeIcon,
  text,
  textName,
  textCount,
  serviceSurface
) {
  $(badge).off('click');
  whitelist = DESERIALIZE(options.whitelist) || {};
  whitelist[domain] = whitelist[domain] || createWhitelist();

  //What is changing content?
  if (name == 'Content' && !(whitelist[domain].Content.whitelisted)) {
    var whitelisted = isWhitelisted(domain, name);
  }
  else var whitelisted = !(isWhitelisted(domain, name));
  chrome.extension.getBackgroundPage().console.log(whitelisted);
  changeWhitelist(whitelisted, domain, name);
  changeBlacklist(!(whitelisted), domain, name);

  renderCategory(
    name,
    lowercaseName,
    !whitelisted,
    requestCount,
    categoryControl,
    wrappedCategoryControl,
    badge,
    badgeIcon,
    text,
    textName,
    textCount,
    2,
    function() {
      handleCategory(
        domain,
        id,
        name,
        lowercaseName,
        requestCount,
        categoryControl,
        wrappedCategoryControl,
        badge,
        badgeIcon,
        text,
        textName,
        textCount,
        serviceSurface
      );
    }
  );

  serviceSurface.find(INPUT).each(function(index) {
    if (index) this.checked = !whitelisted;
  });

  renderWhitelisting(whitelist[domain]);
  TABS.reload(id);
}

/* Refreshes minor third-party details. */
function updateCategory(
  id, categoryName, categoryCount, serviceName, serviceUrl, serviceCount
) {
  TABS.query({currentWindow: true, active: true}, function(tabs) {
    const TAB = tabs[0];
    const DOMAIN = domain = GET(TAB.url);
    const ID = tabId = TAB.id;

    if (id == ID) {
      const CATEGORY_LIVE =
          LIVE_REQUESTS[categoryName] || (LIVE_REQUESTS[categoryName] = {});
      CATEGORY_LIVE[serviceName] === undefined &&
          (CATEGORY_LIVE[serviceName] = 0);
      const INDEX = CATEGORIES.indexOf(categoryName) + 1;

      setTimeout(function() {
        $($('.category .count')[INDEX]).
          text(categoryCount + REQUEST + (categoryCount - 1 ? 's' : ''));
        const CONTROL = $($('.services')[INDEX]);
        var serviceControl =
            CONTROL.find('.service:contains(' + serviceName + ')');

        if (serviceControl[0])
            serviceControl.
              find('.text').
              text(serviceCount + REQUEST + (serviceCount - 1 ? 's' : ''));
        else {
          serviceControl = serviceTemplate.clone(true);
          const CHECKBOX = serviceControl.find(INPUT)[0];

          var whitelisted = isWhitelisted(DOMAIN, categoryName, serviceName);
         
          CHECKBOX.checked = !(whitelisted); 

          $(CHECKBOX).off('click');

          CHECKBOX.onclick = function(categoryName, serviceName) {

            var whitelisted = isWhitelisted(DOMAIN, categoryName, serviceName);
            changeWhitelist(!(whitelisted), DOMAIN, categoryName, serviceName);
            changeBlacklist(whitelisted, DOMAIN, categoryName, serviceName);
            this.checked = !(whitelisted);
            TABS.reload(ID);
          }.bind(null, categoryName, serviceName);

          const LINK = serviceControl.find('a')[0];
          LINK.title += serviceName;
          LINK.href = serviceUrl;
          $(LINK).text(serviceName);
          serviceControl.
            find('.text').
            text(serviceCount + REQUEST + (serviceCount - 1 ? 's' : ''));
          CONTROL.find('tbody').append(serviceControl);
        }
      }, CATEGORY_LIVE[serviceName]++ * 50);
    }
  });
}

/* Outputs third-party details as per the blocking state. */
function renderService(
  name, lowercaseName, blocked, requestCount, control, badge, text
) {
  if (blocked) {
    control.title = 'Unblock ' + name;
    badge.src = IMAGES + LEGACY + '/' + lowercaseName + '-activated.png';
    text.removeAttribute('class');
    text.textContent = requestCount + ' blocked';
  } else {
    control.title = 'Block ' + name;
    badge.src = IMAGES + LEGACY + '/' + lowercaseName + '-deactivated.png';
    text.className = 'deactivated';
    text.textContent = requestCount + ' unblocked';
  }
}

/* Resets third-party details. */
function clearServices(id) {
  TABS.query({currentWindow: true, active: true}, function(tabs) {
    if (id == tabs[0].id) {

      for (var i = 0; i < SHORTCUT_COUNT; i++) {
        var name = SHORTCUTS[i];
        var control = $('.shortcut')[i + 1];
        renderShortcut(
          name,
          name.toLowerCase(),
          !(isWhitelisted(domain, 'Disconnect', name)),
          0,
          control,
          $(control),
          control.
            getElementsByClassName('badge')[0].
            getElementsByTagName('img')[0],
          control.getElementsByClassName('text')[0],
          0
        );
      }

      for (i = 0; i < CATEGORY_COUNT; i++) {
        var name = CATEGORIES[i];
        var whitelisted = isWhitelisted(domain, name);
        var control = $('.category')[i + 1];
        var wrappedControl = $(control);
        var wrappedBadge = wrappedControl.find('.badge');
        var wrappedText = wrappedControl.find('.text');
        renderCategory(
          name,
          name.toLowerCase(),
          !(whitelisted || name == CONTENT_NAME && whitelisted !== false),
          0,
          control,
          wrappedControl,
          wrappedBadge[0],
          wrappedBadge.find('img')[0],
          wrappedText[0],
          wrappedText.find('.name'),
          wrappedText.find('.count'),
          0
        );
      }

      const WRAPPED_BUTTON = $('.category .action img[src*=7]');
      const BUTTON = WRAPPED_BUTTON[0];
      const ACTION = WRAPPED_BUTTON.parent();
      BUTTON && animateAction(
        ACTION[0],
        BUTTON,
        ACTION.prev().find('.name').text().toLowerCase()
      );
      const CONTROL = $('.services');
      CONTROL.find('div:visible').slideUp('fast');

      setTimeout(function() {
        CONTROL.each(function(index) {
          index && $(this).find('.service').each(function(index) {
            index && $(this).remove();
          });
        });
      }, 200);
    }
  });
}

/* Plays an expanding or collapsing animation. */
function animateAction(action, button, name) {
  const COLLAPSED = button.src.indexOf(1 + HIGHLIGHTED) + 1;

  if (COLLAPSED) {
    action.title = COLLAPSE + ' ' + name;
    button.alt = COLLAPSE;
  } else {
    action.title = EXPAND + ' ' + name;
    button.alt = EXPAND;
  }

  var previousFrame;
  var currentFrame;
  for (var i = 0; i < 10; i++)
      setTimeout(function(index) {
        if (COLLAPSED) {
          previousFrame = index < 9 ? index + 1 : 8;
          currentFrame = index < 8 ? index + 2 : 16 - index;
        } else {
          previousFrame = index < 7 ? 7 - index : Math.abs(8 - index) + 10;
          currentFrame =
              index < 6 ? 6 - index : (Math.abs(7 - index) + 9) % 11 + 1;
        }

        button.src =
            button.src.replace(
              '/' + previousFrame + '.',
              '/' + currentFrame + '.'
            );
        button.src =
            button.src.replace(
              '/' + previousFrame + '-',
              '/' + currentFrame + '-'
            );
      }, i * 25, i);
}

/* Outputs the global blocking state. */
function renderWhitelisting(siteWhitelist) {
  const SERVICE_WHITELIST = (siteWhitelist.Disconnect || {}).services || {};
  const WHITELISTING = $('.whitelisting');
  const WHITELISTING_ICON = WHITELISTING.find('img')[0];
  const WHITELISTING_TEXT = WHITELISTING.filter('.text');

  if (
    SERVICE_WHITELIST.Facebook && SERVICE_WHITELIST.Google &&
        SERVICE_WHITELIST.Twitter &&
            (siteWhitelist.Advertising || {}).whitelisted &&
                (siteWhitelist.Analytics || {}).whitelisted &&
                    (siteWhitelist.Social || {}).whitelisted &&
                        (siteWhitelist.Content || {}).whitelisted !== false
  ) {
    WHITELISTING_ICON.alt = 'Blacklist';
    WHITELISTING_TEXT.text('Blacklist site');
  } else {
    WHITELISTING_ICON.alt = 'Whitelist';
    WHITELISTING_TEXT.text('Whitelist site');
  }

  return {
    control: WHITELISTING, icon: WHITELISTING_ICON, text: WHITELISTING_TEXT
  };
}

/* Plays a whitelist animation. */
function animateWhitelisting(icon, callback) {
  for (var i = 1; i < 21; i++)
      setTimeout(function(index) {
        icon.src = IMAGES + 'list/' + (index % 20 + 1) + EXTENSION;
        index == 20 && callback && callback();
      }, (i - 1) * 50, i);
}

/* Picks a random animation path. */
function getScene() {
  return SCENES.splice(Math.floor(Math.random() * SCENES.length), 1)[0];
}

/* Plays a random visualization animation. */
function animateVisualization(icon, callback) {
  for (var i = 0; i < FRAME_COUNT - 1; i++)
      setTimeout(function(scene, index) {
        icon.src = IMAGES + scene + '/' + (index + 2) + EXTENSION;
      }, i * FRAME_LENGTH, currentScene, i);
  const PREVIOUS_SCENE = currentScene;
  currentScene = getScene();
  SCENES.push(PREVIOUS_SCENE);
  for (i = 0; i < FRAME_COUNT; i++)
      setTimeout(function(scene, index) {
        icon.src = IMAGES + scene + '/' + (FRAME_COUNT - index) + EXTENSION;
        index == FRAME_COUNT - 1 && callback && callback();
      }, (i + FRAME_COUNT - 1) * FRAME_LENGTH, currentScene, i);
}

/* Outputs a blocked request. */
function renderBlockedRequest(id, blockedCount, totalCount, weighted) {
  if (id == tabId) {
    d3.select('.subtotal.speed').remove();
    const HEIGHT = (blockedCount / totalCount || 0) * 35;
    const SPEED_HEIGHT = Math.round(HEIGHT * (weighted ? 1 : TIME_CONSTANT));
    const BANDWIDTH_HEIGHT =
        Math.round(HEIGHT * (weighted ? 1 : SIZE_CONSTANT));
    dashboard.
      insert('svg:rect', '.control.speed').
      attr('class', 'subtotal speed').
      attr('x', 29).
      attr('y', 38 - SPEED_HEIGHT).
      attr('width', 8).
      attr('height', SPEED_HEIGHT).
      attr('fill', '#ff7f00');
    d3.select('.subtotal.bandwidth').remove();
    dashboard.
      insert('svg:rect', '.control.bandwidth').
      attr('class', 'subtotal bandwidth').
      attr('x', 95).
      attr('y', 38 - BANDWIDTH_HEIGHT).
      attr('width', 8).
      attr('height', BANDWIDTH_HEIGHT).
      attr('fill', '#ffbf3f');
  }
}

/* Outputs a secured request. */
function renderSecuredRequest(id, securedCount, totalCount) {
  if (id == tabId) {
    d3.select('.subtotal.security').remove();
    const HEIGHT = Math.round((securedCount / totalCount || 0) * 35);
    dashboard.
      insert('svg:rect', '.control.security').
      attr('class', 'subtotal security').
      attr('x', 161).
      attr('y', 38 - HEIGHT).
      attr('width', 8).
      attr('height', HEIGHT).
      attr('fill', '#00bfff');
  }
}

/* Outputs total, blocked, and secured requests. */
function renderGraphs() {
  d3.select('.control.speed').remove();
  dashboard.
    append('svg:rect').
    attr('class', 'control speed').
    attr('x', 10).
    attr('y', 0).
    attr('width', 46).
    attr('height', 40).
    attr('fill', 'transparent');
  Tipped.remove('.control.speed');
  $('#' + LIST).append($($('.sharing.speed')[0]).clone(true));

  Tipped.create('.control.speed', $('.sharing.speed')[0], {
    skin: 'tiny',
    offset: {x: 23},
    shadow: {opacity: .1},
    stem: {spacing: 0},
    background: {color: '#333', opacity: .9},
    onShow: function() {
      const TAB_DASHBOARD = DASHBOARD[tabId] || {};
      const BLOCKED_COUNT = TAB_DASHBOARD.blocked || 0;
      const TOTAL_COUNT = TAB_DASHBOARD.total || 0;
      $('.sharing.speed .text').text((
        (BLOCKED_COUNT / TOTAL_COUNT || 0) * TIME_CONSTANT * 100
      ).toFixed() + '% (' + (
        BLOCKED_COUNT * TRACKING_RESOURCE_TIME / 1000
      ).toFixed(1) + 's) faster');
    },
    fadeIn: 400,
    fadeOut: 400
  });

  d3.select('.control.bandwidth').remove();
  dashboard.
    append('svg:rect').
    attr('class', 'control bandwidth').
    attr('x', 76).
    attr('y', 0).
    attr('width', 46).
    attr('height', 40).
    attr('fill', 'transparent');
  Tipped.remove('.control.bandwidth');
  $('#' + LIST).append($($('.sharing.bandwidth')[0]).clone(true));

  Tipped.create('.control.bandwidth', $('.sharing.bandwidth')[0], {
    skin: 'tiny',
    offset: {x: 23},
    shadow: {opacity: .1},
    stem: {spacing: 0},
    background: {color: '#333', opacity: .9},
    onShow: function() {
      const TAB_DASHBOARD = DASHBOARD[tabId] || {};
      const BLOCKED_COUNT = TAB_DASHBOARD.blocked || 0;
      const TOTAL_COUNT = TAB_DASHBOARD.total || 0;
      $('.sharing.bandwidth .text').text((
        (BLOCKED_COUNT / TOTAL_COUNT || 0) * SIZE_CONSTANT * 100
      ).toFixed() + '% (' + (
        BLOCKED_COUNT * TRACKING_RESOURCE_SIZE
      ).toFixed() + 'K) less data');
    },
    fadeIn: 400,
    fadeOut: 400
  });

  d3.select('.control.security').remove();
  dashboard.
    append('svg:rect').
    attr('class', 'control security').
    attr('x', 142).
    attr('y', 0).
    attr('width', 46).
    attr('height', 40).
    attr('fill', 'transparent');
  Tipped.remove('.control.security');
  $('#' + LIST).append($($('.sharing.security')[0]).clone(true));

  Tipped.create('.control.security', $('.sharing.security')[0], {
    skin: 'tiny',
    offset: {x: 23},
    shadow: {opacity: .1},
    stem: {spacing: 0},
    background: {color: '#333', opacity: .9},
    onShow: function() {
      const SECURED_COUNT = (DASHBOARD[tabId] || {}).secured || 0;
      $('.sharing.security .text').text(
        SECURED_COUNT + ' secured' + REQUEST + (SECURED_COUNT - 1 ? 's' : '')
      );
    },
    fadeIn: 400,
    fadeOut: 400
  });

  const TAB_DASHBOARD = DASHBOARD[tabId] || {};
  const BLOCKED_COUNT = TAB_DASHBOARD.blocked || 0;
  const TOTAL_COUNT = TAB_DASHBOARD.total || 0;
  const SECURED_COUNT = TAB_DASHBOARD.secured || 0;
  const ITERATIONS = Math.round(Math.max(
    (BLOCKED_COUNT / TOTAL_COUNT || 0) * TIME_CONSTANT,
    SECURED_COUNT / TOTAL_COUNT || 0
  ) * 13) + 23;
  const DUMMY_COUNT = TOTAL_COUNT || 1;
  const WEIGHTED = ITERATIONS == 23;

  for (var i = 1; i < ITERATIONS; i++) {
    setTimeout(function(index, delay) {
      if (index < 21) {
        d3.select('.total.speed').remove();
        const HEIGHT = (index > 19 ? 19 - index % 19 : index) * 2;
        const Y = 38 - HEIGHT;
        dashboard.
          insert('svg:rect', '.subtotal.speed').
          attr('class', 'total speed').
          attr('x', 28).
          attr('y', Y).
          attr('width', 10).
          attr('height', HEIGHT).
          attr('fill', '#ff3f00');
        d3.select('.total.bandwidth').remove();
        dashboard.
          insert('svg:rect', '.subtotal.bandwidth').
          attr('class', 'total bandwidth').
          attr('x', 94).
          attr('y', Y).
          attr('width', 10).
          attr('height', HEIGHT).
          attr('fill', '#ff7f00');
        d3.select('.total.security').remove();
        dashboard.
          insert('svg:rect', '.subtotal.security').
          attr('class', 'total security').
          attr('x', 160).
          attr('y', Y).
          attr('width', 10).
          attr('height', HEIGHT).
          attr('fill', '#007fff');
      }

      if (index > 15) {
        const DEFAULT_COUNT = DUMMY_COUNT * .28;
        const OFFSET_INDEX = index - 15;
        const MODULUS = ITERATIONS - 17;
        const FRACTION = (
          OFFSET_INDEX > MODULUS ? MODULUS - OFFSET_INDEX % MODULUS :
              OFFSET_INDEX
        ) / (ITERATIONS - 18);
        renderBlockedRequest(
          tabId,
          Math.min(BLOCKED_COUNT + DEFAULT_COUNT, DUMMY_COUNT) * FRACTION,
          DUMMY_COUNT,
          WEIGHTED
        );
        renderSecuredRequest(
          tabId,
          Math.min(SECURED_COUNT + DEFAULT_COUNT, DUMMY_COUNT) * FRACTION,
          DUMMY_COUNT
        );
      }

      if (timeout) timeout = (ITERATIONS - index - 1) * 25;
    }, i * 25, i);
  }
}

/* Restricts the whitelist animation to 1x per mouseover. */
function handleWhitelisting() {
  const TARGET = $('.' + this.className.split(' ', 1));
  TARGET.off('mouseenter');

  animateWhitelisting(TARGET.find('img')[0], function() {
    TARGET.mouseenter(handleWhitelisting);
  });
}

/* Restricts the visualization animation to 1x per mouseover. */
function handleVisualization() {
  const TARGET = $('.' + this.className.split(' ', 1));
  TARGET.off('mouseenter');

  animateVisualization(TARGET.find('img')[0], function() {
    TARGET.mouseenter(handleVisualization);
  });
}

/* The background window. */
const BACKGROUND = chrome.extension.getBackgroundPage();

/* The domain getter. */
const GET = BACKGROUND.GET;

/* The object deserializer. */
const DESERIALIZE = BACKGROUND.deserialize;

/* The major third parties. */
const SHORTCUTS = ['Facebook', 'Google', 'Twitter'];

/* The number of major third parties. */
const SHORTCUT_COUNT = SHORTCUTS.length;

/* The other types of third parties. */
const CATEGORIES = ['Advertising', 'Analytics', 'Social', 'Content'];

/* The number of other types of third parties. */
const CATEGORY_COUNT = CATEGORIES.length;

/* The third parties. */
const SERVICES = ['Facebook', 'Google', 'LinkedIn', 'Twitter', 'Yahoo'];

/* The number of third parties. */
const SERVICE_COUNT = SERVICES.length;

/* The "tabs" API. */
const TABS = BACKGROUND.TABS;

/* The content key. */
const CONTENT_NAME = BACKGROUND.CONTENT_NAME;

/* The list keyword. */
const LIST = 'list';

/* The graph keyword. */
const GRAPH = 'graph';

/* The legacy keyword. */
const LEGACY = 'legacy';

/* The deactivated keyword. */
const DEACTIVATED = 'deactivated';

/* The highlighted keyword. */
const HIGHLIGHTED = '-highlighted';

/* The expand keyword. */
const EXPAND = 'Expand';

/* The collapse keyword. */
const COLLAPSE = 'Collapse';

/* The recommended keyword. */
const RECOMMENDED = 'recommended';

/* The request keyword. */
const REQUEST = ' request';

/* The input keyword. */
const INPUT = 'input';

/* The blocking command. */
const BLOCK = 'Block ';

/* The unblocking command. */
const UNBLOCK = 'Unblock ';

/* The image directory. */
const IMAGES = '../images/';

/* The image extension. */
const EXTENSION = '.png';

/* The animation sequences. */
const SCENES = [1, 2, 3, 4, 5];

/* The number of animation cells. */
const FRAME_COUNT = 7;

/* The duration of animation cells. */
const FRAME_LENGTH = 100;

/* The number of request updates. */
const LIVE_REQUESTS = {};

/* The number of total, blocked, and secured requests per tab. */
const DASHBOARD = BACKGROUND.DASHBOARD;

/* The mean load time of a tracking resource in milliseconds. */
const TRACKING_RESOURCE_TIME = 72.6141083689391;

/* The mean load time of a resource in milliseconds. */
const RESOURCE_TIME = 55.787731003361;

/* The ratio of mean load times. */
const TIME_CONSTANT = TRACKING_RESOURCE_TIME / RESOURCE_TIME;

/* The mean file size of a tracking resource in kilobytes. */
const TRACKING_RESOURCE_SIZE = 8.51145760261889;

/* The mean file size of a resource in kilobytes. */
const RESOURCE_SIZE = 10.4957370842049;

/* The ratio of mean file sizes. */
const SIZE_CONSTANT = TRACKING_RESOURCE_SIZE / RESOURCE_SIZE;

/* The service scaffolding. */
var serviceTemplate;

/* The active animation sequence. */
var currentScene = getScene();

/* The dashboard container. */
var dashboard;

/* The remaining load time in milliseconds. */
var timeout = 1600;

/* Whether or not the whitelist button was clicked. */
var whitelistingClicked = 0;

var whitelist = DESERIALIZE(options.whitelist) || {};

/* Paints the UI. */
(SAFARI ? safari.application : window).addEventListener(
  SAFARI ? 'popover' : 'load', function() {
    var displayMode = options.displayMode;
    const VIEWPORT = $('html').add('body');

    if (!displayMode || displayMode == LEGACY) {
      VIEWPORT.height(SAFARI ? 217 : 230);
      const WRAPPED_THEME = $('#' + LEGACY);
      WRAPPED_THEME.show();
      const THEME = WRAPPED_THEME[0];

      TABS.query({currentWindow: true, active: true}, function(tabs) {
        const TAB = tabs[0];
        const ID = TAB.id;
        const CATEGORY_REQUESTS =
            (BACKGROUND.REQUEST_COUNTS[ID] || {}).Disconnect || {};
        const SURFACE = THEME.getElementsByTagName('tbody')[0];
        const TEMPLATE = SURFACE.getElementsByTagName('tr')[0];
        var expiredControl;
        while (expiredControl = TEMPLATE.nextSibling)
            SURFACE.removeChild(expiredControl);
        const DOMAIN = GET(TAB.url);

        for (var i = 0; i < SERVICE_COUNT; i++) {
          var name = SERVICES[i];
          var lowercaseName = name.toLowerCase();
          var serviceRequests = CATEGORY_REQUESTS[name];
          var requestCount = serviceRequests ? serviceRequests.count : 0;
          var control = SURFACE.appendChild(TEMPLATE.cloneNode(true));
          var badge = control.getElementsByTagName('img')[0];
          var text = control.getElementsByTagName('td')[1];
          renderService(
            name,
            lowercaseName,
            !(isWhitelisted(DOMAIN, 'Disconnect', name)),
            requestCount,
            control,
            badge,
            text
          );
          badge.alt = name;
          $(control).off('mouseover').off('mouseout').off('click');

          control.onmouseover = function() { this.className = 'mouseover'; };

          control.onmouseout = function() { this.removeAttribute('class'); };

          control.onclick = function(
            name, lowercaseName, requestCount, control, badge, text
          ) {
            var whitelisted = isWhitelisted(DOMAIN, 'Disconnect', name);
            renderService(
              name,
              lowercaseName,
              !(changeWhitelist(!(whitelisted), DOMAIN, 'Disconnect', name)),
              requestCount,
              control,
              badge,
              text
            );
            TABS.reload(ID);
          }.bind(null, name, lowercaseName, requestCount, control, badge, text);
        }
      });

      SAFARI && $('#minioptions').hide();

      if (DESERIALIZE(options.searchHardenable)) {
        const LEGACY_SEARCH = THEME.getElementsByClassName('search')[0];
        LEGACY_SEARCH.className = 'shown';
        const SEARCHBOX = LEGACY_SEARCH.getElementsByTagName('input')[0];
        SEARCHBOX.checked = DESERIALIZE(options.searchHardened);
        $(SEARCHBOX).off('click');

        SEARCHBOX.onclick = function() {
          SEARCHBOX.checked =
              options.searchHardened = !DESERIALIZE(options.searchHardened);
        };
      }

      const WIFIBOX =
          THEME.
            getElementsByClassName('wifi')[0].
            getElementsByTagName('input')[0];
      WIFIBOX.checked = DESERIALIZE(options.browsingHardened);
      $(WIFIBOX).off('click');

      WIFIBOX.onclick = function() {
        WIFIBOX.checked =
            options.browsingHardened = !DESERIALIZE(options.browsingHardened);
      };

      const LINKS = THEME.getElementsByTagName('a');
      const LINK_COUNT = LINKS.length;

      for (var i = 0; i < LINK_COUNT; i++) {
        $(LINKS[i]).off('click');

        LINKS[i].onclick = function() {
          TABS.create({url: this.getAttribute('href')});
          return false;
        };
      }
    } else {
      if (SAFARI) {
        safari.self.width = 200;
        safari.self.height = 306;
      }

      $('#navbar img').off('mouseenter').mouseenter(function() {
        this.src = this.src.replace(EXTENSION, HIGHLIGHTED + EXTENSION);
      }).off('mouseleave').mouseleave(function() {
        this.src = this.src.replace(HIGHLIGHTED + EXTENSION, EXTENSION);
      });

      Tipped.remove('#navbar span');
      $('#' + LIST).append($($('.sharing.disconnect')[0]).clone(true));

      Tipped.create('#navbar span', $('.sharing.disconnect')[0], {
        skin: 'tiny',
        shadow: {color: '#fff', opacity: .1},
        stem: {spacing: -1},
        background: {color: '#333', opacity: .9},
        onShow: function() {
          const BLOCKED_COUNT = (DASHBOARD[tabId] || {}).blocked || 0;
          $('.sharing.disconnect .text').text(
            BLOCKED_COUNT + ' blocked' + REQUEST +
                (BLOCKED_COUNT - 1 ? 's' : '')
          );
        },
        fadeIn: 400,
        fadeOut: 400
      });

      var activeServices = $();

      TABS.query({currentWindow: true, active: true}, function(tabs) {
        const TAB = tabs[0];
        const DOMAIN = domain = GET(TAB.url);
        const ID = tabId = TAB.id;
        const TAB_REQUESTS = BACKGROUND.REQUEST_COUNTS[ID] || {};
        const DISCONNECT_REQUESTS = TAB_REQUESTS.Disconnect || {};
        const SHORTCUT_SURFACE =
            document.getElementById('shortcuts').getElementsByTagName('td')[0];
        const SHORTCUT_TEMPLATE =
            SHORTCUT_SURFACE.getElementsByClassName('shortcut')[0];
        const SITE_WHITELIST = getSiteWhitelist(DOMAIN);
        const SHORTCUT_WHITELIST =
            (SITE_WHITELIST.Disconnect || {}).services || {};
        var expiredShortcuts;
        while (expiredShortcuts = SHORTCUT_TEMPLATE.nextSibling)
            SHORTCUT_SURFACE.removeChild(expiredShortcuts);

        for (var i = 0; i < SHORTCUT_COUNT; i++) {
          var name = SHORTCUTS[i];
          var lowercaseName = name.toLowerCase();
          var shortcutRequests = DISCONNECT_REQUESTS[name];
          var requestCount = shortcutRequests ? shortcutRequests.count : 0;
          var control =
              SHORTCUT_SURFACE.appendChild(SHORTCUT_TEMPLATE.cloneNode(true));
          var wrappedControl = $(control);
          var badge =
              control.
                getElementsByClassName('badge')[0].
                getElementsByTagName('img')[0];
          var text = control.getElementsByClassName('text')[0];
          renderShortcut(
            name,
            lowercaseName,
            !(isWhitelisted(DOMAIN, 'Disconnect', name);),
            requestCount,
            control,
            wrappedControl,
            badge,
            text,
            1
          );
          badge.alt = name;

          wrappedControl.off('click').click(function(
            name,
            lowercaseName,
            requestCount,
            control,
            wrappedControl,
            badge,
            text
          ) {
            handleShortcut(
              DOMAIN,
              ID,
              name,
              lowercaseName,
              requestCount,
              control,
              wrappedControl,
              badge,
              text
            );
          }.bind(
            null,
            name,
            lowercaseName,
            requestCount,
            control,
            wrappedControl,
            badge,
            text
          ));
        }

        const CATEGORY_SURFACE = $('#categories');
        CATEGORY_SURFACE.children().slice(3).remove();
        const CATEGORY_TEMPLATE = CATEGORY_SURFACE.children();
        serviceTemplate = CATEGORY_TEMPLATE.find('.service');

        for (i = 0; i < CATEGORY_COUNT; i++) {
          var name = CATEGORIES[i];
          var lowercaseName = name.toLowerCase();
          var categoryRequests = TAB_REQUESTS[name];
          var requestCount = 0;
          var categoryControls = CATEGORY_TEMPLATE.clone(true);
          var wrappedCategoryControl = categoryControls.filter('.category');
          var categoryControl = wrappedCategoryControl[0];
          var serviceContainer =
              categoryControls.filter('.services').find('div');
          var serviceSurface = serviceContainer.find('tbody');
          var wrappedBadge = wrappedCategoryControl.find('.badge');
          var badge = wrappedBadge[0];
          var badgeIcon = wrappedBadge.find('img')[0];
          var wrappedText = wrappedCategoryControl.find('.text');
          var text = wrappedText[0];
          var textName = wrappedText.find('.name');
          var textCount = wrappedText.find('.count');
          var whitelisted = isWhitelisted(DOMAIN, name);

          for (var serviceName in categoryRequests) {
            var serviceControl = serviceTemplate.clone(true);
            var checkbox = serviceControl.find(INPUT)[0];
            checkbox.checked =
                !whitelisted && !(isWhitelisted(DOMAIN, name, serviceName));
            $(checkbox).off('click');

            checkbox.onclick = function(name, serviceName) {
              const WHITELIST = DESERIALIZE(options.whitelist) || {};
              const LOCAL_SITE_WHITELIST =
                  WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
              const CONTENT = name == CONTENT_NAME;
              const CATEGORY_WHITELIST =
                  LOCAL_SITE_WHITELIST[name] ||
                      (LOCAL_SITE_WHITELIST[name] =
                          {whitelisted: CONTENT, services: {}});
              const SERVICE_WHITELIST = CATEGORY_WHITELIST.services;
              const WHITELISTED = SERVICE_WHITELIST[serviceName];

              const BLACKLIST = DESERIALIZE(options.blacklist) || {};
              const LOCAL_SITE_BLACKLIST =
                  BLACKLIST[DOMAIN] || (BLACKLIST[DOMAIN] = {});
              const CATEGORY_BLACKLIST =
                  LOCAL_SITE_BLACKLIST[name] ||
                      (LOCAL_SITE_BLACKLIST[name] = {});
              var whitelisted = isWhitelisted(DOMAIN, name, serviceName);
              this.checked =
                  SERVICE_WHITELIST[serviceName] =
                      !(CATEGORY_BLACKLIST[serviceName] =
                          WHITELISTED ||
                              CONTENT && CATEGORY_WHITELIST.whitelisted &&
                                  WHITELISTED !== false);
              options.whitelist = JSON.stringify(WHITELIST);
              options.blacklist = JSON.stringify(BLACKLIST);
              TABS.reload(ID);
            }.bind(null, name, serviceName);

            var link = serviceControl.find('a')[0];
            link.title += serviceName;
            var service = categoryRequests[serviceName];
            link.href = service.url;
            $(link).text(serviceName);
            var serviceCount = service.count;
            serviceControl.
              find('.text').
              text(serviceCount + REQUEST + (serviceCount - 1 ? 's' : ''));
            serviceSurface.append(serviceControl);
            requestCount += serviceCount;
          }

          renderCategory(
            name,
            lowercaseName,
            !whitelisted,
            requestCount,
            categoryControl,
            wrappedCategoryControl,
            badge,
            badgeIcon,
            text,
            textName,
            textCount,
            1
          );
          badge.alt = name;

          wrappedBadge.off('click').click(function(
            name,
            lowercaseName,
            requestCount,
            categoryControl,
            wrappedCategoryControl,
            badge,
            badgeIcon,
            text,
            textName,
            textCount,
            serviceSurface
          ) {
            handleCategory(
              DOMAIN,
              ID,
              name,
              lowercaseName,
              requestCount,
              categoryControl,
              wrappedCategoryControl,
              badge,
              badgeIcon,
              text,
              textName,
              textCount,
              serviceSurface
            );
          }.bind(
            null,
            name,
            lowercaseName,
            requestCount,
            categoryControl,
            wrappedCategoryControl,
            badge,
            badgeIcon,
            text,
            textName,
            textCount,
            serviceSurface
          ));

          var wrappedAction = wrappedCategoryControl.find('.action');
          var action = wrappedAction[0];
          action.title = text.title = EXPAND + ' ' + lowercaseName;
          var button = wrappedAction.find('img')[0];

          wrappedText.
            add(wrappedAction).
            off('mouseenter').
            mouseenter(function(button) {
              button.src =
                  button.src.replace(EXTENSION, HIGHLIGHTED + EXTENSION);
            }.bind(null, button)).
            off('mouseleave').
            mouseleave(function(button) {
              button.src =
                  button.src.replace(HIGHLIGHTED + EXTENSION, EXTENSION);
            }.bind(null, button)).
            off('click').
            click(function(serviceContainer, action, button, name) {
              const EXPANDED_SERVICES = activeServices.filter(':visible');
              if (
                EXPANDED_SERVICES.length && serviceContainer != activeServices
              ) {
                animateAction(
                  action,
                  EXPANDED_SERVICES.
                    parent().
                    parent().
                    prev().
                    prev().
                    find('.action img')[0],
                  name
                );
                EXPANDED_SERVICES.slideUp('fast', function() {
                  animateAction(action, button, name);
                  activeServices = serviceContainer.slideToggle('fast');
                });
              } else {
                animateAction(action, button, name);
                activeServices = serviceContainer.slideToggle('fast');
              }
            }.bind(null, serviceContainer, action, button, lowercaseName));

          CATEGORY_SURFACE.append(categoryControls);
        }

        const WHITELISTING_ELEMENTS = renderWhitelisting(SITE_WHITELIST);
        const WHITELISTING = WHITELISTING_ELEMENTS.control;
        const WHITELISTING_ICON = WHITELISTING_ELEMENTS.icon;
        const WHITELISTING_TEXT = WHITELISTING_ELEMENTS.text;
        WHITELISTING.off('mouseenter').mouseenter(handleWhitelisting);

        WHITELISTING.off('click').click(function() {
          whitelistingClicked = 7;

          if (whitelistSite()) {
            WHITELISTING_ICON.alt = 'Whitelist';
            WHITELISTING_TEXT.text('Whitelist site');
          } else {
            WHITELISTING_ICON.alt = 'Blacklist';
            WHITELISTING_TEXT.text('Blacklist site');
          }
        });

        const HEIGHT = $(window).height();
        SAFARI ? safari.self.height = HEIGHT : VIEWPORT.height(HEIGHT);
      });

      $(document).off('click', 'a').on('click', 'a', function() {
        TABS.create({url: $(this).attr('href')});
        return false;
      });

      const VISUALIZATION = $('.visualization');
      VISUALIZATION.off('mouseenter').mouseenter(handleVisualization);

      VISUALIZATION.off('click').click(function() {
        options.displayMode = GRAPH;

        $('#' + LIST).fadeOut('fast', function() {
          const BUTTON =
              activeServices.
                parent().
                parent().
                prev().
                prev().
                find('.action img')[0];
          if (BUTTON) BUTTON.src = BUTTON.src.replace(7, 1);
          activeServices.hide();

          if (SAFARI) {
            safari.self.width = 706;
            safari.self.height = 490;
          }

          $('.live-data').show();
          renderGraph();
          $('#' + GRAPH).fadeIn('slow');
        });
      });

      const ICON = VISUALIZATION.find('img')[0];
      ICON.src = IMAGES + currentScene + '/1' + EXTENSION;
      ICON.alt = 'Graph';
      const WIFI = $('.wifi ' + INPUT)[0];
      const WRAPPED_WIFI = $(WIFI);

      if (SAFARI) {
        WRAPPED_WIFI.
          parent().next().addClass('disabled').attr('title', 'Coming soon');
        WRAPPED_WIFI.prop('disabled', true);
      }

      WIFI.checked = !SAFARI && DESERIALIZE(options.browsingHardened);
      WRAPPED_WIFI.off('click');

      WIFI.onclick = function() {
        this.checked =
            options.browsingHardened = !DESERIALIZE(options.browsingHardened);
      };

      const SEARCH = $('.search ' + INPUT)[0];
      SEARCH.checked = DESERIALIZE(options.searchHardened);
      $(SEARCH).off('click');

      SEARCH.onclick = function() {
        this.checked =
            options.searchHardened = !DESERIALIZE(options.searchHardened);
      };

      d3.select('#data svg').remove();
      dashboard =
          d3.
            select('#data').
            append('svg:svg').
            attr('width', 198).
            attr('height', 40);

      $('.sharing img').off('mouseenter').mouseenter(function() {
        this.src = this.src.replace(EXTENSION, HIGHLIGHTED + EXTENSION);
      }).off('mouseleave').mouseleave(function() {
        this.src = this.src.replace(HIGHLIGHTED + EXTENSION, EXTENSION);
      });

      $($('.sharing a')[0]).off('click').click(function() {
        const BLOCKED_COUNT = (DASHBOARD[tabId] || {}).blocked || 0;
        const URL =
            'https://www.facebook.com/sharer.php?s=100&p[images][0]=https://disconnect.me/images/thumbnail.png&p[title]=Make the web fast, private, %26 secure&p[url]=https://disconnect.me/&p[summary]=Disconnect 2 blocks '
                + BLOCKED_COUNT + ' tracking request' +
                    (BLOCKED_COUNT - 1 ? 's' : '') + ' on ' + domain +
                        '. How many tracking requests will Disconnect block on the sites you go to?';
        SAFARI ? safari.application.activeBrowserWindow.openTab().url = URL :
            open(URL, null, 'width=500,height=316');
        return false;
      });

      $($('.sharing a')[1]).off('click').click(function() {
        const BLOCKED_COUNT = (DASHBOARD[tabId] || {}).blocked || 0;
        const URL =
            'https://twitter.com/share?url=https://disconnect.me/&text=%23disconnect2 blocks '
                + BLOCKED_COUNT + ' tracking request' +
                    (BLOCKED_COUNT - 1 ? 's' : '') + ' on ' + domain + ':';
        SAFARI ? safari.application.activeBrowserWindow.openTab().url = URL :
            open(URL, null, 'width=500,height=257');
        return false;
      });

      $($('.sharing a')[2]).off('click').click(function() {
        const TAB_DASHBOARD = DASHBOARD[tabId] || {};
        const BLOCKED_COUNT = TAB_DASHBOARD.blocked || 0;
        const TOTAL_COUNT = TAB_DASHBOARD.total || 0;
        const URL =
            'https://www.facebook.com/sharer.php?s=100&p[images][0]=https://disconnect.me/images/thumbnail.png&p[title]=Make the web fast, private, %26 secure&p[url]=https://disconnect.me/&p[summary]=Disconnect 2 makes '
                + domain + ' ' +
                    ((BLOCKED_COUNT / TOTAL_COUNT || 0) * TIME_CONSTANT * 100).
                      toFixed() +
                        '%25 (' +
                            (BLOCKED_COUNT * TRACKING_RESOURCE_TIME / 1000).
                              toFixed(1) +
                                's) faster. How much faster will Disconnect make the sites you go to?';
        SAFARI ? safari.application.activeBrowserWindow.openTab().url = URL :
            open(URL, null, 'width=500,height=316');
        return false;
      });

      $($('.sharing a')[3]).off('click').click(function() {
        const TAB_DASHBOARD = DASHBOARD[tabId] || {};
        const BLOCKED_COUNT = TAB_DASHBOARD.blocked || 0;
        const TOTAL_COUNT = TAB_DASHBOARD.total || 0;
        const URL =
            'https://twitter.com/share?url=https://disconnect.me/&text=%23disconnect2 makes '
                + domain + ' ' +
                    ((BLOCKED_COUNT / TOTAL_COUNT || 0) * TIME_CONSTANT * 100).
                      toFixed() +
                        '%25 (' +
                            (BLOCKED_COUNT * TRACKING_RESOURCE_TIME / 1000).
                              toFixed(1) +
                                's) faster:';
        SAFARI ? safari.application.activeBrowserWindow.openTab().url = URL :
            open(URL, null, 'width=500,height=257');
        return false;
      });

      $($('.sharing a')[4]).off('click').click(function() {
        const TAB_DASHBOARD = DASHBOARD[tabId] || {};
        const BLOCKED_COUNT = TAB_DASHBOARD.blocked || 0;
        const TOTAL_COUNT = TAB_DASHBOARD.total || 0;
        const URL =
            'https://www.facebook.com/sharer.php?s=100&p[images][0]=https://disconnect.me/images/thumbnail.png&p[title]=Make the web fast, private, %26 secure&p[url]=https://disconnect.me/&p[summary]=Disconnect 2 makes '
                + domain + ' use ' +
                    ((BLOCKED_COUNT / TOTAL_COUNT || 0) * SIZE_CONSTANT * 100).
                      toFixed() +
                        '%25 (' + (BLOCKED_COUNT * TRACKING_RESOURCE_SIZE).
                          toFixed() +
                            'K) less bandwidth. How much less bandwidth will Disconnect make the sites you go to use?';
        SAFARI ? safari.application.activeBrowserWindow.openTab().url = URL :
            open(URL, null, 'width=500,height=316');
        return false;
      });

      $($('.sharing a')[5]).off('click').click(function() {
        const TAB_DASHBOARD = DASHBOARD[tabId] || {};
        const BLOCKED_COUNT = TAB_DASHBOARD.blocked || 0;
        const TOTAL_COUNT = TAB_DASHBOARD.total || 0;
        const URL =
            'https://twitter.com/share?url=https://disconnect.me/&text=%23disconnect2 makes '
                + domain + ' use ' +
                    ((BLOCKED_COUNT / TOTAL_COUNT || 0) * SIZE_CONSTANT * 100).
                      toFixed() +
                        '%25 (' +
                            (BLOCKED_COUNT * TRACKING_RESOURCE_SIZE).toFixed() +
                                'K) less bandwidth:';
        SAFARI ? safari.application.activeBrowserWindow.openTab().url = URL :
            open(URL, null, 'width=500,height=257');
        return false;
      });

      $($('.sharing a')[6]).off('click').click(function() {
        const SECURED_COUNT = (DASHBOARD[tabId] || {}).secured || 0;
        const URL =
            'https://www.facebook.com/sharer.php?s=100&p[images][0]=https://disconnect.me/images/thumbnail.png&p[title]=Make the web fast, private, %26 secure&p[url]=https://disconnect.me/&p[summary]=Disconnect 2 secures '
                + SECURED_COUNT + ' vulnerable request' +
                    (SECURED_COUNT - 1 ? 's' : '') + ' on ' + domain +
                        '. How many vulnerable requests will Disconnect secure on the sites you go to?';
        SAFARI ? safari.application.activeBrowserWindow.openTab().url = URL :
            open(URL, null, 'width=500,height=316');
        return false;
      });

      $($('.sharing a')[7]).off('click').click(function() {
        const SECURED_COUNT = (DASHBOARD[tabId] || {}).secured || 0;
        const URL =
            'https://twitter.com/share?url=https://disconnect.me/&text=%23disconnect2 secures '
                + SECURED_COUNT + ' vulnerable request' +
                    (SECURED_COUNT - 1 ? 's' : '') + ' on ' + domain + ':';
        SAFARI ? safari.application.activeBrowserWindow.openTab().url = URL :
            open(URL, null, 'width=500,height=257');
        return false;
      });

      if (displayMode == GRAPH) {
        $('.live-data').show();
        renderGraph();
      }

      $('#' + displayMode).fadeIn('slow', function() {
        if (displayMode == LIST) {
          $('#' + GRAPH).hide();
          renderGraphs();
        }
      });
    }
  }, true
);
