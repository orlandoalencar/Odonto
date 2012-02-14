jQuery(function(){

	function drawDiente(svg, parentGroup, diente){
		if(!diente) throw new Error('Error no se ha especificado el diente.');
		
		var x = diente.x || 0,
			y = diente.y || 0;
		
		var defaultPolygon = {fill: 'white', stroke: 'navy', strokeWidth: 0.5};
		var dienteGroup = svg.group(parentGroup, {transform: 'translate(' + x + ',' + y + ')'});

		var calculatePolygon = function(cara){
			switch(cara){
				case 'S': //Superior
					return [[0,0],[20,0],[15,5],[5,5]];
				case 'I': //Inferior
					return [[5,15],[15,15],[20,20],[0,20]];
				case 'D': //Derecha
					return [[15,5],[20,0],[20,20],[15,15]];
				case 'Z': //Izquierda
					return [[0,0],[5,5],[5,15],[0,20]];
				case 'C': //Central
					return [[5,5],[15,5],[15,15],[5,15]];
				default:
					throw new Error('La cara: ' + cara + ' no es una cara valida.');
			}			
		}

		var createCara = function(cara){
			var polygonPoints = calculatePolygon(cara);
			return $(svg.polygon(dienteGroup, polygonPoints, defaultPolygon))
				.data('cara', cara)
		    	.click(function(){
		    		var me = $(this);
		    		var cara = me.data('cara');
					
					if(!vm.tratamientoSeleccionado()){
						alert('Debe seleccionar un tratamiento previamente.');	
						return false;
					}

					//Validaciones
					//Validamos el tratamiento
					var tratamiento = vm.tratamientoSeleccionado();

					if(cara == 'X' && !tratamiento.aplicaDiente){
						alert('El tratamiento seleccionado no se puede aplicar a toda la pieza.');
						return false;
					}
					if(cara != 'X' && !tratamiento.aplicaCara){
						alert('El tratamiento seleccionado no se puede aplicar a una cara.');
						return false;
					}
					
					//TODO: Validaciones de si la cara tiene tratamiento o no, etc...
					vm.tratamientosAplicados.push({diente: diente, cara: cara, tratamiento: tratamiento});
					
					//Actualizo el SVG
					renderSvg();
		    	}).mouseenter(function(){
		    		var me = $(this);
		    		me.data('oldFill', me.attr('fill'));
		    		me.attr('fill', 'yellow');
		    	}).mouseleave(function(){
		    		var me = $(this);
		    		me.attr('fill', me.data('oldFill'));
		    	});	
		};
	        	
		//Creo las cara SVG y las agrego como un diccionario
		var caras = ['S', 'I', 'D', 'Z', 'C'];
		for (var i = caras.length - 1; i >= 0; i--) {
			var cara = caras[i];
			caras[cara] = createCara(cara);
		};

		//Creo el diente completo y lo agrego a las caras
	    var caraCompleto = svg.text(dienteGroup, 6, 30, diente.id.toString(), 
	    	{fill: 'navy', stroke: 'navy', strokeWidth: 0.1, style: 'font-size: 6pt;font-weight:normal'});
    	caraCompleto = $(caraCompleto).data('cara', 'X');

		caras['X'] = caraCompleto;

		//Busco los tratamientos aplicados al diente
		var tratamientosAplicadosAlDiente = ko.utils.arrayFilter(vm.tratamientosAplicados(), function(t){
			return t.diente.id == diente.id;
		});

		for (var i = tratamientosAplicadosAlDiente.length - 1; i >= 0; i--) {
			var t = tratamientosAplicadosAlDiente[i];
			caras[t.cara].attr('fill', 'red');
		};
	};

	function renderSvg(){
		console.log('update render');

		var svg = $('#odontograma').svg('get').clear();
		var parentGroup = svg.group({transform: 'scale(1.5)'});
		var dientes = vm.dientes();
		for (var i =  dientes.length - 1; i >= 0; i--) {
			var diente =  dientes[i];
			var dienteUnwrapped = ko.utils.unwrapObservable(diente); 
			drawDiente(svg, parentGroup, dienteUnwrapped);
		};
	}

	//View Models
	function DienteModel(id, x, y){
		var self = this;

		self.id = id;	
		self.x = x;
		self.y = y;		
	};

	function OdontogramaModel(){
		var self = this;

		self.tratamientosPosibles = ko.observableArray([]);
		self.tratamientoSeleccionado = ko.observable(null);
		self.tratamientosAplicados = ko.observableArray([]);

		self.quitarTratamiento = function(tratamiento){
			self.tratamientosAplicados.remove(tratamiento);
			renderSvg();
		}

		//Cargo los dientes
		var dientes = [];
		//Dientes izquierdos
		for(var i = 0; i < 8; i++){
			dientes.push(new DienteModel(18 - i, i * 25, 0));	
		}
		for(var i = 0; i < 5; i++){
			dientes.push(new DienteModel(55 - i, (i + 3) * 25, 1 * 40));	
		}
		for(var i = 0; i < 5; i++){
			dientes.push(new DienteModel(85 - i, (i + 3) * 25, 2 * 40));	
		}
		for(var i = 0; i < 8; i++){
			dientes.push(new DienteModel(48 - i, i * 25, 3 * 40));	
		}
		//Dientes derechos
		for(var i = 0; i < 8; i++){
			dientes.push(new DienteModel(21 + i, i * 25 + 210, 0));	
		}
		for(var i = 0; i < 5; i++){
			dientes.push(new DienteModel(61 + i, i * 25 + 210, 1 * 40));	
		}
		for(var i = 0; i < 5; i++){
			dientes.push(new DienteModel(71 + i, i * 25 + 210, 2 * 40));	
		}
		for(var i = 0; i < 8; i++){
			dientes.push(new DienteModel(31 + i, i * 25 + 210, 3 * 40));	
		}

		self.dientes = ko.observableArray(dientes);
	};

	vm = new OdontogramaModel();
	
	//Inicializo SVG
    $('#odontograma').svg({
        settings:{ width: '620px', height: '250px' }
    });

	ko.applyBindings(vm);

	//TODO: Cargo el estado del odontograma
	renderSvg();


	//Cargo los tratamientos
	$.getJSON('tratamientos.js', function(d){
		for (var i = d.length - 1; i >= 0; i--) {
			var tratamiento = d[i];
			vm.tratamientosPosibles.push(tratamiento);
		};		
	});
});