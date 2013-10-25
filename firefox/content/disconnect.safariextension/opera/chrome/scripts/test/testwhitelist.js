/*
  The script containing tests for Disconnect whitelisting

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

    Eason Goodale <eason.goodale@gmail.com>
*/

options = localStorage;

const DESERIALIZE = deserialize;

function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

test("Basic isWhitelisted", function() {
  equal(isWhitelisted('techcrunch.com', 'Disconnect', 'Google'), false);
  equal(isWhitelisted('techcrunch.com', 'Disconnect', 'Facebook'), true);
  equal(isWhitelisted('techcrunch.com', 'Advertising', 'quantcast.com'), true);
  equal(isWhitelisted('techcrunch.com', 'Analytics', 'comscore.com'), true);
  equal(isWhitelisted('techcrunch.com', 'Analytics', 'chartbeat.com'), false);
  equal(isWhitelisted('example.com', 'Advertising', 'quantcast.com'), false);
  equal(isWhitelisted('example.com', 'Analytics', 'comscore.com'), false);
  equal(isWhitelisted('example.com', 'Content', 'ooyala.com'), true);
});

function prepWhitelist() {
  options.whitelist = JSON.stringify({
  "techcrunch.com": {
    "Disconnect": {
      "whitelisted": false,
      "services": {
          "Google": false,
          "Facebook": true,
          "Twitter": false
        }
    },
    "Advertising": {
      "whitelisted": true,
      "services": {}
    },
    "Analytics": {
      "whitelisted": false,
      "services": {"comscore.com": true}
    },
    "Social": {
      "whitelisted": false,
      "services": {}
    },
    "Content": {
      "whitelisted": true,
      "services": {"ooyala.com": false}
    }
  }
});

}