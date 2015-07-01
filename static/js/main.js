$(document).ready(function () {

	$(function() {
		$( "#datepicker" ).datepicker({
			beforeShowDay: DisplayValidDates
			// beforeShowDay: $.datepicker.noWeekends
			// showOn: "button",
			// buttonImage: "/img/cal.png" 
		});
	});

	$('#datepicker').change(function(){
		//check order status based on date
		var date = $(this).val()
		// var pickuplocation = $('.js-rental-location');
		// var temp = pickuplocation[0];
		// console.log(temp.options[temp.selectedIndex].value);

		$.get('/getOrderStatus?date='+date, function(result, status){

			if(result.length){
				for (var i=0; i<result.length; i++){
					console.log(result[i]["_id"] +": "+result[i]["total_ordered"]+" ordered / "+(50-result[i]["total_ordered"])+" available");
				};				
			} else {
				console.log("no orders");
			}

		});

	});


 
function DisplayValidDates(date) {

	var validDates = ["6-28-2015","7-3-2015","7-4-2015","7-5-2015","7-11-2015","7-12-2015",
				"7-18-2015","7-19-2015","7-25-2015","7-26-2015",
				"8-1-2015","8-2-2015","8-8-2015","8-9-2015","8-15-2015","8-16-2015",
				"8-22-2015","8-23-2015","8-29-2015","8-30-2015","9-6-2015","9-6-2015"	
			];
 

 	//First check if date is before today
  //  	var today = new Date();
 	// if (date < today) {
 	// 	return false;
 	// }
 	//Convert the date in to the mm-dd-yyyy format  	
 	var m = date.getMonth(); 
 	var d = date.getDate(); 
 	var y = date.getFullYear(); 
 	var currentDate = (m + 1) + '-' + d + '-' + y ; 
 
 	return [ validDates.indexOf(currentDate) > -1 ] 
 }

});