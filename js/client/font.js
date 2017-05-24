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

var LEFT = 0;
var RIGHT = 1;

function font(src, layout, w, h) {
	this.img = new Image();
	this.img.src = src;
	this.layout = layout;
	this.w = w;
	this.h = h;

	this.text_align = 0;

	this.draw_text = function (text, pos_x, pos_y) {
		for(var i = 0; i < text.length; i++) {
			var char = text.charAt(i);
			var index = this.layout.indexOf(char);
			var x = index * this.w;

			if(this.text_align == LEFT) {
				ctx.drawImage(this.img, x, 0, this.w, this.h, pos_x + (i*(this.w + 1)), pos_y, this.w, this.h);
			} else {
				ctx.drawImage(this.img, x, 0, this.w, this.h, pos_x - (i*(this.w + 1))-this.w, pos_y, this.w, this.h);
			}
		}
	};
}
