



/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////                                                                                              
//////                        BASIC RENDERING FUNCTIONS
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


//this is a basic Renderer, it doesn't know about hexes! only points

function Renderer(canvas_draw,view) {
    this.canvas_draw = canvas_draw;
    this.view = view;

    this.ready_to_render = true;
    this.render_timer = {};
}


    //PURE functions, use the CANVAS INTERFACE directly to draw on the screen

    Renderer.prototype.drawDot = function (point,size,color) {

        //this function draws directly, so modifies the coordinates
        var coord = this.view.worldToScreen(point);
        size = this.view.worldToScreen1D(size);

        this.canvas_draw.drawDot(coord,size,color);
    };

    Renderer.prototype.drawLine = function(point1,point2,line_width,color) {

        //this function draws directly, so modifies the coordinates
        var p1 = this.view.worldToScreen(point1);
        var p2 = this.view.worldToScreen(point2);
        var newwidth = this.view.worldToScreen1D(line_width);

        this.canvas_draw.drawLine(p1,p2,newwidth,color)
    };

    Renderer.prototype.drawPolygon = function(points,line_width,fill_color,line_color) {
        //this function draws directly, so modifies the coordinates
        var coords = []; //creates an array or an object (vim test)
        
        //otherwise actually draw a polygon
        for (let point of points) {
            coords.push(this.view.worldToScreen(point));
        }

        this.canvas_draw.drawPolygon(coords,line_width,fill_color,line_color);

    };

    Renderer.prototype.drawText = function(text,position,shade,fontsize) {
        //this function draws directly, so modifies the coordinates
        var coord = this.view.worldToScreen(position);
        if (!fontsize) {
            var fontsize = 13;
        }
        var newfontsize = this.view.worldToScreen1D(fontsize);

        this.canvas_draw.drawText(text,coord,shade,newfontsize);
    };

    //INDIRECT functions, use the previously defined functions to draw more complicated things
    Renderer.prototype.drawLines = function(points,width) {
        for (var i=0;i<points.length-1;i++) {
            this.drawLine(points[i], points[i+1], width);
        }
    };

    Renderer.prototype.doneRendering = function(maximum_rendering_time_in_milliseconds) {
        this.ready_to_render = false;
        this.render_timer = window.setTimeout(this.readyToRender, maximum_rendering_time_in_milliseconds);
    };

    Renderer.prototype.readyToRender = function() {
        this.ready_to_render = true;
    };

    Renderer.prototype.startRendering = function() {
        this.canvas_draw.clear();
    };













/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////                                                                                              
//////                          WORLD RENDERER
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


var greenscale_colors = function(i) {
    var greenscale = ['#005','#00D','#AA3','#080','#062','#052','#042','#032','#020','#010','#110500','#210','#410','#420','#777','#777','#777','#888','#888','#888','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF'];
    var faded_greenscale = ['#335','#66D','#AA7','#686','#575','#464','#353','#242','#232','#232','#110','#321','#421','#432','#777','#777','#777','#888','#888','#888','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF'];
    return greenscale[i];
    
}


function WorldRenderer (canvas_draw,view,world) {
    Renderer.call(this,canvas_draw,view); 
    this.world = world;

    this.corners = [];

    this.drawn_at_least_one_hex = false;
    this.ready_to_render = true;
}

    WorldRenderer.prototype = Object.create(Renderer.prototype);

    WorldRenderer.prototype.hexToPoint = function(hex) {
        return this.world.hexToPoint(hex);
    }
    WorldRenderer.prototype.hexesToPoints = function(hexes) {
        var points = [];
        for (let hex of hexes) {                            
            points.push(this.hexToPoint(hex));
        }
        return points;
    }
    WorldRenderer.prototype.pointToHex = function(point) {
        return this.world.pointToHex(point);
    }

    WorldRenderer.prototype.mapColors = function(i) {
        return greenscale_colors(i);  
    } 

    WorldRenderer.prototype.drawHex = function(hex,line_width,fill_color,line_color) {

        //if zoomed out enough, just draw a dot
        if (this.view.getScale() < 1) {

            var point = this.hexToPoint(hex);
            this.drawDot(point,61,fill_color);
        } else {
            //otherwise, draw the actual hex
            var corners = this.hexesToPoints(Hex.corners(hex));
            this.drawPolygon(corners,line_width,fill_color);
        }
        this.drawn_at_least_one_hex = true;
    };

    WorldRenderer.prototype.fastDrawHex = function(hex,fill_color) {

            //calculate shifted position between previous hex and next hex
            var world_position = this.hexToPoint(hex);
            var screen_position = this.view.worldToScreen(world_position);

            //draw a polygon
            this.canvas_draw.reDrawPolygon(screen_position/*,fill_color*/);
    }

    WorldRenderer.prototype.drawHexElevated = function(hex,height,line_width,color_sides,color_top) {
        var low_corners = this.hexesToPoints(Hex.corners(hex));
        var high_corners = [];
        for (var i=0;i<low_corners.length;i++) {
            high_corners[i] = new Point(low_corners[i].x,low_corners[i].y - height);
        }

        var column_corners = [low_corners[0],high_corners[1],high_corners[2],high_corners[3],low_corners[4],low_corners[5]];

        this.drawPolygon(column_corners,line_width,color_sides);
        this.drawHex(high_corners,line_width,color_top);

    };

    WorldRenderer.prototype.drawHexes = function(hexes,line_width,color) {
        for (var i=0;i<hexes.length;i++) {
            this.drawHex(hexes[i], line_width,color)
        }
    };

    WorldRenderer.prototype.drawOutline = function(edge_arrays,line_width,fill_color,line_color) {
        for (var outline = 0; outline < edge_arrays.length; outline++) {
            var corners = [];
            var edges = edge_arrays[outline];    
            for (var i=0;i<edges.length;i++){
                corners.push( this.hexToPoint(edges[i].getPoint1() ));
            }
            this.drawPolygon(corners,line_width,fill_color,line_color);
        }
    };

    WorldRenderer.prototype.drawRectangleSection = function(qmin,qmax,rmin,rmax) {
        
        var currentr = 0;
        var r = 0;
        var q = 0;
        var hex = new Hex(0,0);
        var value = 0;
        var tile_renderer = new TileRenderer2D(this);

        //for columns
        for (r = rmin; r <= rmax; r++) {

            //shift even lines
            currentr = r;
            if (r%2!=0) currentr += 1;

            this.drawRectangleSectionLine(r,currentr,qmin,qmax,rmin,rmax);
        }
    }

    WorldRenderer.prototype.drawRectangleSectionLine = function(r,currentr,qmin,qmax,rmin,rmax) {
       
        var q=0;

        //for rows ( each shifted to become rectangular)
        for (q = Math.floor(qmin+(rmax-currentr)/2); q<qmax+(rmax-currentr)/2; q++) {
            hex = new Hex(q,r);
            if (this.world.map.containsHex(hex)) {

                this.drawTile2D(hex);
            }
        }
    }


    WorldRenderer.prototype.getHexRectangleBoundaries = function() {
        
        //find the boundaries
        var extra = 0; //this variable defines how much bigger than the screen to render
        var left = this.view.getInputRect().position.x-extra;
        var right = this.view.getInputRect().position.x+this.view.getInputRect().size.x+extra;
        var top = this.view.getInputRect().position.y-extra;
        var bottom = this.view.getInputRect().position.y+this.view.getInputRect().size.y+extra;

        //find the corner points
        var topleft = new Point(left,top);
        var topright = new Point(right,top);
        var bottomleft = new Point(left,bottom);
        var bottomright = new Point(right,bottom);

        //find the corner hexes
        var toplefthex = Hex.round(this.pointToHex(topleft));
        var toprighthex = Hex.round(this.pointToHex(topright));
        var bottomlefthex = Hex.round(this.pointToHex(bottomleft));
        var bottomrighthex = Hex.round(this.pointToHex(bottomright));

        //define the limits of the iteration
        var qmin = Math.min(toplefthex.getQ(),bottomrighthex.getQ(),toprighthex.getQ(),bottomlefthex.getQ());
        var qmax = Math.max(toplefthex.getQ(),bottomrighthex.getQ(),bottomlefthex.getQ(),toprighthex.getQ());
        var rmin = Math.min(toplefthex.getR(),bottomrighthex.getR(),toprighthex.getR(),bottomlefthex.getR());
        var rmax = Math.max(toplefthex.getR(),bottomrighthex.getR(),toprighthex.getR(),bottomlefthex.getR());

        var hex_rect = [qmin,qmax,rmin,rmax];
        return hex_rect;
    }

    WorldRenderer.prototype.drawRedRenderingRectangle = function(qmin,qmax,rmin,rmax) {
        var corners = [];
        corners.push(this.hexToPoint(new Hex(qmin,rmin)));
        corners.push(this.hexToPoint(new Hex(qmin,rmax)));
        corners.push(this.hexToPoint(new Hex(qmax,rmax)));
        corners.push(this.hexToPoint(new Hex(qmax,rmin)));

        this.drawPolygon(corners,20,'transparent','red');
    }    

    WorldRenderer.prototype.drawWorld = function() {

        if (this.ready_to_render) {
            this.startRendering(); //in milliseconds
            this.drawn_at_least_one_hex = false;
            var rectMap = this.getHexRectangleBoundaries();
            this.drawRectangleSection(rectMap[0],rectMap[1],rectMap[2],rectMap[3]);
            this.drawn_at_least_one_hex = false;
            //this.doneRendering(10);
        }
    }








    WorldRenderer.prototype.getTile = function(hex) {
        return this.world.map.getValue(hex);
    }


    WorldRenderer.prototype.drawTile2D = function(hex) {
        
        //analyze tile
        var height = Math.floor(this.getTile(hex).components.elevation);
        color = this.mapColors(height);

        //draw ground
        this.drawHex(hex,0,color);
        var position = this.hexToPoint(hex);
        this.drawText(this.getTile(hex).components.wind, position);

        //draw units
        var this_unit = this.world.units.getValue(hex);
        if (typeof this_unit == 'object') {

            this.drawUnit(this_unit,hex,0);



        }
    }

    WorldRenderer.prototype.drawTile3D = function(hex) {
        
        //analyze tile
        var color = Math.floor(this.getTile(hex).components.elevation);
        color = this.mapColors(color);
        var height = this.getTile(hex).components.elevation*6;

        //draw ground
        if (this.getTile(hex).components.elevation > 1) {
            this.drawHexElevated(hex,height,0,'#310',color);
        } else {
            this.drawHex(hex,0,color);
        }

        //draw unit
        //var this_unit = this.world.unitAtPosition(hex);
        //if (typeof this_unit == 'object') {

            //this.drawUnit(this_unit,hex,height);

        //}
    }

    WorldRenderer.prototype.drawTileSemi3D = function(hex) {
        
        //this code only works in POINTY_TOP style


        //analyze tile
        var height = this.getTile(hex).components.elevation;
        var color = Math.floor(height);
        color = this.mapColors(color);
        this.drawHex(hex,0,color);
        //draw ground
        //
        var shade  = Math.floor(255-255*height/20);
        color =  "rgba("+shade+","+shade+","+shade+", 0.5)";
        //this.drawHex(hex,0,color);

        //draw walls
        var wall_color = '#310';
        var wall_height = 6;
        
        //analyze neighbors
        var n_left = Hex.neighbor(hex,3);
        var n_upleft = Hex.neighbor(hex,2);
        var n_upright = Hex.neighbor(hex,1);

        //get height of neighbors
        var n_left_height = this.world.map.getValue(n_left);
        var n_upleft_height = this.world.map.getValue(n_upleft);
        var n_upright_height = this.world.map.getValue(n_upright);

        var corners = Hex.corners(hex);
        //draw wall of the left if the heights are different
        if (n_left_height != height) {
           // wall_height = wall_height/2;
           // this.drawLine(corners[3],corners[4],wall_height,wall_color);
        }
        //draw wall on the top-left if that tile is higher
        if (n_upleft_height > height) {
            wall_height = 1.5*(n_upleft_height-height);
            this.drawLine(corners[2].offset(0,wall_height/2),corners[3].offset(0,wall_height/2),wall_height,wall_color);
        }
        //draw wall on the top-right if that tile is higher
        if (n_upright_height > height) {
            wall_height = 1.5*(n_upright_height-height);
            this.drawLine(corners[1].offset(0,wall_height/2),corners[2].offset(0,wall_height/2),wall_height,wall_color);
        }

        //draw unit
        var this_unit = this.world.unitAtPosition(hex);
        if (typeof this_unit == 'object') {

            this.drawUnit(this_unit,hex,0);

        }
    }


    WorldRenderer.prototype.drawUnit = function(unit,hex,height) {

        var position = this.hexToPoint(hex);
        position = position.offset(0,-height);
        
        this.drawDot(position,10*unit.components.size,unit.components.color);
        if (unit.components.population != undefined) {
            this.drawText(unit.components.population,position,'black',25);

        }
    };

    WorldRenderer.prototype.drawRange = function(range) {
        
        var outline = Hex.outline(range.getArray());

        //draw the outline of the range
        this.drawOutline( outline ,3,"rgba(255,255,150, 0.2)","rgba(255,255,100,1)");
    }

    WorldRenderer.prototype.drawPath = function(range,destination) {
        
        var pathfinder = new PathFinder(this.world.map);

        //draw the path
        if (range.containsHex(destination)) {
            this.drawHex(destination,1,"rgba(200, 255, 200, 0.5)");
            
            //calculate points of the hexes
            var hexes = pathfinder.destinationPathfind(range,destination);
            var points = [];
            for (var i = 0; i<hexes.length;i++) {
                points.push(this.hexToPoint(hexes[i]));
            }

            //draw on screen
            this.drawLines(points,3);
            
        }
    }



















/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////                                                                                              
//////                          TILE RENDERER
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function TileRenderer () {
    Renderer.call(this); 
}
TileRenderer.prototype = Object.create(Renderer.prototype);
TileRenderer.prototype.drawTile = function(hex,value) {
}
TileRenderer.prototype.mapColors = function(i) {
    return greenscale_colors(i);  
} 



function TileRenderer2D() {
    TileRenderer.call(this); 
}
TileRenderer2D.prototype = Object.create(TileRenderer.prototype);
TileRenderer2D.prototype.drawTile = function(hex,value) {
        //analyze tile
        var height = value;
        color = this.mapColors(height);

        //draw ground
        this.drawHex(hex,0,color);
    }

/*


function TileRenderer3D() {
    this.drawTile = function(hex,value) {
        //analyze tile
        var color = value;
        color = this.mapColors(color);
        var height = color*6;

        //draw ground
        if (height > 1) {
            this.drawHexElevated(hex,height,0,'#310',color);
        } else {
            this.drawHex(hex,0,color);
        }
    }
}
TileRenderer3D.prototype = Object.create(TileRenderer.prototype);

function TileRendererSemi3D() {
    this.drawTile = function(hex,value) {

        //this code only works in POINTY_TOP


        //analyze tile
        var height = value;
        var color = Math.floor(height);
        color = this.mapColors(color);
        this.drawHex(hex,0,color);
        //draw ground
        //
        var shade  = Math.floor(255-255*height/20);
        color =  "rgba("+shade+","+shade+","+shade+", 0.5)";
        //this.drawHex(hex,0,color);

        //draw walls
        var wall_color = '#310';
        var wall_height = 6;
        
        //analyze neighbors
        var n_left = Hex.neighbor(hex,3);
        var n_upleft = Hex.neighbor(hex,2);
        var n_upright = Hex.neighbor(hex,1);

        //get height of neighbors
        var n_left_height = this.world.map.getValue(n_left);
        var n_upleft_height = this.world.map.getValue(n_upleft);
        var n_upright_height = this.world.map.getValue(n_upright);

        var corners = Hex.corners(hex);
        //draw wall of the left if the heights are different
        if (n_left_height != height) {
           // wall_height = wall_height/2;
           // this.drawLine(corners[3],corners[4],wall_height,wall_color);
        }
        //draw wall on the top-left if that tile is higher
        if (n_upleft_height > height) {
            wall_height = 1.5*(n_upleft_height-height);
            this.drawLine(corners[2].offset(0,wall_height/2),corners[3].offset(0,wall_height/2),wall_height,wall_color);
        }
        //draw wall on the top-right if that tile is higher
        if (n_upright_height > height) {
            wall_height = 1.5*(n_upright_height-height);
            this.drawLine(corners[1].offset(0,wall_height/2),corners[2].offset(0,wall_height/2),wall_height,wall_color);
        }
    }
}
TileRendererSemi3D.prototype = Object.create(TileRenderer.prototype);

*/