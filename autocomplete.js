/*
** Autocomplete
*/
$(document).ready(function() {
	$('#autocomplete').keyup(function autocomplete(event) {
		//checking if the delete key was pressed
		if(event.which == 8) {
			event.preventDefault();
			return;
		}
		now.getGuess($('#autocomplete').val());
	});

now.receiveGuess = function(guess) {
	var val = $('#autocomplete').val();
//	var	subGuess = guess.substring(val.length);
  if(guess) {
    $('#autocomplete').val(val + guess);
    $('#autocomplete')[0].selectionStart = val.length;
    $('#autocomplete')[0].selectionEnd = guess.length + val.length;
  }
};
});
