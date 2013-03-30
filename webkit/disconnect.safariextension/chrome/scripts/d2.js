/*
  The script for a pay-what-you-want page.

  Copyright 2013 Disconnect, Inc.

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
    Brian Kennish <byoogle@gmail.com>
*/
$(function() {
  /* Updates the displayed value box to reflect amount changes. */
  function updateValueBox() {
    var total = $('#one :checked').val();
    var disconnectTotal =
        (total * (disconnectSlider.slider('option', 'value') / 100)).toFixed(2);
    var charityTotal =
        (total * (charitySlider.slider('option', 'value') / 100)).toFixed(2);

    disconnectSplit.val('$' + disconnectTotal);
    charitySplit.val('$' + charityTotal);
  }

  $('#pwyw-action').click(function() {
    $('html, body').animate({scrollTop: $('#pwyw').offset().top - 45});
  });
  $('#more-action').click(function() {
    $('html, body').animate({scrollTop: $('#more').offset().top});
  });
  
  var disconnectSlider = $('#disconnect-slider');
  var charitySlider = $('#charity-slider');
  var disconnectSplit = $('#disconnect-split');
  var charitySplit = $('#charity-split');

  disconnectSlider.slider({
    value: 75,
    orientation: 'horizontal',
    animate: true
  });
  charitySlider.slider({
    value: 25,
    orientation: 'horizontal',
    animate: true
  });

  updateValueBox();

  disconnectSlider.bind('slide', function() {
    var disconnectValue = disconnectSlider.slider('option', 'value');
    var charityValue = 100 - disconnectValue;
    charitySlider.slider('option', 'value', charityValue);
    updateValueBox();
  });
  charitySlider.bind('slide', function() {
    var charityValue = charitySlider.slider('option', 'value');
    var disconnectValue = 100 - charityValue;
    disconnectSlider.slider('option', 'value', disconnectValue);
    updateValueBox();
  });

  $('#one input:radio').click(function() {
    updateValueBox();
  });
  $('#override-price').change(function() {
    $('#override')[0].checked = true;
    var overrideValue = $(this).val();

    if ($.isNumeric(overrideValue) && overrideValue >= 0) {
      $('#override').val(overrideValue);
      updateValueBox();
    }
  });

  $('#cc').click(function() {
    var total = $('#one :checked').val();

    var token = function(result) {
      var input = $('<input type="hidden" name="stripeToken">').val(result.id);
      $('form').append(input).submit();
    };

    StripeCheckout.open({
      // TODO: Update to production key before going live.
      key:         'pk_test_czwzkTp2tactuLOEOqbMTRzG',
      amount:      total * 100,
      name:        'Give to Disconnect & charity',
      description: 'Thank you for your contribution!',
      token:       token
    });

    return false;
  });
});
