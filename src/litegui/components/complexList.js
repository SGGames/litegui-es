import LiteGUI from "../core.js";

export class ComplexList {
	constructor(options) {
		options = options || {};

		this.root = document.createElement("div");
		this.root.className = "litecomplexlist";

		this.item_code = options.item_code || "<div class='listitem'><span class='tick'><span>" + LiteGUI.special_codes.tick + "</span></span><span class='title'></span><button class='trash'>" + LiteGUI.special_codes.close + "</button></div>";

		if (options.height)
			this.root.style.height = LiteGUI.sizeToCSS(options.height);

		this.selected = null;
		this.onItemSelected = null;
		this.onItemToggled = null;
		this.onItemRemoved = null;
	}
	addTitle(text) {
		var elem = LiteGUI.createElement("div", ".listtitle", text);
		this.root.appendChild(elem);
		return elem;
	}
	addHTML(html, on_click) {
		var elem = LiteGUI.createElement("div", ".listtext", html);
		if (on_click)
			elem.addEventListener("mousedown", on_click);
		this.root.appendChild(elem);
		return elem;
	}
	clear() {
		this.root.innerHTML = "";
	}
	addItem(item, text, is_enabled, can_be_removed) {
		var title = text || item.content || item.name;
		var elem = LiteGUI.createListItem(this.item_code, { ".title": title });
		elem.item = item;

		if (is_enabled)
			elem.classList.add("enabled");

		if (!can_be_removed)
			elem.querySelector(".trash").style.display = "none";

		var that = this;
		elem.addEventListener("mousedown", function (e) {
			e.preventDefault();
			this.setSelected(true);
			if (that.onItemSelected)
				that.onItemSelected(item, elem);
		});
		elem.querySelector(".tick").addEventListener("mousedown", function (e) {
			e.preventDefault();
			elem.classList.toggle("enabled");
			if (that.onItemToggled)
				that.onItemToggled(item, elem, elem.classList.contains("enabled"));
		});

		elem.querySelector(".trash").addEventListener("mousedown", function (e) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			if (that.onItemRemoved)
				that.onItemRemoved(item, elem);
		});

		elem.setContent = function (v, is_html) {
			if (is_html)
				elem.querySelector(".title").innerHTML = v;

			else
				elem.querySelector(".title").innerText = v;
		};

		elem.toggleEnabled = function (v) {
			elem.classList.toggle("enabled");
		};

		elem.setSelected = function (v) {
			LiteGUI.removeClass(that.root, "selected");
			if (v)
				this.classList.add("selected");

			else
				this.classList.remove("selected");
			that.selected = elem.item;
		};

		elem.show = function () { this.style.display = ""; };
		elem.hide = function () { this.style.display = "none"; };

		this.root.appendChild(elem);
		return elem;
	}
}




