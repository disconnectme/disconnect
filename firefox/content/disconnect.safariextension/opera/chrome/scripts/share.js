/*
  A script for sharing Disconnect.

  Copyright 2012 Disconnect, Inc.

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

/* Handles clicks. */
$(function() {
  $('#share').click(function() {
    open(
      'https://www.facebook.com/sharer/sharer.php?u=https://www.youtube.com/watch?v=g5mFbgxMHqQ',
      null,
      'width=500,height=316'
    );
  });

  $('#tweet').click(function() {
    open(
      'https://twitter.com/share?url=https://www.youtube.com/watch?v=g5mFbgxMHqQ&text=See how an attacker can break into your accounts through social widgets and how you can stop them (by @disconnectme):',
      null,
      'width=500,height=257'
    );
  });
});
