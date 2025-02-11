import LiteGUI from "../core.js";

/**
* Slider
*
* @class Slider
* @constructor
* @param {Number} value
* @param {Object} options
*/
export class Slider {
	constructor(value, options) {
		options = options || {};
		var root = this.root = document.createElement("div");
		var that = this;
		this.value = value;
		root.className = "liteslider";

		this.setValue = function (value, skip_event) {
			//var width = canvas.getClientRects()[0].width;
			var min = options.min || 0.0;
			var max = options.max || 1.0;
			if (value < min) value = min;
			else if (value > max) value = max;
			var range = max - min;
			var norm = (value - min) / range;
			var percentage = (norm * 100).toFixed(1) + "%";
			var percentage2 = (norm * 100 + 2).toFixed(1) + "%";
			root.style.background = "linear-gradient(to right, #999 " + percentage + ", #FC0 " + percentage2 + ", #333 " + percentage2 + ")";

			if (value != this.value) {
				this.value = value;
				if (!skip_event) {
					LiteGUI.trigger(this.root, "change", value);
					if (this.onChange)
						this.onChange(value);
				}
			}
		};

		function setFromX(x) {
			var rect = root.getBoundingClientRect();
			if (!rect)
				return;
			var width = rect.width;
			var norm = x / width;
			var min = options.min || 0.0;
			var max = options.max || 1.0;
			var range = max - min;
			that.setValue(range * norm + min);
		}

		var doc_binded = null;

		root.addEventListener("mousedown", function (e) {
			var mouseX, mouseY;
			if (e.offsetX) { mouseX = e.offsetX; mouseY = e.offsetY; }
			else if (e.layerX) { mouseX = e.layerX; mouseY = e.layerY; }
			setFromX(mouseX);
			doc_binded = root.ownerDocument;
			doc_binded.addEventListener("mousemove", onMouseMove);
			doc_binded.addEventListener("mouseup", onMouseUp);
			e.preventDefault();
			e.stopPropagation();
		});

		function onMouseMove(e) {
			var rect = root.getBoundingClientRect();
			if (!rect)
				return;
			var x = e.x === undefined ? e.pageX : e.x;
			var mouseX = x - rect.left;
			setFromX(mouseX);
			e.preventDefault();
			return false;
		}

		function onMouseUp(e) {
			var doc = doc_binded || document;
			doc_binded = null;
			doc.removeEventListener("mousemove", onMouseMove);
			doc.removeEventListener("mouseup", onMouseUp);
			e.preventDefault();
			return false;
		}

		this.setValue(value);
	}
}