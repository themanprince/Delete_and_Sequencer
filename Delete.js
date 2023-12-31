(function(win) {
	const global = win, doc = win.document;
	
	class GetOrMakeDOM {
		constructor(params, context) {
				
			let currContext = doc;
			if(context) {
				//a context arg was passed
				if(context.nodeType) //its a DOM node
					currContext = context;
				else //its a selector string
					currContext = doc.querySelector(context);
			}
			
			//next is making nodelist out of params arg
			var regXContainsTag = /^\s*<(\w+|!)[^>]*>/;
			switch(true) {
				case /*no params*/ ((!params) || ((typeof params === "string") && (params.trim() === ""))):
					this.length = 0;
					break;
				case /*html tags string*/ ((typeof params === "string") && (regXContainsTag.test(params))):
					const div = currContext.createElement("div");
					const docFrag /*documentFragment*/ = currContext.createDocumentFragment();
					docFrag.appendChild(div);
					const queryDiv = docFrag.querySelector("div");
					queryDiv.innerHTML = params;
					//next, adding all the children of the div to this
					let i = 0, kids = queryDiv.children;
					for(let kid of kids)
						this[i++] = kid;
					this.length = kids.length;
					break;
				case /*single DOM node*/ ((typeof params === "object") && ("nodeName" in params)):
					this[0] = params;
					this.length = 1;
					break;
				default: //its an already-made list or a css selector that should generate a list
					const nodes = (typeof params !== "string")? params : currContext.querySelectorAll(params.trim());
					for(let i = 0; i < nodes.length; i++)
						this[i] = nodes[i];
						
					this.length = nodes.length;
			}
		}
	}
	
	const Delete = function(params, context) {
		return new GetOrMakeDOM(params, context);
	}
	
	global.Delete = Delete; //exposing it to global scope
	Delete.fn = GetOrMakeDOM.prototype;// so that anything added here will auto be added to new instances of GetOrMakeDOM
	//but lemme add the first things
	Delete.fn.each = function(cb) {
		for(let i = 0; i < this.length; i++)
			cb.call(this[i], this[i], i);
		
		//method chaining... return this.. or a value if there was one
		return this;
	}
	
	Delete.fn.html = function(htmlString) {
		//if htmlString is passed, set thr innerHTML of all the DOM nodes to that html string
		//else just return the innerHTML of the first node
		if(htmlString)
			/*using 'return' for method chaining*/return this.each((node) => node.innerHTML = htmlString);
		else
			return this[0].innerHTML;
	};
	
	Delete.fn.text = function(text) {
		//if text is passed, set thr textContent of all the DOM nodes to that text
		//else just return the textContent of the first node
		if(text)
			/*using 'return' for method chaining*/return this.each((node) => node.textContent = text);
		else
			return this[0].textContent;
	};
	
	Delete.fn.append = function(strOrObj) {
		return this.each(function() {
			if(typeof strOrObj === "string") {
				this.insertAdjacentHTML('beforeend', strOrObj);
			} else {
				let THIS = this; //oga 'this'... unneccesary
				Delete(strOrObj).each((node) => {
					this.insertAdjacentHTML('beforeend', node.outerHTML);
				});
			}
		});
	}
	
})(window);