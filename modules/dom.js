// dom.js v0.1 part of the Application Frame

$('system').export({
	dom : {
		select : function(query){
			return $$.document.querySelector(query);
		},
		selectAll : function(query){
			return $$.document.querySelectorAll(query);
		},
		append : function(element, target){
			return target.appendChild(element);    
		},
		create : function(elementName){
			return $$.document.createElement(elementName);
		},
		entryPoint : function(entryPoint){
			return {
				select : function(query){
					return entryPoint.querySelector(query);
				},
				selectAll : function(query){
					return entryPoint.querySelectorAll(query);
				}
			};
		}
	}
});
