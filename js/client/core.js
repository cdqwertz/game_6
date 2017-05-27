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

var mouse_pressed = [0, 0, 0, 0];

// tile w/h
var w = 16;
var h = 12;

// tiles
var tiles = [[], [], []];

function register_tile(layer, src) {
	tiles[layer].push(new Image());
	tiles[layer][tiles[layer].length-1].src = src;
};

var selection_img = new Image();
selection_img.src = "img/selection.png";

// register tiles (layer 0)
register_tile(0, "img/water.png");
register_tile(0, "img/grass.png");
register_tile(0, "img/snow.png");

register_tile(1, "img/city.png");
register_tile(1, "img/city.png");

var available_matches = [];

// font
var font_1 = new font("img/font.png", ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".",
 																			"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
																			"L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
																			"W", "X", "Y", "Z"], 5, 7);

var my_match = new match();

var LOGIN = 0;
var SELECT_MATCH = 1;
var WAIT = 2;
var PLAY = 3;

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

	if(game_state == PLAY) {
		if(my_match) {
			my_match.draw();
		} else {
			console.log("ERROR");
		}
	} else if (game_state == SELECT_MATCH) {
		font_1.text_align = CENTER;
		font_1.draw_text("SELECT MATCH", canvas.width/2, 5);

	 	for (var i = 0; i < available_matches.length; i++) {
			font_1.text_align = CENTER;
	 		font_1.draw_text(available_matches[i], canvas.width/2, i * (font_1.h + 2) + 16);
	 	}
	} else if (game_state == LOGIN) {

	} else if (game_state == WAIT) {
		font_1.draw_text("WAITING FOR OTHER PLAYERS", canvas.width/2, 5);
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
			if(x+i >= 0 && x+i < my_match.map[0].length) {
				if (my_match.map[1][x+i][y] != -1) {
					moveTo(center_x, center_y);
					lineTo(center_x+(w/2)*i, center_y);
				}
			}
		}

		for (var j = -1; j <= 1; j++) {
			if(y+j >= 0 && y+j < my_match.map[0].length) {
				if (my_match.map[1][x][y+j] != -1) {
					moveTo(center_x, center_y);
					lineTo(center_x, center_y+(h/2)*j);
				}
			}
		}

		stroke();
	}
}

function set_game_state(s) {
	game_state = s;
}

document.onmousedown = function(event) {
	mouse_pressed[event.which] = true;

	var x = event.pageX / (window.innerWidth/canvas.width);
	var y = event.pageY / ((window.innerWidth * (9 / 16))/canvas.height);

	if (game_state == PLAY) {
		var x_1 = x - my_match.viewport.x;
		var y_1 = y - my_match.viewport.y;

		if(event.which == 1) {
			my_match.selection.x = Math.floor(x_1/w);
			my_match.selection.y = Math.floor(y_1/h);

			socket.emit("build", {
				x : my_match.selection.x,
				y : my_match.selection.y,
				tile : my_match.selected_tile
			})
		}
	} else if (game_state == SELECT_MATCH) {
		console.log("join/new match");
		socket.emit("match", {action : 2});
	}
};

document.onmousemove = function(event) {
	var x = event.pageX / (window.innerWidth/canvas.width);
	var y = event.pageY / ((window.innerWidth * (9 / 16))/canvas.height);

	if (game_state == PLAY) {
		var x_1 = x - my_match.viewport.x;
		var y_1 = y - my_match.viewport.y;

		my_match.selection.x = Math.floor(x_1/w);
		my_match.selection.y = Math.floor(y_1/h);

		if(mouse_pressed[2]) {
			my_match.viewport.x += x - my_match.selection.start.x;
			my_match.viewport.y += y - my_match.selection.start.y;
		}

		my_match.selection.start.x = x;
		my_match.selection.start.y = y;
	}
};

document.onmouseup = function(event) {
	mouse_pressed[event.which] = false;

	var x = event.pageX / (window.innerWidth/canvas.width);
	var y = event.pageY / ((window.innerWidth * (9 / 16))/canvas.height);

	if (game_state == PLAY) {
		my_match.selection.start.x = x;
		my_match.selection.start.y = y;
	}
};

document.oncontextmenu = function(event) {
	event.preventDefault();

	var x = event.pageX / (window.innerWidth/canvas.width);
	var y = event.pageY / ((window.innerWidth * (9 / 16))/canvas.height);

	if (game_state == PLAY) {
		my_match.selected_tile += 1;

		if(my_match.selected_tile > 2) {
			my_match.selected_tile = 1;
		}
	}
}
