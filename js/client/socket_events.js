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

socket.on("ok", function (data) {
	if(game_state == LOGIN) {
		if(data.id == 1) {
			set_game_state(SELECT_MATCH);
		}
	} else if (game_state == SELECT_MATCH) {
		if(data.id == 2) {
			game_state = WAIT;
		}
	}
});

socket.on("denied", function (data) {
	if(game_state == LOGIN) {
		if(data.id == 1) {
			alert("Invalid name");
		}
	} else if (game_state == SELECT_MATCH) {
		if(data.id == 2) {
			alert("Cannot join game.");
		}
	}
});

socket.on("set_tile", function (data) {
	my_match.map[data.layer][data.x][data.y] = data.tile;
});

socket.on("start_match", function(data) {
	console.log("start_match");
	game_state = PLAY;

	my_match.map = [];
	for (var i = 0; i < 3; i++) {
		var layer = [];
		for (var j = 0; j < 16; j++) {
			var row = [];
			for (var k = 0; k < 16; k++) {
				row.push(-1);
			}
			layer.push(row);
		}
		my_match.map.push(layer);
	}

	if (typeof data.gold == "number" && typeof data.research == "number") {
		my_match.resources = {
			gold : data.gold,
			research : data.research
		};
	} else {
		my_match.resources = {
			gold : 0,
			research : 0
		};
	}
});

socket.on("resources", function (data) {
	if (typeof data.gold != "number") {
		return;
	}

	if (typeof data.research != "number") {
		return;
	}

	my_match.resources.gold = data.gold;
	my_match.resources.research = data.research;
});

socket.on("available_matches", function (data) {
	available_matches = [];
	for (var i = 0; i < data.matches.length; i++) {
		available_matches.push(data.matches[i]);
	}

	console.log("available_matches: " + JSON.stringify(available_matches));
});
