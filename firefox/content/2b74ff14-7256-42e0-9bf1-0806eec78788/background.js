(function() {
	var uuid = '2b74ff14-7256-42e0-9bf1-0806eec78788';
	
	window.webmynd[uuid].onStart.push(function(api, $) {
		/*
		  The number of tracking requests and blocking state per tab, overall and by
		  service.
		*/
		const REQUEST_COUNTS = {};
		
		api.getPref('localStorage', function(localStorage) {
			
			if (!localStorage) {
				localStorage = {};
				api.setPref('localStorage', localStorage);
			}
		
			/* Populates an array of a given length with a default value. */
			function initializeArray(length, defaultValue) {
			  const ARRAY = [];
			  for (var i = 0; i < length; i++) ARRAY[i] = defaultValue;
			  return ARRAY;
			}

			/* Destringifies an object. */
			function deserialize(object) {
			  return typeof object == 'string' ? JSON.parse(object) : object;
			}
		
			/*
			  The script for a background page that handles request blocking and the
			  visualization thereof.

			  Copyright 2010, 2011 Brian Kennish

			  Licensed under the Apache License, Version 2.0 (the "License"); you may not
			  use this file except in compliance with the License. You may obtain a copy of
			  the License at

			    http://www.apache.org/licenses/LICENSE-2.0

			  Unless required by applicable law or agreed to in writing, software
			  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
			  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
			  License for the specific language governing permissions and limitations under
			  the License.

			  Brian Kennish <byoogle@gmail.com>
			*/

			/* Tallies and indicates the number of tracking requests. */ 
			function incrementCounter(tabId, serviceIndex, cookie) {
			  const TAB_REQUEST_COUNTS = REQUEST_COUNTS[tabId];
			  const TAB_REQUEST_COUNT = ++TAB_REQUEST_COUNTS[0];
			  const TAB_BLACKLIST = BLACKLIST[tabId];
			  const UNBLOCKED = !TAB_BLACKLIST[serviceIndex][3];
			  const INDICATED = deserialize(localStorage.requestsIndicated);

			  if (
			    (!cookie ? UNBLOCKED : !TAB_BLACKLIST[SERVICE_COUNT] || UNBLOCKED) &&
			        TAB_REQUEST_COUNTS[3][serviceIndex]
			  ) {
			    if (TAB_REQUEST_COUNTS[1] && INDICATED) {
			      delete TAB_REQUEST_COUNTS[1];
			      //BROWSER_ACTION.setBadgeBackgroundColor(
			        //{color: [218, 0, 24, 255], tabId: tabId}
			      //);
			    }

			    delete TAB_REQUEST_COUNTS[3][serviceIndex];
			  }

			  TAB_REQUEST_COUNTS[2][serviceIndex]++;
			  if (TAB_REQUEST_COUNT == 1)
					api.getURL(uuid+'/blocked.png', function(url) {
						api.button.setIcon(url);
					});
			      //BROWSER_ACTION.setIcon({path: 'blocked.png', tabId: tabId});
			  //if (INDICATED)
			      //BROWSER_ACTION.setBadgeText({text: TAB_REQUEST_COUNT + '', tabId: tabId});
				api.getPref('disconnect_data', function(response) {
					response.REQUEST_COUNTS[0] = TAB_REQUEST_COUNTS;
					api.setPref('disconnect_data', response);
				});
			}

			/* The timestamping method. */
			const TIMESTAMP = Date.now;

			/* The build number of the current install. */
			const CURRENT_BUILD = 16;

			/* The build number of the previous install. */
			const PREVIOUS_BUILD = deserialize(localStorage.build);

			/*
			  The third parties and search engines, titlecased, and domain, subdomain, and
			  path names they phone home with and secure URL of their query page,
			  lowercased.
			*/
			const SERVICES = [
			  ['Digg', ['digg.com']],
			  ['Facebook', ['facebook.com', 'facebook.net', 'fbcdn.net']],
			  ['Google', [
			    'google.com',
			    '2mdn.net',
			    'doubleclick.net',
			    'feedburner.com',
			    'gmodules.com',
			    'google-analytics.com',
			    'googleadservices.com',
			    'googlesyndication.com'
			  ], [
			    'adwords',
			    'checkout',
			    'chrome',
			    'code',
			    'docs',
			    'feedburner',
			    'groups',
			    'health',
			    'knol',
			    'mail',
			    'picasaweb',
			    'sites',
			    'sketchup',
			    'wave'
			  ], [
			    'accounts',
			    'analytics',
			    'bookmarks',
			    'calendar',
			    'finance',
			    'ig',
			    'latitude',
			    'reader',
			    'voice',
			    'webmasters',
			    'adsense',
			    'alerts',
			    'cse',
			    'dfp',
			    'friendconnect',
			    'local',
			    'merchants',
			    'notebook',
			    'support'
			  ], 'https://www.google.com/'],
			  ['Twitter', ['twitter.com', 'twimg.com']],
			  ['Yahoo', ['yahoo.com'], [
			    'address',
			    'answers',
			    'apps',
			    'buzz',
			    'calendar',
			    'edit',
			    'finance',
			    'games',
			    'groups',
			    'hotjobs',
			    'local',
			    'mail',
			    'my',
			    'notepad',
			    'pulse',
			    'shine',
			    'sports',
			    'upcoming',
			    'webmessenger',
			    'www',
			    'alerts',
			    'autos',
			    'avatars',
			    'help',
			    'login', // "login" is required for OpenID access but conflicts with "edit".
			    'messages',
			    'pipes',
			    'realestate',
			    'smallbusiness',
			    'travel',
			    'widgets'
			  ], [], 'https://search.yahoo.com/']
			];

			/* The number of third parties and search engines. */
			const SERVICE_COUNT = SERVICES.length;

			/* The suffix of the blocking key. */
			const BLOCKED_NAME = 'Blocked';

			/*
			  The blocked names and domains and search and blocking state, by service, and
			  depersonalization state per tab.
			*/
			const BLACKLIST = {};

			/* The "tabs" API. */
			//const TABS = chrome.tabs;

			/* The "browserAction" API. */
			//const BROWSER_ACTION = chrome.browserAction;

			/* The start time of this script. */
			const START_TIME = TIMESTAMP();

			/* A throwaway index. */
			var i;

			if (!deserialize(localStorage.initialized)) {
			  for (i = 0; i < SERVICE_COUNT; i++)
			      localStorage[SERVICES[i][0].toLowerCase() + BLOCKED_NAME] = true;
			  localStorage.requestsIndicated = true;
			  localStorage.initialized = true;
				api.setPref('localStorage', localStorage);
			}

			if (deserialize(localStorage.blockingIndicated)) {
			  delete localStorage.blockingIndicated;
			  localStorage.requestsIndicated = true;
				api.setPref('localStorage', localStorage);
			}

			if (!PREVIOUS_BUILD || PREVIOUS_BUILD < CURRENT_BUILD) {
			  localStorage.boxDecoration = 0;
			  localStorage.build = CURRENT_BUILD;
				api.setPref('localStorage', localStorage);
			}

			for (i = 0; i < SERVICE_COUNT; i++) {
			  var service = SERVICES[i];
			  var url = service[4];

			  if (
			    url && deserialize(localStorage[service[0].toLowerCase() + BLOCKED_NAME])
			  ) {

			  }
			}

			//BROWSER_ACTION.setBadgeBackgroundColor({color: [60, 92, 153, 255]});

			/* Resets the block list and number of tracking requests for a tab. */
			/*TABS.onUpdated.addListener(function(tabId, changeInfo) {
			  if (changeInfo.status == 'loading') {
			    delete BLACKLIST[tabId];
			    delete REQUEST_COUNTS[tabId];
			  }
			});*/

			/*
			  Builds a block list and request counter or adds to the number of tracking
			  requests.
			*/
			api.listen('disconnect-broadcast', function(request, sendResponse) {
			  //const TAB_ID = sender.tab.id;
			  const TAB_ID = 0;
			  var blacklist = BLACKLIST[TAB_ID];

			  if (request.initialized) {
			    if (!blacklist) {
			      blacklist = BLACKLIST[TAB_ID] = [];

			      for (var i = 0; i < SERVICE_COUNT; i++) {
			        var service = SERVICES[i];
			        blacklist[i] = [
			          service[0],
			          service[1],
			          !!service[2],
			          deserialize(localStorage[service[0].toLowerCase() + BLOCKED_NAME])
			        ];
			      }

			      blacklist.push(
			        deserialize(localStorage.searchDepersonalized),
			        deserialize(localStorage.boxDecoration)
			      );
			      REQUEST_COUNTS[TAB_ID] = [
			        0,
			        true,
			        initializeArray(SERVICE_COUNT, 0),
			        initializeArray(SERVICE_COUNT, true)
			      ];
					api.getPref('disconnect_data', function(response) {
						response.REQUEST_COUNTS = REQUEST_COUNTS;
						api.setPref('disconnect_data', response);
					});
			    }

			    sendResponse({blacklist: blacklist});
			  } else {
			    const SERVICE_INDEX = request.serviceIndex;

			    if (!request.unblocked) incrementCounter(TAB_ID, SERVICE_INDEX);
			    else {
			      delete
			          localStorage[SERVICES[SERVICE_INDEX][0].toLowerCase() + BLOCKED_NAME];
			      delete blacklist[SERVICE_INDEX][3];
					api.setPref('localStorage', localStorage);
			    }

			    sendResponse({});
				}
			});
		
			api.listen('disconnect-reset', function() {
				delete BLACKLIST[0];
				delete REQUEST_COUNTS[0];
				api.getPref('disconnect_data', function(response) {
					delete response.REQUEST_COUNTS[0];
					api.setPref('disconnect_data', response);
				});
				api.getURL(uuid+'/activated.png', function(url) {
					api.button.setIcon(url);
				});
			});
		
			api.listen('disconnect-toggle-blocked', function(request) {
				api.getPref('localStorage', function(response) {
					localStorage[request.blockedName] = !deserialize(localStorage[request.blockedName]);
					api.setPref('localStorage', localStorage);
				});
			});
		});
	});
})();