#!/bin/bash
# A script that packages Disconnect for distribution.
#
# Copyright 2014 Disconnect, Inc.
#
# This program is free software: you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free Software
# Foundation, either version 3 of the License, or (at your option) any later
# version.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along with
# this program. If not, see <http://www.gnu.org/licenses/>.
#
# Authors (one per line):
#
#   Eason Goodale <eason.goodale@gmail.com>
#   Brian Kennish <byoogle@gmail.com>

cd ./builds
rm disconnect.xpi disconnect.zip

cd ../firefox
cp -r ./content/disconnect.safariextension/opera/chrome/ ./content/disconnect/

rm ./content/disconnect/images/legacy/\* \
./content/disconnect/manifest.json \
./content/disconnect/markup/\* \
./content/disconnect/scripts/background.js \
./content/disconnect/scripts/chrollusion/graphrunner.js \
./content/disconnect/scripts/chrollusion/index-embed.js \
./content/disconnect/scripts/chrollusion/index.js \
./content/disconnect/scripts/content.js \
./content/disconnect/scripts/errorhandler.js \
./content/disconnect/scripts/popup.js \
./content/disconnect/scripts/services.js \
./content/disconnect/scripts/share.js \
./content/disconnect/scripts/vendor/moment/\* \
./content/disconnect/scripts/vendor/port/\* \
./content/disconnect/scripts/vendor/tipped/\* \
./content/disconnect/stylesheets/chrollusion/\* \
./content/disconnect/stylesheets/content.css \
./content/disconnect/stylesheets/legacy.css \
./content/disconnect/stylesheets/popup.css \
./content/disconnect/stylesheets/vendor/hint/\* \
./content/disconnect/stylesheets/vendor/tipped/\*

zip -r ../builds/disconnect.xpi * -x \*.DS_Store \
content/disconnect.safariextension/**\* \
content/disconnect.safariextension/

rm -rf ./content/disconnect/

cd content/disconnect.safariextension/opera
zip -r ../../../../builds/disconnect chrome -x \*.DS_Store
