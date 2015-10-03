/*
  The script for an embedded Disconnect UX.

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

            callback && wrappedControl.click(callback);
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

            callback && wrappedControl.click(callback);
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
  const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
  const LOCAL_SITE_WHITELIST =
      WHITELIST[domain] || (WHITELIST[domain] = {});
  const DISCONNECT_WHITELIST =
      LOCAL_SITE_WHITELIST.Disconnect ||
          (LOCAL_SITE_WHITELIST.Disconnect =
              {whitelisted: false, services: {}});
  const LOCAL_SHORTCUT_WHITELIST =
      DISCONNECT_WHITELIST.services ||
          (DISCONNECT_WHITELIST.services = {});
  renderShortcut(
    name,
    lowercaseName,
    !(LOCAL_SHORTCUT_WHITELIST[name] = !LOCAL_SHORTCUT_WHITELIST[name]),
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
  localStorage.whitelist = JSON.stringify(WHITELIST);
  renderWhitelisting(LOCAL_SITE_WHITELIST);
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
                $('.whitelisting').filter('.text').text() == 'Blacklist site'
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

            callback && WRAPPED_BADGE.click(callback);
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

            callback && WRAPPED_BADGE.click(callback);
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
  const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
  const LOCAL_SITE_WHITELIST =
      WHITELIST[domain] || (WHITELIST[domain] = {});
  const CONTENT = name == CONTENT_NAME;
  const CATEGORY_WHITELIST =
      LOCAL_SITE_WHITELIST[name] ||
          (LOCAL_SITE_WHITELIST[name] = {whitelisted: CONTENT, services: {}});
  const SERVICE_WHITELIST = CATEGORY_WHITELIST.services;
  var whitelisted = CATEGORY_WHITELIST.whitelisted;
  whitelisted =
      CATEGORY_WHITELIST.whitelisted =
          !(whitelisted || CONTENT && whitelisted !== false);
  const BLACKLIST = DESERIALIZE(localStorage.blacklist) || {};
  const LOCAL_SITE_BLACKLIST =
      BLACKLIST[domain] || (BLACKLIST[domain] = {});
  const CATEGORY_BLACKLIST =
      LOCAL_SITE_BLACKLIST[name] || (LOCAL_SITE_BLACKLIST[name] = {});
  for (var serviceName in SERVICE_WHITELIST)
      SERVICE_WHITELIST[serviceName] = whitelisted;
  for (var serviceName in CATEGORY_BLACKLIST)
      CATEGORY_BLACKLIST[serviceName] = !whitelisted;
  localStorage.whitelist = JSON.stringify(WHITELIST);
  localStorage.blacklist = JSON.stringify(BLACKLIST);
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

  renderWhitelisting(LOCAL_SITE_WHITELIST);
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
          const CATEGORY_WHITELIST =
              ((DESERIALIZE(localStorage.whitelist) || {})[DOMAIN] ||
                  {})[categoryName] || {};
          const WHITELISTED = CATEGORY_WHITELIST.whitelisted;
          CHECKBOX.checked = !(
            WHITELISTED || categoryName == CONTENT_NAME && WHITELISTED !== false
          ) && !(CATEGORY_WHITELIST.services || {})[serviceName] ||
              (((DESERIALIZE(localStorage.blacklist) || {})[DOMAIN] ||
                  {})[categoryName] || {})[serviceName];

          CHECKBOX.onclick = function(categoryName, serviceName) {
            const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
            const SITE_WHITELIST =
                WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
            const CONTENT = categoryName == CONTENT_NAME;
            const LOCAL_CATEGORY_WHITELIST =
                SITE_WHITELIST[categoryName] ||
                    (SITE_WHITELIST[categoryName] = {
                      whitelisted: CONTENT, services: {}
                    });
            const SERVICE_WHITELIST = LOCAL_CATEGORY_WHITELIST.services;
            const WHITELISTED = SERVICE_WHITELIST[serviceName];
            const BLACKLIST = DESERIALIZE(localStorage.blacklist) || {};
            const SITE_BLACKLIST =
                BLACKLIST[DOMAIN] || (BLACKLIST[DOMAIN] = {});
            const CATEGORY_BLACKLIST =
                SITE_BLACKLIST[categoryName] ||
                    (SITE_BLACKLIST[categoryName] = {});
            this.checked =
                SERVICE_WHITELIST[serviceName] =
                    !(CATEGORY_BLACKLIST[serviceName] =
                        WHITELISTED ||
                            CONTENT && LOCAL_CATEGORY_WHITELIST.whitelisted &&
                                WHITELISTED !== false);
            localStorage.whitelist = JSON.stringify(WHITELIST);
            localStorage.blacklist = JSON.stringify(BLACKLIST);
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

/* Resets third-party details. */
function clearServices(id) {
  if (id == 0) {
    whitelist = deserialize(localStorage.whitelist) || {};
    siteWhitelist = whitelist[domain] || (whitelist[domain] = {});
    const TAB_REQUESTS = REQUEST_COUNTS[tabId] || {};
    const DISCONNECT_REQUESTS = TAB_REQUESTS.Disconnect || {};

    for (var i = 0; i < SHORTCUT_COUNT; i++) {
      var name = SHORTCUTS[i];
      var shortcutRequests = DISCONNECT_REQUESTS[name];
      var requestCount = shortcutRequests ? shortcutRequests.count : 0;
      var control = $('.shortcut')[i + 1];
      renderShortcut(
        name,
        name.toLowerCase(),
        !((siteWhitelist.Disconnect || {}).services || {})[name],
        requestCount,
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
      var whitelisted = (siteWhitelist[name] || {}).whitelisted;
      whitelisted =
          whitelisted || name == CONTENT_NAME && whitelisted !== false;
      var categoryRequests = TAB_REQUESTS[name];
      var requestCount = 0;
      for (var serviceName in categoryRequests)
          requestCount += categoryRequests[serviceName].count;
      var countingIndex = i + 1;
      var control = $('.category')[countingIndex];
      var wrappedControl = $(control);
      var wrappedBadge = wrappedControl.find('.badge');
      var wrappedText = wrappedControl.find('.text');
      renderCategory(
        name,
        name.toLowerCase(),
        !whitelisted,
        requestCount,
        control,
        wrappedControl,
        wrappedBadge[0],
        wrappedBadge.find('img')[0],
        wrappedText[0],
        wrappedText.find('.name'),
        wrappedText.find('.count'),
        0
      );

      $($('.services')[countingIndex]).find(INPUT).each(function(index) {
        if (index) this.checked = !whitelisted;
      });
    }

    const WRAPPED_BUTTON = $('.category .action img[src*=7]');
    const BUTTON = WRAPPED_BUTTON[0];

    if (BUTTON) {
      const ACTION = WRAPPED_BUTTON.parent();
      animateAction(
        ACTION[0],
        BUTTON,
        ACTION.prev().find('.name').text().toLowerCase()
      );
      $('.services').find('div:visible').slideUp('fast');
    }
  }
}

/* Plays an expanding or collapsing animation. */
function animateAction(action, button, name) {
  const COLLAPSED = button.src.indexOf(1) + 1;

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
    const SPEED_HEIGHT =
        Math.round(HEIGHT * (weighted ? 1 : TIME_CONSTANT));
    const BANDWIDTH_HEIGHT =
        Math.round(HEIGHT * (weighted ? 1 : SIZE_CONSTANT));
    console.log(dashboard);
    dashboard.
      insert('svg:rect', '.control.speed').
      attr('class', 'subtotal speed').
      attr('x', 29).
      attr('y', 38 - SPEED_HEIGHT).
      attr('width', 8).
      attr('height', SPEED_HEIGHT).
      attr('fill', '#ff7f00');
    d3.select('.subtotal.bandwidth').remove();
    console.log(dashboard);
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
  dashboard.
    append('svg:rect').
    attr('class', 'control speed').
    attr('x', 10).
    attr('y', 0).
    attr('width', 46).
    attr('height', 40).
    attr('fill', 'transparent');

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

  dashboard.
    append('svg:rect').
    attr('class', 'control bandwidth').
    attr('x', 76).
    attr('y', 0).
    attr('width', 46).
    attr('height', 40).
    attr('fill', 'transparent');

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

  dashboard.
    append('svg:rect').
    attr('class', 'control security').
    attr('x', 142).
    attr('y', 0).
    attr('width', 46).
    attr('height', 40).
    attr('fill', 'transparent');

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

/* The object deserializer. */
const DESERIALIZE = deserialize;

/* The major third parties. */
const SHORTCUTS = ['Facebook', 'Google', 'Twitter'];

/* The number of major third parties. */
const SHORTCUT_COUNT = SHORTCUTS.length;

/* The other types of third parties. */
const CATEGORIES = ['Advertising', 'Analytics', 'Social', 'Content'];

/* The number of other types of third parties. */
const CATEGORY_COUNT = CATEGORIES.length;

/* The content key. */
const CONTENT_NAME = 'Content';

/* The list keyword. */
const LIST = 'list';

/* The graph keyword. */
const GRAPH = 'graph';

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

/* The number of tracking requests per tab, overall and by third party. */
const REQUEST_COUNTS = {
  0: {
    Content: {
      Microsoft: {url: 'http://www.microsoft.com/', count: 3},
      'Limelight Networks': {url: 'http://www.limelight.com/', count: 1}
    },
    Analytics: {
      Compuware: {url: 'http://www.compuware.com/', count: 1},
      Chartbeat: {url: 'http://chartbeat.com/', count: 1},
      comScore: {url: 'http://www.comscore.com/', count: 3},
      Safecount: {url: 'http://www.safecount.net/', count: 1}
    },
    Advertising: {
      Peer39: {url: 'http://www.peer39.com/', count: 1},
      Nielsen: {url: 'http://www.nielsen.com/', count: 2},
      Criteo: {url: 'http://www.criteo.com/', count: 12},
      Krux: {url: 'http://www.krux.com/', count: 1},
      BlueKai: {url: 'http://www.bluekai.com/', count: 1},
      Outbrain: {url: 'http://www.outbrain.com/', count: 1},
      InsightExpress: {url: 'http://www.insightexpress.com/', count: 1}
    },
    Disconnect: {
      Facebook: {url: 'http://www.facebook.com/', count: 2},
      Google: {url: 'http://www.google.com/', count: 11},
      Twitter: {url: 'https://twitter.com/', count: 1}
    }
  }
};

/* The number of request updates. */
const LIVE_REQUESTS = {};

/* The number of total, blocked, and secured requests per tab. */
const DASHBOARD = {0: {total: 145, blocked: 39, secured: 0}};

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

/* The images to preload ASAP. */
const FRONT_IMAGES = [
  '1/1',
  '2/1',
  '3/1',
  '4/1',
  '5/1',
  'advertising/1',
  'advertising/1-deactivated',
  'analytics/1',
  'analytics/1-deactivated',
  'check',
  'content/1',
  'content/1-deactivated',
  'dashboard',
  'disconnect',
  'expand/1',
  'expand/7',
  'facebook/1',
  'facebook/1-deactivated',
  'google/1',
  'google/1-deactivated',
  'list/1',
  'social/1',
  'social/1-deactivated',
  'twitter/1',
  'twitter/1-deactivated'
];

/* The images to lazy preload. */
const BACK_IMAGES = [
  '1/2',
  '1/3',
  '1/4',
  '1/5',
  '1/6',
  '1/7',
  '2/2',
  '2/3',
  '2/4',
  '2/5',
  '2/6',
  '2/7',
  '3/2',
  '3/3',
  '3/4',
  '3/5',
  '3/6',
  '3/7',
  '4/2',
  '4/3',
  '4/4',
  '4/5',
  '4/6',
  '4/7',
  '5/2',
  '5/3',
  '5/4',
  '5/5',
  '5/6',
  '5/7',
  'advertising/1-highlighted',
  'advertising/1-deactivated-highlighted',
  'advertising/2',
  'advertising/2-deactivated',
  'advertising/3',
  'advertising/3-deactivated',
  'advertising/4',
  'advertising/4-deactivated',
  'advertising/5',
  'advertising/5-deactivated',
  'advertising/6',
  'advertising/6-deactivated',
  'advertising/7',
  'advertising/7-deactivated',
  'advertising/8',
  'advertising/8-deactivated',
  'advertising/9',
  'advertising/9-deactivated',
  'advertising/10',
  'advertising/10-deactivated',
  'advertising/11',
  'advertising/11-deactivated',
  'advertising/12',
  'advertising/12-deactivated',
  'advertising/13',
  'advertising/13-deactivated',
  'advertising/14',
  'advertising/14-deactivated',
  'analytics/1-highlighted',
  'analytics/1-deactivated-highlighted',
  'analytics/2',
  'analytics/2-deactivated',
  'analytics/3',
  'analytics/3-deactivated',
  'analytics/4',
  'analytics/4-deactivated',
  'analytics/5',
  'analytics/5-deactivated',
  'analytics/6',
  'analytics/6-deactivated',
  'analytics/7',
  'analytics/7-deactivated',
  'analytics/8',
  'analytics/8-deactivated',
  'analytics/9',
  'analytics/9-deactivated',
  'analytics/10',
  'analytics/10-deactivated',
  'analytics/11',
  'analytics/11-deactivated',
  'analytics/12',
  'analytics/12-deactivated',
  'analytics/13',
  'analytics/13-deactivated',
  'analytics/14',
  'analytics/14-deactivated',
  'check',
  'chrollusion/chrome',
  'chrollusion/close-hover',
  'chrollusion/close',
  'chrollusion/favicon',
  'chrollusion/safari',
  'chrollusion/share',
  'content/1-highlighted',
  'content/1-deactivated-highlighted',
  'content/2',
  'content/2-deactivated',
  'content/3',
  'content/3-deactivated',
  'content/4',
  'content/4-deactivated',
  'content/5',
  'content/5-deactivated',
  'content/6',
  'content/6-deactivated',
  'content/7',
  'content/7-deactivated',
  'content/8',
  'content/8-deactivated',
  'content/9',
  'content/9-deactivated',
  'content/10',
  'content/10-deactivated',
  'content/11',
  'content/11-deactivated',
  'content/12',
  'content/12-deactivated',
  'content/13',
  'content/13-deactivated',
  'content/14',
  'content/14-deactivated',
  'disconnect-highlighted',
  'expand/1-highlighted',
  'expand/2-highlighted',
  'expand/2',
  'expand/3-highlighted',
  'expand/3',
  'expand/4-highlighted',
  'expand/4',
  'expand/5-highlighted',
  'expand/5',
  'expand/6-highlighted',
  'expand/6',
  'expand/7-highlighted',
  'expand/8-highlighted',
  'expand/8',
  'expand/9-highlighted',
  'expand/9',
  'expand/10-highlighted',
  'expand/10',
  'expand/11-highlighted',
  'expand/11',
  'facebook-highlighted',
  'facebook',
  'list/2',
  'list/3',
  'list/4',
  'list/5',
  'list/6',
  'list/7',
  'list/8',
  'list/9',
  'list/10',
  'list/11',
  'list/12',
  'list/13',
  'list/14',
  'list/15',
  'list/16',
  'list/17',
  'social/1-highlighted',
  'social/1-deactivated-highlighted',
  'social/2',
  'social/2-deactivated',
  'social/3',
  'social/3-deactivated',
  'social/4',
  'social/4-deactivated',
  'social/5',
  'social/5-deactivated',
  'social/6',
  'social/6-deactivated',
  'social/7',
  'social/7-deactivated',
  'social/8',
  'social/8-deactivated',
  'social/9',
  'social/9-deactivated',
  'social/10',
  'social/10-deactivated',
  'social/11',
  'social/11-deactivated',
  'social/12',
  'social/12-deactivated',
  'social/13',
  'social/13-deactivated',
  'social/14',
  'social/14-deactivated',
  'twitter-highlighted',
  'twitter'
];

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

if (localStorage.browsingHardened == null) localStorage.browsingHardened = true;
localStorage.displayMode = 'list';

$.each(FRONT_IMAGES, function(index, value) {
  new Image().src = IMAGES + value + EXTENSION;
});

/* Paints the UI. */
(SAFARI ? safari.application : window).addEventListener(
  SAFARI ? 'popover' : 'load', function() {
    if (SAFARI) $('body').addClass('safari');

    $.each(BACK_IMAGES, function(index, value) {
      new Image().src = IMAGES + value + EXTENSION;
    });

    $('#navbar img').mouseenter(function() {
      this.src = this.src.replace(EXTENSION, HIGHLIGHTED + EXTENSION);
    }).mouseleave(function() {
      this.src = this.src.replace(HIGHLIGHTED + EXTENSION, EXTENSION);
    });

    Tipped.create('#navbar span', $('.sharing.disconnect')[0], {
      skin: 'tiny',
      shadow: {color: '#fff', opacity: .1},
      stem: {spacing: -1},
      background: {color: '#333', opacity: .9},
      onShow: function() {
        const BLOCKED_COUNT = (DASHBOARD[tabId] || {}).blocked || 0;
        $('.sharing.disconnect .text').text(
          BLOCKED_COUNT + ' blocked' + REQUEST + (BLOCKED_COUNT - 1 ? 's' : '')
        );
      },
      fadeIn: 400,
      fadeOut: 400
    });

    const DOMAIN = domain;
    const ID = tabId;
    const TAB_REQUESTS = REQUEST_COUNTS[ID] || {};
    const DISCONNECT_REQUESTS = TAB_REQUESTS.Disconnect || {};
    const SHORTCUT_SURFACE =
        document.getElementById('shortcuts').getElementsByTagName('td')[0];
    const SHORTCUT_TEMPLATE =
        SHORTCUT_SURFACE.getElementsByClassName('shortcut')[0];
    const SITE_WHITELIST =
        (DESERIALIZE(localStorage.whitelist) || {})[DOMAIN] || {};
    const SHORTCUT_WHITELIST =
        (SITE_WHITELIST.Disconnect || {}).services || {};

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
        !SHORTCUT_WHITELIST[name],
        requestCount,
        control,
        wrappedControl,
        badge,
        text,
        1
      );
      badge.alt = name;

      wrappedControl.click(function(
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
    const CATEGORY_TEMPLATE = CATEGORY_SURFACE.children();
    const SITE_BLACKLIST =
        (DESERIALIZE(localStorage.blacklist) || {})[DOMAIN] || {};
    serviceTemplate = CATEGORY_TEMPLATE.find('.service');
    var activeServices = $();

    for (i = 0; i < CATEGORY_COUNT; i++) {
      var name = CATEGORIES[i];
      var lowercaseName = name.toLowerCase();
      var categoryRequests = TAB_REQUESTS[name];
      var requestCount = 0;
      var categoryControls = CATEGORY_TEMPLATE.clone(true);
      var wrappedCategoryControl = categoryControls.filter('.category');
      var categoryControl = wrappedCategoryControl[0];
      var serviceContainer = categoryControls.filter('.services').find('div');
      var serviceSurface = serviceContainer.find('tbody');
      var wrappedBadge = wrappedCategoryControl.find('.badge');
      var badge = wrappedBadge[0];
      var badgeIcon = wrappedBadge.find('img')[0];
      var wrappedText = wrappedCategoryControl.find('.text');
      var text = wrappedText[0];
      var textName = wrappedText.find('.name');
      var textCount = wrappedText.find('.count');
      var categoryWhitelist = SITE_WHITELIST[name] || {};
      var whitelisted = categoryWhitelist.whitelisted;
      whitelisted =
          whitelisted || name == CONTENT_NAME && whitelisted !== false;
      var categoryBlacklist = SITE_BLACKLIST[name] || {};

      for (var serviceName in categoryRequests) {
        var serviceControl = serviceTemplate.clone(true);
        var checkbox = serviceControl.find(INPUT)[0];
        checkbox.checked =
            !whitelisted && !(categoryWhitelist.services || {})[serviceName]
                || categoryBlacklist[serviceName];

        checkbox.onclick = function(name, serviceName) {
          const WHITELIST = DESERIALIZE(localStorage.whitelist) || {};
          const LOCAL_SITE_WHITELIST =
              WHITELIST[DOMAIN] || (WHITELIST[DOMAIN] = {});
          const CONTENT = name == CONTENT_NAME;
          const CATEGORY_WHITELIST =
              LOCAL_SITE_WHITELIST[name] ||
                  (LOCAL_SITE_WHITELIST[name] =
                      {whitelisted: CONTENT, services: {}});
          const SERVICE_WHITELIST = CATEGORY_WHITELIST.services;
          const WHITELISTED = SERVICE_WHITELIST[serviceName];
          const BLACKLIST = DESERIALIZE(localStorage.blacklist) || {};
          const LOCAL_SITE_BLACKLIST =
              BLACKLIST[DOMAIN] || (BLACKLIST[DOMAIN] = {});
          const CATEGORY_BLACKLIST =
              LOCAL_SITE_BLACKLIST[name] || (LOCAL_SITE_BLACKLIST[name] = {});
          this.checked =
              SERVICE_WHITELIST[serviceName] =
                  !(CATEGORY_BLACKLIST[serviceName] =
                      WHITELISTED ||
                          CONTENT && CATEGORY_WHITELIST.whitelisted &&
                              WHITELISTED !== false);
          localStorage.whitelist = JSON.stringify(WHITELIST);
          localStorage.blacklist = JSON.stringify(BLACKLIST);
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

      wrappedBadge.click(function(
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

      wrappedText.add(wrappedAction).mouseenter(function(button) {
        button.src = button.src.replace(EXTENSION, HIGHLIGHTED + EXTENSION);
      }.bind(null, button)).mouseleave(function(button) {
        button.src = button.src.replace(HIGHLIGHTED + EXTENSION, EXTENSION);
      }.bind(null, button)).click(function(
        serviceContainer, action, button, name
      ) {
        const EXPANDED_SERVICES = activeServices.filter(':visible');
        if (EXPANDED_SERVICES.length && serviceContainer != activeServices) {
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
    WHITELISTING.mouseenter(handleWhitelisting);

    WHITELISTING.click(function() {
      whitelistingClicked = 7;

      if (whitelistSite()) {
        WHITELISTING_ICON.alt = 'Whitelist';
        WHITELISTING_TEXT.text('Whitelist site');
      } else {
        WHITELISTING_ICON.alt = 'Blacklist';
        WHITELISTING_TEXT.text('Blacklist site');
      }
    });

    $(document).on('click', 'a', function() {
      window.open($(this).attr('href'));
      return false;
    });

    const VISUALIZATION = $('.visualization');
    VISUALIZATION.mouseenter(handleVisualization);

    VISUALIZATION.click(function() {
      localStorage.displayMode = GRAPH;

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
        $('.live-data').show();
        renderGraph();
        $('#' + GRAPH).fadeIn('slow');
      });
    });

    const ICON = VISUALIZATION.find('img')[0];
    ICON.src = IMAGES + currentScene + '/1' + EXTENSION;
    ICON.alt = 'Graph';
    const WIFI = $('.wifi ' + INPUT)[0];
    WIFI.checked = DESERIALIZE(localStorage.browsingHardened);

    WIFI.onclick = function() {
      this.checked =
          localStorage.browsingHardened =
              !DESERIALIZE(localStorage.browsingHardened);
    };

    const SEARCH = $('.search ' + INPUT)[0];
    SEARCH.checked = DESERIALIZE(localStorage.searchHardened);

    SEARCH.onclick = function() {
      this.checked =
          localStorage.searchHardened =
              !DESERIALIZE(localStorage.searchHardened);
    };

    dashboard =
        d3.
          select('#data').
          append('svg:svg').
          attr('width', 198).
          attr('height', 40);

    $('.sharing img').mouseenter(function() {
      this.src = this.src.replace(EXTENSION, HIGHLIGHTED + EXTENSION);
    }).mouseleave(function() {
      this.src = this.src.replace(HIGHLIGHTED + EXTENSION, EXTENSION);
    });

    const DISPLAY_MODE = localStorage.displayMode || LIST;
    DISPLAY_MODE == GRAPH && renderGraph();

    $('#' + DISPLAY_MODE).fadeIn('slow', function() {
      DISPLAY_MODE == LIST && renderGraphs();
    });
  }, true
);
