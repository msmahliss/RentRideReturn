$(document).ready(function () {

	var validDates = ["06/28/2015","07/03/2015","07/04/2015","07/05/2015","07/11/2015","07/12/2015",
				"07/18/2015","07/19/2015","07/25/2015","07/26/2015","08/01/2015","08/02/2015",
				"08/08/2015","08/09/2015","08/15/2015","08/16/2015","08/22/2015","08/23/2015",
				"08/29/2015","08/30/2015","09/05/2015","09/06/2015","09/07/2015"];

	//terms and conditions checkbox 
	$('.js-terms-check').click(function(){
		$(this).toggleClass('is-checked');
		$('.js-terms-check-graphic').toggleClass('is-hidden');
	});

	$('[data-toggle="tooltip"]').tooltip()

	$('.order-form').submit(function(e){
		// If  no field has been selected, display an error message
	    //text: "You must select at least 1 item";

		var selection = 0;

		$('.js-rental-qty option:selected').each(function(){
			if ( parseFloat($(this).val()) ) {
				selection += parseFloat($(this).val());
				return;
			}
		});

		if (!selection){
		    // $('.error-message').removeClass('is-hidden');
		    $('.error-message').show("slow");
		    // And we prevent the form to be sent by canceling the event
		    e.preventDefault();
		}	 
	});

	$('.js-rental-qty').change(function(){
		//remove "no selection" error message when selection is made
		$('.error-message').hide("slow");
		//update qtys and check availability
		//TODO: improve helper function to update selected quantitiess

		var date = $('#datepicker').val();
		fetchOrderData(date);
	});

	//datepicker setup 

	$("#datepicker").datepicker({
		beforeShowDay: displayValidDates
	});

	findFirstDate();

	$('#datepicker').change(function(){
		//check order status based on date
		var date = $(this).val();
		closeBookings(date);
		fetchOrderData(date);
	});

	//checked-in checkboxes
	//TOODO:find the order for which this is true and update that orderID

function findFirstDate() {
	//If no date is selected, choose first valid rental date
 	var date;
 	var currentDate = $("#datepicker").val();
 	if (currentDate){
	 	if (currentDate.length){
	 		return;
	 	} 		
 	}
 	
 	//Check if date is before today
   	var today = new Date();
 	var m = today.getMonth() + 1;
 	var d = today.getDate(); 
 	var y = today.getFullYear(); 
 	today = new Date(m + '/' + d + '/' + y);
   	for (var i=0; i < validDates.length; i++){
   		date = new Date(validDates[i]);
   		if (date >= today) {

			$('#datepicker').val(validDates[i]);
			closeBookings(validDates[i]);
			fetchOrderData(validDates[i]);
			return;
   		}
   	}
 }
 
function displayValidDates(date) {
 	//First check if date is before today
   	var today = new Date();
 	var m = today.getMonth() + 1;
 	var d = today.getDate(); 
 	var y = today.getFullYear(); 
 	today = new Date(m + '/' + d + '/' + y);
 	console.log(today);
 	if (date < today) {
 		return false;
 	}
 	//Convert the date in to the mm-dd-yyyy format  	
 	var m = date.getMonth() + 1;
 	(m < 10) ? (m = "0" + m) : (m=m);
 	var d = date.getDate(); 
 	(d < 10) ? (d = "0" + d) : (d=d);
 	var y = date.getFullYear(); 
 	var currentDate = m + '/' + d + '/' + y ; 
 
 	return [ validDates.indexOf(currentDate) > -1 ];
 }

function closeBookings(date){
 	//Close bookings if date is today
		$('.close-message').show();
		$('.js-rental-qty option').each(function(){
			 $(this).attr('disabled', true);
		});

}

function fetchOrderData(date){
	$.get('/getOrderStatus?date='+date, function(result, status){
		//update QTY select dropdown for each item
		var max; 
		var total_ordered; 
		var avail; 
		var currentMax; 
		var upperLimit; 
		var max_dd = 4; 

		// get individual item totals
		// for classic chairs. sum b0, b2 | for deluxe chairs. sum b1, b3 | for umbrellas. sum b2, b3, b4
		total_ordered = result["B0"]["total_ordered"] ? result["B0"]["total_ordered"] : 0; 
		total_ordered += result["B2"]["total_ordered"] ? result["B2"]["total_ordered"] : 0;''
		var total_classic = total_ordered;

		total_ordered = result["B1"]["total_ordered"] ? result["B1"]["total_ordered"] : 0;
		total_ordered += result["B3"]["total_ordered"] ? result["B3"]["total_ordered"] : 0;
		var total_deluxe = total_ordered; 

		total_ordered = result["B2"]["total_ordered"] ? result["B2"]["total_ordered"] : 0; 
		total_ordered += result["B3"]["total_ordered"] ? result["B3"]["total_ordered"] : 0; 
		total_ordered += result["B4"]["total_ordered"] ? result["B4"]["total_ordered"] : 0; 
		var total_umbrella = total_ordered;

		for (var i in result){
			max = result[i]["max_qty"];

			if ((i=="B0")||(i=="B2")){
				total_ordered = total_classic;
			} else if ( (i=="B1")||(i=="B3") ){
				total_ordered = total_deluxe;
			} else if ( (i=="B4") ){
				total_ordered = total_umbrella;
			} else {
				total_ordered = result[i]["total_ordered"] ? result[i]["total_ordered"] : 0;
			}

			//for B2 avail = Math.min(B0, B4)
			//for B3 avail = Math.min(B1, B4)
			if (i=="B2"){
				avail = result["B0"]["max_qty"] - total_classic;
				avail = Math.min(avail,(result["B4"]["max_qty"] - total_umbrella));
			} else if (i=="B3"){
				avail = result["B1"]["max_qty"] - total_deluxe;
				avail = Math.min(avail,(result["B4"]["max_qty"] - total_umbrella));
			} else {
				avail = max-total_ordered;
			}

			avail = Math.max(0, avail);

			// console.log(i+": "+total_ordered+" ordered / "+ max+" max / "+avail+" available" );

			currentMax=0;
			$('#'+i + ' option').each(function(){
			    currentMax = Math.max($(this).val(), currentMax);
			    if ($(this).val()>avail) {
			    	$(this).remove();
			    }
			});

			upperLimit = Math.min(max_dd,avail);
			for (var j=currentMax+1; j<=upperLimit;j++){
			    $('#'+i).append('<option value="'+j+'">'+j+'</option>');
			}
		};

	});
}

});