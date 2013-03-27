/*
The javascript for the pay what you want page.

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

$(function() {
  var disconnectSlider = $('#disconnect-slider');
  var charitySlider = $('#charity-slider');
  var disconnectBox = $('#disconnect-amount');
  var charityBox = $('#charity-amount');

  /*Updates the displayed value box to reflect total payment amount changes.*/
  function updateValueBox() {
    var total = $('#payment-total input[name=payment-group]:checked').val()
    var charityTotal = total * (charitySlider.slider('option', 'value') / 100);
    var disconnectTotal = total * (disconnectSlider.slider('option', 'value') / 100);

    charityBox.val('$' + charityTotal);
    disconnectBox.val('$' + disconnectTotal);
  }

  disconnectSlider.slider({
    value: 100,
    orientation: 'horizontal',
    animate: true
  });
  charitySlider.slider({
    value: 0,
    orientation: 'horizontal',
    animate: true
  });

  updateValueBox();

  disconnectSlider.bind('slide',function() {
    var disconnectValue = disconnectSlider.slider('option', 'value');
    var charityValue = 100 - disconnectValue;
    charitySlider.slider('option', 'value', charityValue);
    updateValueBox();
  });
  charitySlider.bind('slide',function() {
    var charityValue = charitySlider.slider('option', 'value');
    var disconnectValue = 100 - charityValue;
    disconnectSlider.slider('option', 'value', disconnectValue);
    updateValueBox();
  });

  $('#custom-amount').change( function() {
    $('input:radio[name=payment-group]')[4].checked = true;
    $('#custom-radio').val($('#custom-amount').val());
    updateValueBox();
  });

  $('input:radio[name=payment-group]').click( function() {
    updateValueBox();
  })

  $('#stripe').click(function() {
    var total = $('#payment-total input[name=payment-group]:checked').val()
    var charityTotal = total * (charitySlider.slider('option', 'value') / 100);
    var disconnectTotal = total * (disconnectSlider.slider('option', 'value') / 100);
    
    var token = function(res){
      var $input = $('<input type="hidden" name="stripeToken">').val(res.id);
      $('form').append($input).submit();
    };

    StripeCheckout.open({
      //update this to our actual production key before it goes live
      key:         'pk_test_czwzkTp2tactuLOEOqbMTRzG',
      amount:      disconnectTotal * 100,
      name:        'Disconnect Payment',
      description: 'Thank you for your contribution!',
      token:       token
    });

    return false;
  });
});
