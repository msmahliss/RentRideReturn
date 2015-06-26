$(document).ready(function () {

	$(function() {
		$( "#datepicker" ).datepicker();
	});

	$('.js-rental-qty').change(function(){
		//update order subtotal
		//TODO: fix this so instead of price array there is a single point of truth from form prices
		var rentalPrices = [8.00, 13.00, 15.00, 18.00, 10.00];
		var rentalQtys = $('.js-rental-qty');
		var subTotal = 0.00;
		var qty;
		for (var i=0; i < rentalQtys.length; i++){
			//same as qty
			qty = rentalQtys[i].options[rentalQtys[i].selectedIndex].value;
			subTotal = subTotal + (rentalPrices[i] * qty); 
		}
		$('#subTotal').text('ORDER SUBTOTAL: $'+subTotal.toFixed(2));
	});

});