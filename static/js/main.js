$(document).ready(function () {

	var validDates = ["05/28/2016","05/29/2016","06/04/2016","06/05/2016","06/11/2016","06/12/2016","06/18/2016",
				"06/19/2016","06/25/2016","06/26/2016","07/02/2016","07/03/2016","07/04/2016","07/09/2016",
				"07/10/2016","07/16/2016","07/17/2016","07/23/2016","07/24/2016","07/30/2016","07/31/2016",
				"08/06/2016","08/07/2016","08/13/2016","08/14/2016","08/20/2016","08/21/2016",
				"08/27/2016","08/28/2016","09/03/2016","09/04/2016","09/05/2016"];

	//terms and conditions checkbox 
	$('.js-terms-check').click(function(){
		$(this).toggleClass('is-checked');
		$('.js-terms-check-graphic').toggleClass('is-hidden');
	});

	$('[data-toggle="tooltip"]').tooltip()

	$('.order-form').submit(function(e){
		//If  no field has been selected, display an error message
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
	if (date=="08/08/2015"){
		$('.close-message').show();
		$('.js-rental-qty option').each(function(){
			 $(this).attr('disabled', true);
		});
	} else {
		$('.close-message').hide();		
		$('.js-rental-qty option').each(function(){
			 $(this).attr('disabled', false);
		});
	}
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