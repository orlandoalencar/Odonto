/**
* jQuery Odontogram Plugin - by Walter Poch
* Developed for using by Clip Solutions
* http://wpoch.com.ar
*/
(function( $ ){

	//View Models
	function DienteModel(id, x, y){
		var self = this;

		self.id = id;	
		self.x = x;
		self.y = y;		
	};

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

	// Private functions
 	function arrayFilter (array, predicate) {
        array = array || [];
        var result = [];
        for (var i = 0, j = array.length; i < j; i++)
            if (predicate(array[i]))
                result.push(array[i]);
        return result;
    }

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
					
					if(!tratamientoSeleccionado){
						alert('Debe seleccionar un tratamiento previamente.');	
						return false;
					}

					//Validaciones
					//Validamos el tratamiento
					if(cara == 'X' && !tratamientoSeleccionado.aplicaDiente){
						alert('El tratamiento seleccionado no se puede aplicar a toda la pieza.');
						return false;
					}
					if(cara != 'X' && !tratamientoSeleccionado.aplicaCara){
						alert('El tratamiento seleccionado no se puede aplicar a una cara.');
						return false;
					}
					
					//TODO: Validaciones de si la cara tiene tratamiento o no, etc...
					var tratamiento = {
						diente: diente, 
						cara: cara, 
						tratamiento: tratamientoSeleccionado
					};
					tratamientosAplicados.push(tratamiento);
					self.trigger('tratamientoAplicado.odontograma', tratamiento);

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
		var tratamientosAplicadosAlDiente = arrayFilter(tratamientosAplicados, function(t){
			return t.diente.id == diente.id;
		});

		for (var i = tratamientosAplicadosAlDiente.length - 1; i >= 0; i--) {
			var t = tratamientosAplicadosAlDiente[i];
			caras[t.cara].attr('fill', 'red');
		};
	};

	function renderSvg(){
		var svg = self.svg('get').clear();
		var parentGroup = svg.group({transform: 'scale('+settings.scale.toString()+')'});		
		for (var i =  dientes.length - 1; i >= 0; i--) {
			drawDiente(svg, parentGroup, dientes[i]);
		};
	}

	var defaults = {
		width: '620px',
		height: '250px',
		scale: 1.5
	};    	

	var settings;

	var tratamientoSeleccionado;
	var tratamientosAplicados = [];

	var self;

  var methods = {
    init : function( options ) { 
	    settings = $.extend(defaults, options);
      	return this.each(function(){
      		//Init the SVG object
      		self = $(this);
  			self.svg({
  				settings:{
  					width: settings.width,
  					height: settings.height
  				}
  			});

			renderSvg();
   		});      
    },
    setTratamiento: function(tratamiento){
    	tratamientoSeleccionado = tratamiento;	
    },
    removeTratamiento : function(tratamiento) {
      	tratamientosAplicados = arrayFilter(tratamientosAplicados, function(t){
      		return !(t.cara == tratamiento.cara 
      			&& t.diente.id == tratamiento.diente.id
      			&& t.tratamiento.id == tratamiento.tratamiento.id);
      	});
    	renderSvg();
    }
  };

  $.fn.odontograma = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.odontograma' );
    }      
  };

})( jQuery );
