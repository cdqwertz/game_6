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

function match() {
	this.selection = {
		x : 0,
		y : 0,

		start : {
			x : 0,
			y : 0
		}
	};

	// map
	this.map = [];

	// resources
	this.resources = {
		gold : 0,
		research : 0
	};

	// viewport
	this.viewport = {
		x : 0,
		y : 0
	};

	this.selected_tile = 1;

	this.draw = function () {
		ctx.translate(Math.floor(this.viewport.x), Math.floor(this.viewport.y));
		for (var i = 0; i < this.map.length; i++) {
			var layer = this.map[i];
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
		ctx.drawImage(selection_img, this.selection.x*w, this.selection.y*h);

		if(this.selection.x >= 0 && this.selection.x < this.map[0].length && this.selection.y >= 0 && this.selection.y < this.map[0].length) {
			if (this.selected_tile == 2) {
				draw_path(this.selection.x, this.selection.y);
			} else {
				ctx.drawImage(tiles[1][this.selected_tile], this.selection.x*w, this.selection.y*h-4);
			}
		}

		ctx.translate(-Math.floor(this.viewport.x), -Math.floor(this.viewport.y));

		ctx.globalAlpha = 1;
		font_1.text_align = RIGHT;
		font_1.draw_text(this.resources.gold.toString(), canvas.width-2, 2);
		font_1.draw_text(this.resources.research.toString(), canvas.width-2, 4+font_1.h);
	}
}
