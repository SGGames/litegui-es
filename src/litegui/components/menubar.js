import LiteGUI from "../core.js";

/************** MENUBAR ************************/
export class Menubar {
	static closing_time = 500;
	
	constructor(id, options = {}) {
		this.menu = [];
		this.panels = [];

		this.root = document.createElement("div");
		this.root.id = id;
		this.root.className = "litemenubar";

		this.content = document.createElement("ul");
		this.root.appendChild(this.content);

		this.is_open = false;
		this.auto_open = options.auto_open || false;
		this.sort_entries = options.sort_entries || false;
	}

	clear() {
		this.content.innerHTML = "";
		this.menu = [];
		this.panels = [];
	}

	attachToPanel(panel) {
		panel.content.insertBefore(this.root, panel.content.firstChild);
	}

	add(path, data = {}) {
		if (typeof data === "function") data = { callback: data };

		const prev_length = this.menu.length;

		const tokens = path.split("/");
		let current_token = 0;
		let current_pos = 0;
		let menu = this.menu;
		let last_item = null;

		while (menu) {
			if (current_token > 5) throw "Error: Menubar too deep";
			// token not found in this menu, create it
			if (menu.length === current_pos) {
				const v = { parent: last_item, children: [] };
				last_item = v;
				if (current_token === tokens.length - 1) v.data = data;

				v.disable = function () {
					if (this.data) this.data.disabled = true;
				};
				v.enable = function () {
					if (this.data) delete this.data.disabled;
				};

				v.name = tokens[current_token];
				menu.push(v);
				current_token++;
				if (current_token === tokens.length) break;
				v.children = [];
				menu = v.children;
				current_pos = 0;
				continue;
			}

			// token found in this menu, get inside for next token
			if (menu[current_pos] && tokens[current_token] === menu[current_pos].name) {
				if (current_token < tokens.length - 1) {
					last_item = menu[current_pos];
					menu = menu[current_pos].children;
					current_pos = 0;
					current_token++;
					continue;
				} else {
					// last token
					console.warn("Warning: Adding menu that already exists: " + path);
					break;
				}
			}
			current_pos++;
		}

		if (prev_length !== this.menu.length) this.updateMenu();
	}

	remove(path) {
		const menu = this.findMenu(path);
		if (!menu) return;
		if (!menu.parent || !menu.parent.children) return console.warn("menu without parent?");

		const index = menu.parent.children.indexOf(menu);
		if (index !== -1) menu.parent.children.splice(index, 1);
	}

	separator(path, order) {
		const menu = this.findMenu(path);
		if (!menu) return;
		menu.children.push({ separator: true, order: order || 10 });
	}

	// returns the menu entry that matches this path
	findMenu(path) {
		const tokens = path.split("/");
		let current_token = 0;
		let current_pos = 0;
		let menu = this.menu;

		while (menu) {
			// no more tokens, return last found menu
			if (current_token === tokens.length) return menu;

			// this menu doesnt have more entries
			if (menu.length <= current_pos) return null;

			if (tokens[current_token] === "*") return menu[current_pos].children;

			// token found in this menu, get inside for next token
			if (tokens[current_token] === menu[current_pos].name) {
				if (current_token === tokens.length - 1) {
					// last token
					return menu[current_pos];
				} else {
					menu = menu[current_pos].children;
					current_pos = 0;
					current_token++;
					continue;
				}
			}

			// check next entry in this menu
			current_pos++;
		}
		return null;
	}

	// update top main menu
	updateMenu() {
		const that = this;

		this.content.innerHTML = "";
		for (const i in this.menu) {
			const element = document.createElement("li");
			element.innerHTML = "<span class='icon'></span><span class='name'>" + this.menu[i].name + "</span>";
			this.content.appendChild(element);
			element.data = this.menu[i];
			this.menu[i].element = element;

			/* ON CLICK TOP MAIN MENU ITEM */
			element.addEventListener("click", function (e) {
				const item = this.data;

				if (item.data && item.data.callback && typeof item.data.callback === "function")
					item.data.callback(item.data);

				if (!that.is_open) {
					that.is_open = true;
					that.showMenu(item, e, this);
				} else {
					that.is_open = false;
					that.hidePanels();
				}
			});

			element.addEventListener("mouseover", function (e) {
				that.hidePanels();
				if (that.is_open || that.auto_open) that.showMenu(this.data, e, this);
			});
		}
	}

	hidePanels() {
		if (!this.panels.length) return;

		for (const i in this.panels) LiteGUI.remove(this.panels[i]);
		this.panels = [];
	}

	// Create the panel with the drop menu
	showMenu(menu, e, root, is_submenu) {
		if (!is_submenu) this.hidePanels();

		if (!menu.children || !menu.children.length) return;

		const that = this;
		if (that.closing_by_leave) clearInterval(that.closing_by_leave);

		const element = document.createElement("div");
		element.className = "litemenubar-panel";

		const sorted_entries = [];
		for (const i in menu.children) sorted_entries.push(menu.children[i]);

		if (this.sort_entries)
			sorted_entries.sort(function (a, b) {
				let a_order = 10;
				let b_order = 10;
				if (a && a.data && a.data.order != null) a_order = a.data.order;
				if (a && a.separator && a.order != null) a_order = a.order;
				if (b && b.data && b.data.order != null) b_order = b.data.order;
				if (b && b.separator && b.order != null) b_order = b.order;
				return a_order - b_order;
			});

		for (const i in sorted_entries) {
			const item = document.createElement("p");
			const menu_item = sorted_entries[i];

			item.className = "litemenu-entry " + (item.children ? " submenu" : "");
			const has_submenu = menu_item.children && menu_item.children.length;

			if (has_submenu) item.classList.add("has_submenu");

			if (menu_item && menu_item.name)
				item.innerHTML =
					"<span class='icon'></span><span class='name'>" +
					menu_item.name +
					(has_submenu ? "<span class='more'>+</span>" : "") +
					"</span>";
			else {
				item.classList.add("separator");
				// item.innerHTML = "<span class='separator'></span>";
			}

			item.data = menu_item;

			// check if it has to show the item being 'checked'
			if (item.data.data) {
				const data = item.data.data;

				const checked =
					(data.type === "checkbox" && data.instance && data.property && data.instance[data.property] === true) ||
					data.checkbox === true ||
					(data.instance && data.property && data.hasOwnProperty("value") && data.instance[data.property] === data.value) ||
					(typeof data.isChecked === "function" && data.isChecked.call(data.instance, data));

				if (checked) item.className += " checked";

				if (data.disabled) item.className += " disabled";
			}

			/* ON CLICK SUBMENU ITEM */
			item.addEventListener("click", function () {
				const item = this.data;
				if (item.data) {
					if (item.data.disabled) return;

					// to change variables directly
					if (item.data.instance && item.data.property) {
						if (item.data.type === "checkbox") {
							item.data.instance[item.data.property] = !item.data.instance[item.data.property];
							if (item.data.instance[item.data.property]) this.classList.add("checked");
							else this.classList.remove("checked");
						} else if (item.data.hasOwnProperty("value")) {
							item.data.instance[item.data.property] = item.data.value;
						}
					}

					// to have a checkbox behaviour
					if (item.data.checkbox != null) {
						item.data.checkbox = !item.data.checkbox;
						if (item.data.checkbox) this.classList.add("checked");
						else this.classList.remove("checked");
					}

					// execute a function
					if (item.data.callback && typeof item.data.callback === "function") item.data.callback(item.data);
				}

				// more menus
				if (item.children && item.children.length) {
					that.showMenu(item, e, this, true);
				} else {
					that.is_open = false;
					that.hidePanels();
				}
			});

			item.addEventListener("mouseenter", function (e) {
				/*
				if( that.auto_open && this.classList.contains("has_submenu") )
					LiteGUI.trigger( this, "click" );
				*/
			});

			element.appendChild(item);
		}

		element.addEventListener("mouseleave", function (e) {
			if (that.closing_by_leave) clearInterval(that.closing_by_leave);

			that.closing_by_leave = setTimeout(function () {
				that.is_open = false;
				that.hidePanels();
			}, LiteGUI.Menubar.closing_time);
		});

		element.addEventListener("mouseenter", function (e) {
			if (that.closing_by_leave) clearInterval(that.closing_by_leave);
			that.closing_by_leave = null;
		});

		// compute X and Y for menu
		const box = root.getBoundingClientRect();
		element.style.left = box.left + (is_submenu ? 200 : 0) + "px";
		element.style.top = box.top + box.height + (is_submenu ? -20 : 10) + "px";
		/* animation, not working well, flickers
		element.style.opacity = "0.1";
		element.style.transform = "translate(0,-10px)";
		element.style.transition = "all 0.2s";
		setTimeout( function(){ 
			element.style.opacity = "1"; 
			element.style.transform = "translate(0,0)";
		},1);
		*/

		this.panels.push(element);
		document.body.appendChild(element);
	}
}
