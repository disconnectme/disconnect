$(function() {
  var disconnect_slider = $("#disconnect_slider")
  var charity_slider = $("#charity_slider")
  var disconnect_box = $("#disconnect_amount")
  var charity_box = $("#charity_amount")

  function update_value_box() {
    var total = $("#payment_total input[name=payment_group]:checked").val()
    var charity_total = total * (charity_slider.slider('option', 'value')/100);
    var disconnect_total = total * (disconnect_slider.slider('option', 'value')/100);

    charity_box.val("$" + charity_total);
    disconnect_box.val("$" + disconnect_total);
  }

  disconnect_slider.slider({
    value: 100,
    orientation: "horizontal",
    animate: true
  });
  charity_slider.slider({
    value: 0,
    orientation: "horizontal",
    animate: true
  });

  update_value_box();

  disconnect_slider.bind('slide',function(){
    var disconnect_value = disconnect_slider.slider('option', 'value');
    var charity_value = 100 - disconnect_value;
    charity_slider.slider('option', 'value', charity_value);
    update_value_box();
  });
  charity_slider.bind('slide',function(){
    var charity_value = charity_slider.slider('option', 'value');
    var disconnect_value = 100 - charity_value;
    disconnect_slider.slider('option', 'value', disconnect_value);
    update_value_box();
  });

  $("#custom_amount").change( function(){
    $("input:radio[name=payment_group]")[4].checked = true;
    $("#custom_radio").val($("#custom_amount").val());
    update_value_box();
  });

  $("input:radio[name=payment_group]").click( function(){
    update_value_box();
  })

  $('#stripe').click(function(){
    var total = $("#payment_total input[name=payment_group]:checked").val()
    var charity_total = total * (charity_slider.slider('option', 'value')/100);
    var disconnect_total = total * (disconnect_slider.slider('option', 'value')/100);
    
    var token = function(res){
      var $input = $('<input type=hidden name=stripeToken />').val(res.id);
      $('form').append($input).submit();
    };

    StripeCheckout.open({
      key:         'pk_test_czwzkTp2tactuLOEOqbMTRzG',
      amount:      disconnect_total * 100,
      name:        'Disconnect Payment',
      description: 'Thank you for your contribution!',
      token:       token
    });

    return false;
  });
});