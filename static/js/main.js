$(document).ready(function () {

	var validDates = ["06/28/2015","07/03/2015","07/04/2015","07/05/2015","07/11/2015","07/12/2015",
				"07/18/2015","07/19/2015","07/25/2015","07/26/2015","08/01/2015","08/02/2015",
				"08/8/2015","08/09/2015","08/15/2015","08/16/2015","08/22/2015","08/23/2015",
				"08/29/2015","08/30/2015","09/5/2015","09/6/2015"];

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
				console.log("selection made!");
				return;
			}
		});

		if (!selection){
		    $('.error-message').removeClass('is-hidden');
		    // And we prevent the form to be sent by canceling the event
		    e.preventDefault();
		}	 
	});

	$('.js-rental-qty').change(function(){
		//remove error message when selection is made
		$('.error-message').addClass('is-hidden');
	});

	//datepicker setup 
	var firstDate = findFirstDate();
	$('#datepicker').val(firstDate);

	$("#datepicker").datepicker({
		beforeShowDay: DisplayValidDates
		// beforeShowDay: $.datepicker.noWeekends
		// showOn: "button",
		// buttonImage: "/img/cal.png" 
	});

	$('#datepicker').change(function(){
		//check order status based on date
		var date = $(this).val();
		// var pickuplocation = $('.js-rental-location');
		// var temp = pickuplocation[0];
		// console.log(temp.options[temp.selectedIndex].value);

		$.get('/getOrderStatus?date='+date, function(result, status){
				//update QTY option dropdown for each item
				 var max = 20;
				 var avail = 4;
				//remove options
				// $('#Field10 option').each(function(){
				    // max = Math.max($(this).val(), max);
				    // if ($(this).val()>rem_seats) { $(this).remove(); }
				// })

				//add options
				// for (var i=max+1; i<=limit;i++){
				    // $('#Field10').append('<option value="'+i+'">'+i+'</option>');
				// }

				//reset all options

				// for (var i = 0; i < allSelectElems.length; i++){
				// 	for (var j=0; j<=4;j++){
				// 	    $('.rental-qty').append('<option value="'+j+'">'+j+'</option>');
				// 	}					
				// }

				for (var i=0; i<result.length; i++){

					// var itemID = result[i]["_id"];
					// var avail = Math.max(0,max-result[i]["total_ordered"]);
					// console.log(itemID+": "+result[i]["total_ordered"]+" ordered / "+avail+" available" +
					// 	"/ $"+result[i]["total_cost"]+" in orders");

					// var currentMax=0;
					// $('#'+itemID + ' option').each(function(){
					//     currentMax = Math.max($(this).val(), currentMax);
					//     if ($(this).val()>avail) {
					//     	$(this).remove();
					//     }
					// });

					// var upperLimit = Math.min(4,avail);
					// for (var j=currentMax+1; j<=upperLimit;j++){
					//     $('#'+itemID+' option').append('<option value="'+j+'">'+j+'</option>');
					// }
				};

		});

	});


function findFirstDate() {
 	//First check if date is before today
 	var date;
   	var today = new Date();
 	var m = today.getMonth() + 1;
 	var d = today.getDate(); 
 	var y = today.getFullYear(); 
 	today = new Date(m + '/' + d + '/' + y);
 	console.log(today);
   	for (var i=0; i < validDates.length; i++){
   		date = new Date(validDates[i]);
   		if (date >= today) {
   			return validDates[i];
   		}
   	}
 }
 
function DisplayValidDates(date) {
 	//First check if date is before today
   	var today = new Date();
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

});