
/**
* List 
*
* @class List
* @constructor
* @param {String} id
* @param {Array} values
* @param {Object} options
*/
export function List( id, items, options )
{
	options = options || {};

	var root = this.root = document.createElement("ul");
	root.id = id;
	root.className = "litelist";
	this.items = [];
	var that = this;

	this.callback = options.callback;

	//walk over every item in the list
	for(var i in items)
	{
		var item = document.createElement("li");
		item.className = "list-item";
		item.data = items[i];
		item.dataset["value"] = items[i];

		var content = "";
		if(typeof(items[i]) == "string")
			content = items[i] + "<span class='arrow'></span>";
		else
		{
			content = (items[i].name || items[i].title || "") + "<span class='arrow'></span>";
			if(items[i].id)
				item.id = items[i].id;
		}
		item.innerHTML = content;

		item.addEventListener("click", function() {

			var list = root.querySelectorAll(".list-item.selected");
			for(var j = 0; j < list.length; ++j)
				list[j].classList.remove("selected");
			this.classList.add("selected");
			LiteGUI.trigger( that.root, "wchanged", this );
			if(that.callback)
				that.callback( this.data  );
		});

		root.appendChild(item);
	}


	if(options.parent)
	{
		if(options.parent.root)
			options.parent.root.appendChild( root );
		else
			options.parent.appendChild( root );
	}
}

List.prototype.getSelectedItem = function()
{
	return this.root.querySelector(".list-item.selected");
}

List.prototype.setSelectedItem = function( name )
{
	var items = this.root.querySelectorAll(".list-item");
	for(var i = 0; i < items.length; i++)
	{
		var item = items[i];
		if(item.data == name)
		{
			LiteGUI.trigger( item, "click" );
			break;
		}
	}
}