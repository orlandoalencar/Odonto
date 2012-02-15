$(function(){
	function EdicionOdontograma(){
		var self = this;

		self.tratamientosPosibles = ko.observableArray([]);
		self.tratamientoSeleccionado = ko.observable(null);
		self.tratamientosAplicados = ko.observableArray([]);

		self.quitarTratamiento = function(tratamiento){
			self.tratamientosAplicados.remove(tratamiento);			
			$("#odontograma").odontograma('removeTratamiento', tratamiento);
		}

		self.tratamientoSeleccionado.subscribe(function(tratamiento){
			$("#odontograma").odontograma('setTratamiento', tratamiento);
		});
	}


	var vm = new EdicionOdontograma();	
	ko.applyBindings(vm);

	//Cargo los tratamientos
	$.getJSON('tratamientos.js', function(d){
		for (var i = d.length - 1; i >= 0; i--) {
			var tratamiento = d[i];
			vm.tratamientosPosibles.push(tratamiento);
		};		
	});

	$("#odontograma").odontograma().bind('tratamientoAplicado.odontograma', function(evt, tratamiento){
		vm.tratamientosAplicados.push(tratamiento);
	});
})