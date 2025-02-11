
export function Checkbox( value, on_change)
{
	var that = this;
	this.value = value;

	var root = this.root = document.createElement("span");
	root.className = "litecheckbox inputfield";
	root.dataset["value"] = value;

	var element = this.element = document.createElement("span");
	element.className = "fixed flag checkbox "+(value ? "on" : "off");
	root.appendChild( element );
	
	root.addEventListener("click", onClick.bind(this) );

	function onClick(e) {
		this.setValue( this.root.dataset["value"] != "true" );
		e.preventDefault();
		e.stopPropagation();
	}

	this.setValue = function(v)
	{
		if(this.value === v)
			return;

		if( this.root.dataset["value"] == v.toString())
			return;

		this.root.dataset["value"] = v;
		if(v)
		{
			this.element.classList.remove("off");
			this.element.classList.add("on");
		}
		else
		{
			this.element.classList.remove("on");
			this.element.classList.add("off");
		}
		var old_value = this.value;
		this.value = v;

		if(on_change)
			on_change( v, old_value );
	}

	this.getValue = function()
	{
		return this.value;
		//return this.root.dataset["value"] == "true";
	}
}	