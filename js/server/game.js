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

const tiles = require(__dirname + '/tiles.js');

module.exports = {
	game : function() {
		this.matches = [];
		this.players = [];

		this.join = function(my_player) {
			this.players.push(my_player);
		};

		this.leave = function(my_player) {
			index = -1;

			for (var i = 0; i < this.players.length; i++) {
				var p = this.players[i];

				if (p.id == my_player.id) {
					index = i;
					break;
				}
			}

			if (index == -1) {
				console.log("[error][leave] could not find player " + my_player.id);
				return;
			}

			delete this.players[index].socket;
			this.players.splice(index, 1);
		};

		this.is_name_allowed = function(name) {
			for (var i = 0; i < this.players.length; i++) {
				var p = this.players[i];

				if (p.name == name) {
					return false;
				}
			}

			var r = new RegExp("^[A-z_]+$");
			return r.test(name);
		};

		this.add_match = function (my_match) {
			this.matches.push(my_match);
		};

		this.remove_match = function (my_match) {
			for (var i = 0; i < this.matches.length; i++) {
				if(this.matches[i] == my_match) {
					this.matches.splice(i);
					return;
				}
			}
		};

		this.get_player_id = function() {
			var used_ids = [];

			for (var i = 0; i < this.players.length; i++) {
				var p = this.players[i];

				while (used_ids.length < p.id+1) {
					used_ids.push(0);
				}

				used_ids[p.id] = 1;

				return used_ids.indexOf(0);
			}

			used_ids.push(0);
		};
	},

	match : function(my_game) {
		this.game = my_game;
		this.players = [];
		this.map = [];
		this.timer = 0;
		this.interval = null;
		this.meta = [];

		this.join = function(my_player) {
			my_player.match = this;
			this.players.push(my_player);
		};

		this.leave = function(my_player) {
			var index = 0;
			for (var i = 0; i < this.players.length; i++) {
				var p = this.players[i];

				if (p.id == my_player.id) {
					index = i;
					break;
				}
			}

			this.players.splice(index, 1);
			my_player.match = null;

			if(this.players.length < 1) {
				console.log("[info][match] no players");

				if(this.interval) {
					clearInterval(this.interval);
				}

				this.game.remove_match(this);
			}
		};

		this.generate_map = function() {
			this.map = [];
			for (var i = 0; i < 3; i++) {
				var layer = [];
				for (var j = 0; j < 16; j++) {
					var row = [];
					for (var k = 0; k < 16; k++) {
						if(i == 0) {
							row.push(Math.floor(Math.random() * 3));
						} else {
							row.push(-1)
						}
					}
					layer.push(row);
				}
				this.map.push(layer);
			}
		};

		this.update = function() {
			this.timer++;

			if(this.timer >= 5) {
				for (var i = 0; i < this.players.length; i++) {
					var x = Math.floor(Math.random()*16);
					var y = Math.floor(Math.random()*16);
				}

				this.timer = 0;
			}
		};

		this.start = function() {
			this.generate_map();
			this.meta = [];

			for (var i = 0; i < this.players.length; i++) {
				var x = Math.floor(Math.random()*16);
				var y = Math.floor(Math.random()*16);

				this.players[i].spawn_pos = {
					x : x,
					y : y
				};

				this.map[1][x][y] = tiles.city;
				this.set_meta(x, y, {
					player: i,
					level : 1
				});

				this.players[i].socket.emit("start_match", {});

				this.explore(this.players[i], x, y);
			}

			this.interval = setInterval(() => {
				this.update();
			}, 1000);
		};

		this.get_meta = function (x, y) {
			return this.meta[y*this.map.length+x];
		};

		this.set_meta = function (x, y, data) {
			this.meta[y*this.map.length+x] = data;
		};

		this.build = function (player, x, y, tile) {
			if(!this.is_on_map(x,y)) {
				console.log("[error][match] is not on map " + x + ", " + y);
				return;
			}

			this.map[1][x][y] = tile;

			for (var i = 0; i < this.players.length; i++) {
				var p = this.players[i];
				this.explore(p, x, y);
			}
		};

		this.explore = function(player, x, y) {
			for (var j = -1; j <= 1; j++) {
				for (var k = -1; k <= 1; k++) {
					if (x+j >= 0 && x+j < this.map[0].length && y+k >= 0 && y+k < this.map[0].length) {
						this.send_tile(player, x+j, y+k);
					}
				}
			}
		};

		this.is_on_map = function(x, y) {
			return x >= 0 && x < this.map[0].length && y >= 0 && y < this.map[0].length;
		};

		this.send_tile = function (player, x, y) {
			player.socket.emit("set_tile", {
				x : x,
				y : y,
				layer : 0,
				tile: this.map[0][x][y]
			});

			player.socket.emit("set_tile", {
				x : x,
				y : y,
				layer : 1,
				tile: this.map[1][x][y]
			});

			player.socket.emit("set_tile", {
				x : x,
				y : y,
				layer : 2,
				tile: this.map[2][x][y]
			});
		}
	},

	player : function (name, socket, id) {
		this.name = name;
		this.socket = socket;
		this.id = id;
		this.match = null;
		this.spawn_pos = {
			x : -1,
			y : -1
		};
	}
};
