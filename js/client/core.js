/*

# License for Code

The MIT License (MIT)

Copyright (c) 2017 cd2 (cdqwertz) <cdqwertz@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.

*/

var canvas;
var ctx;
var last_time = 0;
var game_state = 0;
var socket = io();

// map
var map = [];

// resources
var resources = {
	gold : 0,
	research : 0
};

// tile w/h
var w = 16;
var h = 12;

// tiles
var tiles = [[], [], []];

function register_tile(layer, src) {
	tiles[layer].push(new Image());
	tiles[layer][tiles[layer].length-1].src = src;
};

// register tiles (layer 0)
register_tile(0, "img/water.png");
register_tile(0, "img/grass.png");
register_tile(0, "img/snow.png");

register_tile(1, "img/city.png");
register_tile(1, "img/city.png");

// selection
var selection = {
	x : 0,
	y : 0
};

var selection_img = new Image();
selection_img.src = "img/selection.png";

// font
var font_1 = new font("img/font.png", ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], 5, 7);

function load() {
	canvas = document.getElementById("canvas");
	canvas.width = 320;
	canvas.height = 180;
	ctx = canvas.getContext("2d");

	var my_name = prompt("Nickname:");

	socket.emit("name", {
		name : my_name
	})

	window.requestAnimationFrame(update);
}

function update(t) {
	var dtime = t - last_time;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	if(game_state == 2) {
		for (var i = 0; i < map.length; i++) {
			var layer = map[i];
			for (var j = 0; j < layer.length; j++) {
				var row = layer[j];
				for (var k = 0; k < row.length; k++) {
					var tile = row[k];
					if(tile != -1) {
						if(i == 0) {
							ctx.drawImage(tiles[i][tile], j * w, k * h);
						} else {
							if (tile == 2) {
								draw_path(j, k);
							} else if(tiles[i][tile]) {
								ctx.drawImage(tiles[i][tile], j * w, k * h-4);
							} else {
								console.log("Could not find tile " + tile);
							}
						}
					}
				}
			}
		}

		ctx.globalAlpha = 0.7;
		ctx.drawImage(selection_img, selection.x*w, selection.y*h);

		ctx.globalAlpha = 1;
		font_1.text_align = RIGHT;
		font_1.draw_text(resources.gold.toString(), canvas.width-2, 2);
		font_1.draw_text(resources.research.toString(), canvas.width-2, 4+font_1.h);
	}

	last_time = t;
	window.requestAnimationFrame(update);
}

function draw_path (x, y) {
	var center_x = x*w+w/2;
	var center_y = y*h+h/2-2;

	with(ctx) {
		lineWidth = 2;
		strokeStyle = "#4e3b33";
		beginPath();

		for (var i = -1; i <= 1; i++) {
			if(x+i >= 0 && x+i < map[0].length) {
				if (map[1][x+i][y] != -1) {
					moveTo(center_x, center_y);
					lineTo(center_x+(w/2)*i, center_y);
				}
			}
		}

		for (var j = -1; j <= 1; j++) {
			if(y+j >= 0 && y+j < map[0].length) {
				if (map[1][x][y+j] != -1) {
					moveTo(center_x, center_y);
					lineTo(center_x, center_y+(h/2)*j);
				}
			}
		}

		stroke();
	}
}

socket.on("ok", function (data) {
	if(game_state == 0) {
		if(data.id == 1) {
			set_game_state(1);
			console.log("new match");
			socket.emit("match", {action : 2});
		}
	}
});

socket.on("set_tile", function (data) {
	map[data.layer][data.x][data.y] = data.tile;
});

socket.on("start_match", function(data) {
	console.log("start_match");
	game_state = 2;

	map = [];
	for (var i = 0; i < 3; i++) {
		var layer = [];
		for (var j = 0; j < 16; j++) {
			var row = [];
			for (var k = 0; k < 16; k++) {
				row.push(-1);
			}
			layer.push(row);
		}
		map.push(layer);
	}

	resources = {
		gold : 0,
		research : 0
	};
});

socket.on("resource", function (data) {
	if (typeof data.resource != "string") {
		return;
	}

	if (typeof data.amount != "number") {
		return;
	}

	if(data.resource == "gold") {
		resources.gold = data.amount;
	} else if (data.resource == "research") {
		resources.research = data.amount;
	}
})

function set_game_state(s) {
	game_state = s;
}

document.onmousedown = function(event) {
	var x = event.pageX / (window.innerWidth/canvas.width);
	var y = event.pageY / ((window.innerWidth * (9 / 16))/canvas.height);

	selection.x = Math.floor(x/w);
	selection.y = Math.floor(y/h);

	socket.emit("build", {
		x : selection.x,
		y : selection.y,
		tile : 2
	})
};

document.onmousemove = function(event) {
	var x = event.pageX / (window.innerWidth/canvas.width);
	var y = event.pageY / ((window.innerWidth * (9 / 16))/canvas.height);

	selection.x = Math.floor(x/w);
	selection.y = Math.floor(y/h);
};

document.onmouseup = function(event) {

};
