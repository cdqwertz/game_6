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
		}

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

		this.join = function(my_player) {
			this.players.push(my_player);
		};

		this.generate_map = function() {
			this.map = [];
			for (var i = 0; i < 3; i++) {
				var layer = [];
				for (var j = 0; j < 16; j++) {
					var row = [];
					for (var k = 0; k < 16; k++) {
						row.push(Math.floor(Math.random() * 3));
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
					this.players[i].socket.emit("set_tile", {
						x : x,
						y : y,
						layer : 0,
						tile: this.map[0][x][y]
					})
				}

				this.timer = 0;
			}
		};

		this.start = function() {
			this.generate_map();

			for (var i = 0; i < this.players.length; i++) {
				this.players[i].socket.emit("start_match", {});
			}

			setInterval(() => {
				this.update();
			}, 1000);
		};
	},

	player : function (name, socket, id) {
		this.name = name;
		this.socket = socket;
		this.id = id;
	}
};
