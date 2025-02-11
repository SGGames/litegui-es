export function Button( value, options )
{
	options = options || {};

	if(typeof(options) === "function")
		options = { callback: options };

	var that = this;
	var element = document.createElement("div");
	element.className = "litegui button";

	this.root = element;
	var button = document.createElement("button");
	button.className = "litebutton";
	this.content = button;
	element.appendChild(button);

	button.innerHTML = value;		
	button.addEventListener("click", function(e) { 
		that.click();
	});

	this.click = function()
	{
		if(options.callback)
			options.callback.call(that);
	}
}