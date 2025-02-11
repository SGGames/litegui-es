/**
* SearchBox
*
* @class SearchBox
* @constructor
* @param {*} value
* @param {Object} options
*/
export class SearchBox {
	constructor(value, options) {
		options = options || {};
		value = value || "";
		var element = document.createElement("div");
		element.className = "litegui searchbox";
		var placeholder = (options.placeholder != null ? options.placeholder : "Search");
		element.innerHTML = "<input value='" + value + "' placeholder='" + placeholder + "'/>";
		this.input = element.querySelector("input");
		this.root = element;
		var that = this;

		this.input.onchange = function (e) {
			var value = e.target.value;
			if (options.callback)
				options.callback.call(that, value);
		};
	}
	setValue(v) { this.input.value = v; this.input.onchange(); }
	getValue() { return this.input.value; }
}

