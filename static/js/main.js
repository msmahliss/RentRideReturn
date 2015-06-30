$(document).ready(function () {

	$(function() {
		$( "#datepicker" ).datepicker({
			beforeShowDay: DisplayValidDates
			// beforeShowDay: $.datepicker.noWeekends
			// showOn: "button",
			// buttonImage: "/img/cal.png" 
		});
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


 
function DisplayValidDates(date) {

	var validDates = ["6-28-2015","7-3-2015","7-4-2015","7-5-2015","7-11-2015","7-12-2015",
				"7-18-2015","7-19-2015","7-25-2015","7-26-2015",
				"8-1-2015","8-2-2015","8-8-2015","8-9-2015","8-15-2015","8-16-2015",
				"8-22-2015","8-23-2015","8-29-2015","8-30-2015","9-6-2015","9-6-2015"	
			];
 

 	//First check if date is before today
   	var today = new Date();
 	if (date < today) {
 		return false;
 	}
 	//Convert the date in to the mm-dd-yyyy format  	
 	var m = date.getMonth(); 
 	var d = date.getDate(); 
 	var y = date.getFullYear(); 
 	var currentDate = (m + 1) + '-' + d + '-' + y ; 
 
 	return [ validDates.indexOf(currentDate) > -1 ] 
 }

});