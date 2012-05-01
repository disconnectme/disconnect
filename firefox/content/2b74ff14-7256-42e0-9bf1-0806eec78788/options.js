/*
  The script for an options page that captures blocking preferences.

  Copyright 2011 Brian Kennish

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

/* The deserialization function. */
const DESERIALIZE = chrome.extension.getBackgroundPage().deserialize;

/* Sets the preferences. */
onload = function() {
  const REQUESTS_INDICATED = options.requestsIndicated;
  REQUESTS_INDICATED.checked = DESERIALIZE(localStorage.requestsIndicated);

  REQUESTS_INDICATED.onchange = function() {
    localStorage.requestsIndicated = this.checked;
  };

  const BOX_DECORATION = options.boxDecoration;
  BOX_DECORATION.selectedIndex = DESERIALIZE(localStorage.boxDecoration);

  BOX_DECORATION.onchange = function() {
    localStorage.boxDecoration = this.selectedIndex;
  };
};
