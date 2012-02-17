$(function(){
	//Cargo el estado del Odontograma
	$.getJSON('cargado-data.js', function(d){
		$("#odontograma").odontograma({
			tratamientosAplicados: d,
			scale: 2,
			width: '830px',
			height: '334px',			
			readOnly: true
		});
	});
})