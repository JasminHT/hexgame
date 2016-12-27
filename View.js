
//takes two vectors. One to its position, another from there to its opposite corner
function Rect(position,size) {
    this.position = position;
    this.size = size;
}

//The View is a coordinate transformation tool
//World coordinates are given to it as 'points' and it returns the coordinates on the screen (output rect)

function View (input_rect,output_rect) {

    //PRIVATE MMEMBERS

    var input = input_rect;
    var output = output_rect;

    //PRIVILEGED FUNCTIOONS

    this.getInputRect = function() {
        return input;
    }
    this.getOutputRect = function() {
        return output;
    }
    this.getCenter = function() {
        var x = input.position.x + input.size.x/2;
        var y = input.position.y + input.size.y/2;
        return new Point(x,y);
    }
    this.setCenter = function(point) {
        input.position.x = point.x-input.size.x/2;
        input.position.y = point.y-input.size.y/2;
    }

    this.resizeOutput = function(width,height) {

      //create the new view in the same position
      var view_out = new Rect(    new Point(0,0), new Point(width,height));
      var view_in = input;

      //match the aspect ratio to the new size
      var resizing_ratio = new Point( output.size.x/width, output.size.y/height);
      view_in.size.x = view_in.size.x/resizing_ratio.x;
      view_in.size.y = view_in.size.y/resizing_ratio.y;

      //apply the new view to
      input = view_in;
      output = view_out;
    }

    this.worldToScreen = function(point) {

        var newPoint = new Point(0,0);

        newPoint.x = (point.x - input.position.x)*output.size.x/input.size.x;
        newPoint.y = (point.y - input.position.y)*output.size.y/input.size.y;

        return newPoint;
    };

    this.screenToWorld = function(point) {

        var newPoint = new Point(0,0);

        newPoint.x = (point.x * input.size.x/output.size.x) + input.position.x ;
        newPoint.y = (point.y * input.size.y/output.size.y) + input.position.y ;

        return newPoint;
    };

    this.screenToWorld1D = function(scalar) {
        return scalar * input.size.x/output.size.x;
    };
    this.worldToScreen1D = function(scalar) {
        return scalar*output.size.x/input.size.x;
    };

    this.shiftPosition = function(point) {
        input.position.x += point.x;
        input.position.y += point.y;
    };

    this.setPosition = function(point) { 
        input.position = point; 
    };



    this.zoom = function(n) {

        var center_point = this.getCenter();

        //scales the view by n but keeps the screen centered on the same location
        var x = input.position.x;
        var y = input.position.y;
        var w = input.size.x;
        var h = input.size.y;

        input.size = new Point( w*n , h*n );
        this.setCenter(center_point);
    };


}

    //PUBLIC FUNCTIONS






    View.prototype.getScale = function() { 
        return this.getOutputRect().size.x/this.getInputRect().size.x; 
    };

    View.prototype.getHexRectangleBoundaries = function(layout) {
        
        //find the boundaries
        var extra = 0; //this variable defines how much bigger than the screen to render
        var left = this.getInputRect().position.x-extra;
        var right = this.getInputRect().position.x+this.getInputRect().size.x+extra;
        var top = this.getInputRect().position.y-extra;
        var bottom = this.getInputRect().position.y+this.getInputRect().size.y+extra;

        //find the corner points
        var topleft = new Point(left,top);
        var topright = new Point(right,top);
        var bottomleft = new Point(left,bottom);
        var bottomright = new Point(right,bottom);

        //find the corner hexes
        var toplefthex = Hex.round(layout.pointToHex(topleft));
        var toprighthex = Hex.round(layout.pointToHex(topright));
        var bottomlefthex = Hex.round(layout.pointToHex(bottomleft));
        var bottomrighthex = Hex.round(layout.pointToHex(bottomright));

        //define the limits of the iteration
        var qmin = Math.min(toplefthex.getQ(),bottomrighthex.getQ(),toprighthex.getQ(),bottomlefthex.getQ());
        var qmax = Math.max(toplefthex.getQ(),bottomrighthex.getQ(),bottomlefthex.getQ(),toprighthex.getQ());
        var rmin = Math.min(toplefthex.getR(),bottomrighthex.getR(),toprighthex.getR(),bottomlefthex.getR());
        var rmax = Math.max(toplefthex.getR(),bottomrighthex.getR(),toprighthex.getR(),bottomlefthex.getR());

        var hex_rect = [qmin,qmax,rmin,rmax];
        return hex_rect;
    }

