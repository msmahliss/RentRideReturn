$(document).ready(function () {



	$( "#datepicker" ).datepicker({
		beforeShowDay: DisplayValidDates
		// beforeShowDay: $.datepicker.noWeekends
		// showOn: "button",
		// buttonImage: "/img/cal.png" 
	});

	$('.carousel').carousel({
	 	interval: 10000
	});

	//terms and conditions checkbox 
	$('.js-terms-check').click(function(){
		$(this).toggleClass('is-checked');
		$('.js-terms-check-graphic').toggleClass('is-hidden');
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
				if (!result.length){
					console.log('no orders');
				}
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