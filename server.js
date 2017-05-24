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

const http = require('http');
const fs = require('fs');
const game = require(__dirname + '/js/server/game.js');
var my_game = new game.game();

var files = {
	index : fs.readFileSync("./index.html"),

	css : {
		style : fs.readFileSync("./css/style.css")
	},

	js : {
		core : fs.readFileSync("./js/client/core.js"),
		font : fs.readFileSync("./js/client/font.js")
	},

	img : {
		grass : fs.readFileSync("./img/grass.png"),
		snow : fs.readFileSync("./img/snow.png"),
		water : fs.readFileSync("./img/water.png"),

		city : fs.readFileSync("./img/city.png"),

		selection : fs.readFileSync("./img/selection.png"),
		font : fs.readFileSync("./img/font.png")
	}
};

var my_server = http.createServer(function (req, res) {
	if(req.url == "/") {
		res.writeHead(200);
		res.end(files.index);
	} else if(req.url == "/js/core.js") {
		res.writeHead(200);
		res.end(files.js.core);
	} else if(req.url == "/js/font.js") {
		res.writeHead(200);
		res.end(files.js.font);
	} else if(req.url == "/css/style.css") {
		res.writeHead(200);
		res.end(files.css.style);
	} else if(req.url == "/css/style.css") {
		res.writeHead(200);
		res.end(files.css.style);
	} else if(req.url == "/img/grass.png") {
		res.writeHead(200, {"Content-Type" : "image/png"});
		res.end(files.img.grass);
	} else if(req.url == "/img/water.png") {
		res.writeHead(200, {"Content-Type" : "image/png"});
		res.end(files.img.water);
	} else if(req.url == "/img/snow.png") {
		res.writeHead(200, {"Content-Type" : "image/png"});
		res.end(files.img.snow);
	} else if(req.url == "/img/city.png") {
		res.writeHead(200, {"Content-Type" : "image/png"});
		res.end(files.img.city);
	} else if(req.url == "/img/selection.png") {
		res.writeHead(200, {"Content-Type" : "image/png"});
		res.end(files.img.selection);
	} else if(req.url == "/img/font.png") {
		res.writeHead(200, {"Content-Type" : "image/png"});
		res.end(files.img.font);
	} else {
		res.writeHead(200);
		res.end("<html><body>Error: 404 <br><a href=\"/\">Back</a></body></html>");
	}
});

var io = require("socket.io")(my_server);

io.on("connection", function(socket) {
	console.log("connect");
	var my_player = new game.player("", socket, my_game.get_player_id());

	my_game.join(my_player);

	socket.on("disconnect", function () {
		if(my_player.match) {
			my_player.match.leave(my_player);
			console.log("[info][match] player " + my_player.name + " left");
		}

		my_game.leave(my_player);
		console.log("disconnect");
	});

	socket.on("name", function (data) {
		if(typeof data.name != "string") {
			console.log("[error][name] wrong type");
			return;
		}

		if(my_game.is_name_allowed(data.name)) {
			my_player.name = data.name;

			my_player.socket.emit("ok", {
				id : 1
			});
		}
	});

	socket.on("match", function (data) {
		if(typeof data.action != "number") {
			console.log("[error][match] wrong type (0)");
			return;
		}

		if (data.action == 2) {
			if(my_game.matches.length > 0) {
				data.action = 1;
				data.match = 0;
			} else {
				data.action = 0;
			}
		}

		if(data.action == 0) {
			// new match
			console.log("[info] new match");
			var my_match = new game.match(my_game);
			my_match.join(my_player);
			my_game.add_match(my_match);
			my_match.start();
		} else if (data.action == 1) {
			if(typeof data.match != "number") {
				console.log("[error][match] wrong type (1)");
				return;
			}

			// join match
			console.log("[info] join");
			var my_match = my_game.matches[data.match];
			my_match.join(my_player);

			my_player.socket.emit("start_match", {});
		}
	});

	socket.on("build", function (data) {
		if(typeof data.x != "number") {
			console.log("[error][match] wrong type (0)");
			return;
		}

		if(typeof data.y != "number") {
			console.log("[error][match] wrong type (1)");
			return;
		}

		if(typeof data.tile != "number") {
			console.log("[error][match] wrong type (2)");
			return;
		}

		if(my_player.match) {
			my_player.match.build(my_player, data.x, data.y, data.tile);
		}
	});
})

my_server.listen(8080);
