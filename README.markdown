# Disconnect

[Disconnect](https://disconnect.me/) is a browser extension that makes the web
faster, more private, and more secure.

![Disconnect](collateral/disconnect/d2-faster-transparent.png)  
Disconnect has been named one of the
[100 best innovations of the year](http://www.popsci.com/bown/2013/category/software)
by Popular Science and one of the
[20 best Chrome extensions](http://lifehacker.com/lifehacker-pack-for-chrome-2013-our-list-of-the-best-e-880863393)
and
[20 best Firefox add-ons](http://lifehacker.com/lifehacker-pack-for-firefox-2013-our-list-of-the-best-896766794)
by Lifehacker.

You might fancy [watching a demo](https://www.youtube.com/watch?v=Lvem1Z66C7Q)
or [trying the extension](https://disconnect.me/).

## Dev HOWTO

0. Fork this repository.
1. Switch to your working directory of choice.
2. Clone the development repo:
        git clone git@github.com:[username]/disconnect.git

### In Chrome

3. Go to the Chrome menu > **Tools** > **Extensions**.
4. Check **Developer mode** then press **Load unpacked extension...** .
5. Find your working directory.
6. Under `firefox`, `content`, `disconnect.safariextension`, and `opera`, select
   `chrome`.
7. To test after you make a change, be sure to expand the extension listing then
   press **Reload**.
8. Push your changes.
9. Send us pull requests<em>!</em>

### In Firefox

3. Go to
   [your Mozilla profile folder](http://kb.mozillazine.org/Profile_folder).
4. Under `extensions`, create a new text file.
5. Enter the path to your working directory followed by `firefox` then a closing
   slash in the file.
6. Save the file as `2.0@disconnect.me`.
7. (Re)start Firefox.
8. To test after you make a change, be sure to restart Firefox.
9. Push your changes.
10. Send us pull requests<em>!</em>

### In Safari

3. Go to **Develop** > **Show Extension Builder**.
4. Click **+** then select **Add Extension...** .
5. Find your working directory.
6. Under `firefox` and `content`, select `disconnect.safariextension`.
7. Click **Install** then **Allow**.
8. To test after you make a change, be sure to click **Reload** then **Allow**.
9. Push your changes.
10. Send us pull requests<em>!</em>

### In Opera

3. Go to **Window** > **Extensions**.
4. Press **Developer Mode** then press **Load Unpacked Extension...** .
5. Find your working directory.
6. Under `firefox`, `content`, and `disconnect.safariextension`, select `opera`.
7. To test after you make a change, be sure to press **Reload**.
8. Push your changes.
9. Send us pull requests<em>!</em>

## Software used

These libraries are bundled with the project and needn’t be updated manually:

* [jQuery](https://github.com/jquery/jquery)
* [SJCL](https://github.com/bitwiseshiftleft/sjcl)
* [D3.js](https://github.com/mbostock/d3)
* [port.js](https://github.com/disconnectme/port)
* [sitename.js](https://github.com/disconnectme/sitename)
* [favicon.js](https://github.com/disconnectme/favicon)

## License

Copyright 2010–2014 Disconnect, Inc.

This program is free software, excluding the brand features and third-party
portions of the program identified in the “Exceptions” below: you can
redistribute it and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the
[GNU General Public License](https://www.gnu.org/licenses/gpl.html) for more
details.

## Exceptions

The Disconnect logos, trademarks, domain names, and other brand features used in
this program cannot be reused without permission and no license is granted
thereto.

Further, the following third-party portions of the program and any use thereof
are subject to their own license terms as set forth below:

* [Antenna RE](https://github.com/disconnectme/disconnect/tree/master/firefox/content/disconnect.safariextension/opera/chrome/fonts)
  replaces system fonts and is the valuable copyrighted property of WebType LLC,
  The Font Bureau, and/or their suppliers. You may not attempt to copy, install,
  redistribute, convert, modify, or reverse engineer this font software. Please
  contact [WebType](http://www.webtype.com/) with any questions. Antenna RE can
  be removed and will be replaced with a system font.

* [Tipped](https://github.com/disconnectme/disconnect/tree/master/firefox/content/disconnect.safariextension/opera/chrome/scripts/vendor/tipped)
  provides tooltips and is subject to the terms and conditions of the
  [Tipped License](http://projects.nickstakenburg.com/tipped/license). Tipped
  can be replaced with a library such as [jQuery UI](http://jqueryui.com/).
