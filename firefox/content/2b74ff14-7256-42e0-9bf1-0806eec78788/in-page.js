(function() {
	var uuid = '2b74ff14-7256-42e0-9bf1-0806eec78788';
	
	window.webmynd = window.webmynd || {};
	window.webmynd[uuid] = window.webmynd[uuid] || {};
	window.webmynd[uuid].onLoad = window.webmynd[uuid].onLoad || [];

	window.webmynd[uuid].onLoad.push(function(api, $) {
		/*
		  The script for a popup that displays and drives the blocking of requests.

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
	
		/* Outputs third-party or search details according to the blocking state. */
		function renderService(
		  name, lowercaseName, blocked, requestCount, control, badge, text
		) {
		  if (blocked) {
			api.getURL(uuid + '/' + lowercaseName + (requestCount ? '-blocked.png' : '-activated.png'), function(url) {
			    control.title = 'Unblock ' + name;
			    badge.src = url;
			    text.removeAttribute('class');
			});
		  } else {
			api.getURL(uuid + '/' + lowercaseName + '-deactivated.png', function(url) {
			    control.title = 'Block ' + name;
			    badge.src = url;
			    text.className = 'deactivated';
			});
		  }
		}

		/* Paints the UI. */
		init = function() {
			api.getPref('disconnect_data', function(BACKGROUND) {
				api.getPref('localStorage', function(localStorage) {
					if (!localStorage) {
						localStorage = {};
					}
					/* The background window. */
					//const BACKGROUND = chrome.extension.getBackgroundPage();

					/* The initialization function for arrays. */
					const INITIALIZE_ARRAY = initializeArray;

					/* The deserialization function. */
					const DESERIALIZE = deserialize;

					/* The third parties and search engines. */
					const SERVICES = BACKGROUND.SERVICES;

					/* The number of third parties and search engines. */
					//const SERVICE_COUNT = BACKGROUND.SERVICE_COUNT;
					const SERVICE_COUNT = SERVICES.length;

					/* The suffix of the blocking key. */
					const BLOCKED_NAME = BACKGROUND.BLOCKED_NAME;
	
				  //chrome.tabs.getSelected(null, function(tab) {
				    //const TAB_REQUEST_COUNTS = BACKGROUND.REQUEST_COUNTS[tab.id];
					const TAB_REQUEST_COUNTS = BACKGROUND.REQUEST_COUNTS[0];
				    var serviceRequestCounts;
				    var servicesBlocked;

				    if (TAB_REQUEST_COUNTS) {
				      serviceRequestCounts = TAB_REQUEST_COUNTS[2];
				      servicesBlocked = TAB_REQUEST_COUNTS[3];
				    } else {
				      serviceRequestCounts = INITIALIZE_ARRAY(SERVICE_COUNT, 0);
				      servicesBlocked = INITIALIZE_ARRAY(SERVICE_COUNT, true);
				    }

				    const SURFACE = document.getElementById('disconnect-popup').getElementsByTagName('tbody')[0];

				    for (var i = 0; i < SERVICE_COUNT; i++) {
				      var service = SERVICES[i];
				      var name = service[0];
				      var lowercaseName = name.toLowerCase();
				      var blockedName = lowercaseName + BLOCKED_NAME;
				      var requestCount = serviceRequestCounts[i];
				      var control =
				          SURFACE.appendChild(
				            SURFACE.getElementsByTagName('tr')[0].cloneNode(true)
				          );
				      var badge = control.getElementsByTagName('img')[0];
				      var text = control.getElementsByTagName('td')[1]; 
				      renderService(
				        name,
				        lowercaseName,
				        DESERIALIZE(localStorage[blockedName]),
				        requestCount,
				        control,
				        badge,
				        text
				      );
				      badge.alt = name;
				      text.textContent =
				          requestCount + (servicesBlocked[i] ? ' blocked' : ' unblocked');

				      control.onmouseover = function() { this.className = 'mouseover'; };

				      control.onmouseout = function() { this.removeAttribute('class'); };

				      control.onclick = (function(
				        service,
				        name,
				        lowercaseName,
				        blockedName,
				        requestCount,
				        control,
				        badge,
				        text
				      ) {
								return function()
									{
					        const URL = service[4];
					        const BLOCKED =
					            localStorage[blockedName] = !DESERIALIZE(localStorage[blockedName]);
					        renderService(
					          name, lowercaseName, BLOCKED, requestCount, control, badge, text
					        );
							api.broadcastBackground('disconnect-toggle-blocked', { 
								blockedName: blockedName
							});
					      }
							})(service, name, lowercaseName, blockedName, requestCount, control, badge, text)
				  };
				});
			});
		};
	
		function showPopup() {
			if (parent.top == window) {
				if ($('body > #disconnect-popup:visible').length) {
					$('body > #disconnect-popup').hide();
				} else if ($('body > #disconnect-popup').length) {
					$('body > #disconnect-popup').show();
				} else {
					var css = $.browser.safari? {
						'z-index': '2147483647',
						'position': 'fixed',
					 	'width': '140px',
					 	'height': '240px',
					 	'left': '25px',
					 	'top': '0px',
					 	'padding': '2px',
					 	'border': '1px solid #B1B1B1',
					 	'background-color': 'white',
					 	'border-radius': '10px'
					}: {
						'z-index': '2147483647',
						'position': 'fixed',
						'width': '140px',
						'height': '240px',
						'right': '20%',
						'top': '0px',
						'padding': '2px',
						'border': '1px solid #B1B1B1',
						'background-color': 'white',
						'border-radius': '10px'
					};
					$('#disconnect-popup').css(css).clone(true).prependTo($('body')).show();
					init();
				}
			}
		}

		api.listen('button-click', showPopup);

		function unload() {
			api.broadcastBackground('disconnect-reset');
		}
		try {
			window.removeEventListener('beforeunload', unload, false);
		} catch(e) {}
		window.addEventListener('beforeunload', unload, false);
  	});
})();