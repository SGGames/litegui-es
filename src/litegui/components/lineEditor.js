import LiteGUI from "../core.js";
/**
* LineEditor 
*
* @class LineEditor
* @constructor
* @param {Number} value
* @param {Object} options
*/

export function LineEditor(value, options)
{
	options = options || {};
	var element = document.createElement("div");
	element.className = "curve " + (options.extraclass ? options.extraclass : "");
	element.style.minHeight = "50px";
	element.style.width = options.width || "100%";

	element.bgcolor = options.bgcolor || "#222";
	element.pointscolor = options.pointscolor || "#5AF";
	element.linecolor = options.linecolor || "#444";

	element.value = value || [];
	element.xrange = options.xrange || [0,1]; //min,max
	element.yrange = options.yrange || [0,1]; //min,max
	element.defaulty = options.defaulty != null ? options.defaulty : 0.5;
	element.no_trespassing = options.no_trespassing || false;
	element.show_samples = options.show_samples || 0;
	element.options = options;
	element.style.minWidth = "50px";
	element.style.minHeight = "20px";

	var canvas = document.createElement("canvas");
	canvas.width = options.width || 200;
	canvas.height = options.height || 50;
	element.appendChild( canvas );
	element.canvas = canvas;

	element.addEventListener("mousedown",onmousedown);

	element.getValueAt = function(x)
	{
		if(x < element.xrange[0] || x > element.xrange[1])
			return element.defaulty;

		var last = [ element.xrange[0], element.defaulty ];
		var f = 0;
		for(var i = 0; i < element.value.length; i += 1)
		{
			var v = element.value[i];
			if(x == v[0]) return v[1];
			if(x < v[0])
			{
				f = (x - last[0]) / (v[0] - last[0]);
				return last[1] * (1-f) + v[1] * f;
			}
			last = v;
		}

		v = [ element.xrange[1], element.defaulty ];
		f = (x - last[0]) / (v[0] - last[0]);
		return last[1] * (1-f) + v[1] * f;
	}

	element.resample = function(samples)
	{
		var r = [];
		var dx = (element.xrange[1] - element.xrange[0]) / samples;
		for(var i = element.xrange[0]; i <= element.xrange[1]; i += dx)
		{
			r.push( element.getValueAt(i) );
		}
		return r;
	}

	element.addValue = function(v)
	{
		for(var i = 0; i < element.value; i++)
		{
			var value = element.value[i];
			if(value[0] < v[0]) continue;
			element.value.splice(i,0,v);
			redraw();
			return;
		}

		element.value.push(v);
		redraw();
	}

	//value to canvas
	function convert(v)
	{
		return [ canvas.width * ( (element.xrange[1] - element.xrange[0]) * v[0] + element.xrange[0]),
			canvas.height * ((element.yrange[1] - element.yrange[0]) * v[1] + element.yrange[0])];
	}

	//canvas to value
	function unconvert(v)
	{
		return [(v[0] / canvas.width - element.xrange[0]) / (element.xrange[1] - element.xrange[0]),
				(v[1] / canvas.height - element.yrange[0]) / (element.yrange[1] - element.yrange[0])];
	}

	var selected = -1;

	element.redraw = function()
	{
		var rect = canvas.parentNode.getBoundingClientRect();
		if(rect && canvas.width != rect.width && rect.width && rect.width < 1000)
			canvas.width = rect.width;
		if(rect && canvas.height != rect.height && rect.height && rect.height < 1000)
			canvas.height = rect.height;

		var ctx = canvas.getContext("2d");
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.translate(0,canvas.height);
		ctx.scale(1,-1);

		ctx.fillStyle = element.bgcolor;
		ctx.fillRect(0,0,canvas.width,canvas.height);

		ctx.strokeStyle = element.linecolor;
		ctx.beginPath();

		//draw line
		var pos = convert([element.xrange[0],element.defaulty]);
		ctx.moveTo( pos[0], pos[1] );

		for(var i in element.value)
		{
			var value = element.value[i];
			pos = convert(value);
			ctx.lineTo( pos[0], pos[1] );
		}

		pos = convert([element.xrange[1],element.defaulty]);
		ctx.lineTo( pos[0], pos[1] );
		ctx.stroke();

		//draw points
		for(var i = 0; i < element.value.length; i += 1)
		{
			var value = element.value[i];
			pos = convert(value);
			if(selected == i)
				ctx.fillStyle = "white";
			else
				ctx.fillStyle = element.pointscolor;
			ctx.beginPath();
			ctx.arc( pos[0], pos[1], selected == i ? 4 : 2, 0, Math.PI * 2);
			ctx.fill();
		}

		if(element.show_samples)
		{
			var samples = element.resample(element.show_samples);
			ctx.fillStyle = "#888";
			for(var i = 0; i < samples.length; i += 1)
			{
				var value = [ i * ((element.xrange[1] - element.xrange[0]) / element.show_samples) + element.xrange[0], samples[i] ];
				pos = convert(value);
				ctx.beginPath();
				ctx.arc( pos[0], pos[1], 2, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}

	var last_mouse = [0,0];
	function onmousedown(evt)
	{
		document.addEventListener("mousemove",onmousemove);
		document.addEventListener("mouseup",onmouseup);

		var rect = canvas.getBoundingClientRect();
		var mousex = evt.clientX - rect.left;
		var mousey = evt.clientY - rect.top;

		selected = computeSelected(mousex,canvas.height-mousey);

		if(selected == -1)
		{
			var v = unconvert([mousex,canvas.height-mousey]);
			element.value.push(v);
			sortValues();
			selected = element.value.indexOf(v);
		}

		last_mouse = [mousex,mousey];
		element.redraw();
		evt.preventDefault();
		evt.stopPropagation();
	}

	function onmousemove(evt)
	{
		var rect = canvas.getBoundingClientRect();
		var mousex = evt.clientX - rect.left;
		var mousey = evt.clientY - rect.top;

		if(mousex < 0) mousex = 0;
		else if(mousex > canvas.width) mousex = canvas.width;
		if(mousey < 0) mousey = 0;
		else if(mousey > canvas.height) mousey = canvas.height;

		//dragging to remove
		if( selected != -1 && distance( [evt.clientX - rect.left, evt.clientY - rect.top], [mousex,mousey] ) > canvas.height * 0.5 )
		{
			element.value.splice(selected,1);
			onmouseup(evt);
			return;
		}

		var dx = last_mouse[0] - mousex;
		var dy = last_mouse[1] - mousey;
		var delta = unconvert([-dx,dy]);
		if(selected != -1)
		{
			var minx = element.xrange[0];
			var maxx = element.xrange[1];

			if(element.no_trespassing)
			{
				if(selected > 0) minx = element.value[selected-1][0];
				if(selected < (element.value.length-1) ) maxx = element.value[selected+1][0];
			}

			var v = element.value[selected];
			v[0] += delta[0];
			v[1] += delta[1];
			if(v[0] < minx) v[0] = minx;
			else if(v[0] > maxx) v[0] = maxx;
			if(v[1] < element.yrange[0]) v[1] = element.yrange[0];
			else if(v[1] > element.yrange[1]) v[1] = element.yrange[1];
		}

		sortValues();
		element.redraw();
		last_mouse[0] = mousex;
		last_mouse[1] = mousey;
		onchange();

		evt.preventDefault();
		evt.stopPropagation();
	}

	function onmouseup(evt)
	{
		selected = -1;
		element.redraw();
		document.removeEventListener("mousemove",onmousemove);
		document.removeEventListener("mouseup",onmouseup);
		onchange();
		evt.preventDefault();
		evt.stopPropagation();
	}

	function onresize(e)
	{
		element.redraw();
	}
	
	function onchange()
	{
		if(options.callback)
			options.callback.call(element,element.value);
		else
			LiteGUI.trigger(element,"change");
	}

	function distance(a,b) { return Math.sqrt( Math.pow(b[0]-a[0],2) + Math.pow(b[1]-a[1],2) ); };

	function computeSelected(x,y)
	{
		var min_dist = 100000;
		var max_dist = 8; //pixels
		var selected = -1;
		for(var i=0; i < element.value.length; i++)
		{
			var value = element.value[i];
			var pos = convert(value);
			var dist = distance([x,y],pos);
			if(dist < min_dist && dist < max_dist)
			{
				min_dist = dist;
				selected = i;
			}
		}
		return selected;
	}

	function sortValues()
	{
		var v = null;
		if(selected != -1)
			v = element.value[selected];
		element.value.sort(function(a,b) { return a[0] - b[0]; });
		if(v)
			selected = element.value.indexOf(v);
	}
	
	element.redraw();
	return element;
}