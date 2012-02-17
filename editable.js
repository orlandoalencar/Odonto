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

		self.guardar = function(){
			var tratamientos = $("#odontograma").odontograma('getTratamientosAplicados');
			console.log(JSON.stringify(tratamientos));
			$.post("guardar.aspx", tratamientos, function(r){ console.log(r);}, "json");
		}

		self.tratamientoSeleccionado.subscribe(function(tratamiento){
			$("#odontograma").odontograma('setTratamiento', tratamiento);
		});
	}


	var vm = new EdicionOdontograma();	
	ko.applyBindings(vm);

	//Cargo los tratamientos posibles
	$.getJSON('tratamientos.js', function(d){
		for (var i = d.length - 1; i >= 0; i--) {
			var tratamiento = d[i];
			vm.tratamientosPosibles.push(tratamiento);
		};		
	});

	//Cargo el estado del Odontograma
	$.getJSON('editable-data.js', function(d){
		//Los cargo en el view model, para que se veam en la lista
		for (var i = d.length - 1; i >= 0; i--) {
			vm.tratamientosAplicados.push(d[i]);
		};		
		
		$("#odontograma").odontograma({
			tratamientosAplicados: d
		}).bind('tratamientoAplicado.odontograma', function(evt, tratamiento){
			vm.tratamientosAplicados.push(tratamiento);
		});
	});	
})