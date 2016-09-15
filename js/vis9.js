(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var Nodes = {

  // Settings
  density: 16,
  
  drawDistance: 24,
  baseRadius: 8,
  maxLineThickness: 4,
  reactionSensitivity: 3,
  lineThickness: 1,

  points: [],
  mouse: { x: -1000, y: -1000, down: false },

  animation: null,

  canvas: null,
  context: null,

  imageInput: null,
  bgImage: null,
  bgCanvas: null,
  bgContext: null,
  bgContextPixelData: null,

  init: function() {
    // Set up the visual canvas 
    this.canvas = document.getElementById( 'canvas' );
    this.context = canvas.getContext( '2d' );
    this.context.globalCompositeOperation = "lighter";
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.display = 'block'

    this.imageInput = document.createElement( 'input' );
    this.imageInput.setAttribute( 'type', 'file' );
    this.imageInput.style.visibility = 'hidden';
    this.imageInput.addEventListener('change', this.upload, false);
    document.body.appendChild( this.imageInput );

    this.canvas.addEventListener('mousemove', this.mouseMove, false);
    this.canvas.addEventListener('mousedown', this.mouseDown, false);
    this.canvas.addEventListener('mouseup',   this.mouseUp,   false);
    this.canvas.addEventListener('mouseout',  this.mouseOut,  false);

    window.onresize = function(event) {
      Nodes.canvas.width = window.innerWidth;
      Nodes.canvas.height = window.innerHeight;
      Nodes.onWindowResize();    
    }

    // Load initial input image
    this.loadData('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAp8AAAHxCAYAAAAr/te/AAAA1XpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjabVFtDsMgCP3vKXYEvkQ9Tmc12Q12/FGlzWr6EgH5eICG9v308DpAQkFiylpUwSBFCm1mZJioQyLwkAOlA7n35g8d3SQPiBc0J+N7AUTX20J0JTSzrBcmz9OpkRYi1xhXIp8A63MBozdw99snjbQSzY1BS06D1AP1XO1Evh/ZBaNIFRQikBwUtaloVWshKZHabno8PycendluPVlIo2VVsjGoMXI2Od/WzmYTlYcfYfu6P//1IY7wA7HzZaJAhkiDAAAKBmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjY3MSIKICAgZXhpZjpQaXhlbFlEaW1lbnNpb249IjQ5NyIKICAgdGlmZjpJbWFnZVdpZHRoPSI2NzEiCiAgIHRpZmY6SW1hZ2VIZWlnaHQ9IjQ5NyIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIvPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAg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');
  },

  preparePoints: function() {

    // Clear the current points
    this.points = [];
    
    var width, height, i, j;

    var colors = this.bgContextPixelData.data;

    for( i = 0; i < this.canvas.height; i += this.density ) {

      for ( j = 0; j < this.canvas.width; j += this.density ) {

        var pixelPosition = ( j + i * this.bgContextPixelData.width ) * 4;

        // Dont use whiteish pixels
        if ( colors[pixelPosition] > 200 && (colors[pixelPosition + 1]) > 200 && (colors[pixelPosition + 2]) > 200 || colors[pixelPosition + 3] === 0 ) {
          continue;
        }
        
        var color = 'rgba(' + colors[pixelPosition] + ',' + colors[pixelPosition + 1] + ',' + colors[pixelPosition + 2] + ',' + '1)';
        this.points.push( { x: j, y: i, originalX: j, originalY: i, color: color } );

      }
    }
  },

  updatePoints: function() {

    var i, currentPoint, theta, distance;
    
    for (i = 0; i < this.points.length; i++ ){

      currentPoint = this.points[i];

      theta = Math.atan2( currentPoint.y - this.mouse.y, currentPoint.x - this.mouse.x);

      if ( this.mouse.down ) {
        distance = this.reactionSensitivity * 200 / Math.sqrt((this.mouse.x - currentPoint.x) * (this.mouse.x - currentPoint.x) +
         (this.mouse.y - currentPoint.y) * (this.mouse.y - currentPoint.y));
      } else {
        distance = this.reactionSensitivity * 100 / Math.sqrt((this.mouse.x - currentPoint.x) * (this.mouse.x - currentPoint.x) +
         (this.mouse.y - currentPoint.y) * (this.mouse.y - currentPoint.y));  
      }
      

      currentPoint.x += Math.cos(theta) * distance + (currentPoint.originalX - currentPoint.x) * 0.05;
      currentPoint.y += Math.sin(theta) * distance + (currentPoint.originalY - currentPoint.y) * 0.05;

    }
  },

  drawLines: function() {
    
    var i, j, currentPoint, otherPoint, distance, lineThickness;

    for ( i = 0; i < this.points.length; i++ ) {

      currentPoint = this.points[i];

      // Draw the dot.
      this.context.fillStyle = currentPoint.color;
      this.context.strokeStyle = currentPoint.color;

      for ( j = 0; j < this.points.length; j++ ){

        // Distaqnce between two points.
        otherPoint = this.points[j];

        if ( otherPoint == currentPoint ) {
          continue;
        }

        distance = Math.sqrt((otherPoint.x - currentPoint.x) * (otherPoint.x - currentPoint.x) +
         (otherPoint.y - currentPoint.y) * (otherPoint.y - currentPoint.y));

        if (distance <= this.drawDistance) {

          this.context.lineWidth = (1 - (distance / this.drawDistance)) * this.maxLineThickness * this.lineThickness;
          this.context.beginPath();
          this.context.moveTo(currentPoint.x, currentPoint.y);
          this.context.lineTo(otherPoint.x, otherPoint.y);
          this.context.stroke();
        }
      }
    }
  },

  drawPoints: function() {

    var i, currentPoint;

    for ( i = 0; i < this.points.length; i++ ) {

      currentPoint = this.points[i];

      // Draw the dot.
      this.context.fillStyle = currentPoint.color;
      this.context.strokeStyle = currentPoint.color;

      this.context.beginPath();
      this.context.arc(currentPoint.x, currentPoint.y, this.baseRadius ,0 , Math.PI*2, true);
      this.context.closePath();
      this.context.fill();

    }
  },

  draw: function() {
    this.animation = requestAnimationFrame( function(){ Nodes.draw() } );

    this.clear();
    this.updatePoints();
    this.drawLines();
    this.drawPoints();

  },

  clear: function() {
    this.canvas.width = this.canvas.width;
  },

  // The filereader has loaded the image... add it to image object to be drawn
  loadData: function( data ) {
    
    this.bgImage = new Image;
    this.bgImage.src = data;

    this.bgImage.onload = function() {

      //this
      Nodes.drawImageToBackground();
    }
  },

  // Image is loaded... draw to bg canvas
  drawImageToBackground: function () {

    this.bgCanvas = document.createElement( 'canvas' );
    this.bgCanvas.width = this.canvas.width;
    this.bgCanvas.height = this.canvas.height;

    var newWidth, newHeight;

    // If the image is too big for the screen... scale it down.
    if ( this.bgImage.width > this.bgCanvas.width - 100 || this.bgImage.height > this.bgCanvas.height - 100) {

      var maxRatio = Math.max( this.bgImage.width / (this.bgCanvas.width - 100) , this.bgImage.height / (this.bgCanvas.height - 100) );
      newWidth = this.bgImage.width / maxRatio;
      newHeight = this.bgImage.height / maxRatio;

    } else {
      newWidth = this.bgImage.width;
      newHeight = this.bgImage.height;
    }

    // Draw to background canvas
    this.bgContext = this.bgCanvas.getContext( '2d' );
    this.bgContext.drawImage( this.bgImage, (this.canvas.width - newWidth) / 2, (this.canvas.height - newHeight) / 2, newWidth, newHeight);
    this.bgContextPixelData = this.bgContext.getImageData( 0, 0, this.bgCanvas.width, this.bgCanvas.height );

    this.preparePoints();
    this.draw();
  },

  mouseDown: function( event ){
    Nodes.mouse.down = true;
  },

  mouseUp: function( event ){
    Nodes.mouse.down = false;
  },
  
  mouseMove: function(event){
    Nodes.mouse.x = event.offsetX || (event.layerX - Nodes.canvas.offsetLeft);
    Nodes.mouse.y = event.offsetY || (event.layerY - Nodes.canvas.offsetTop);
  },
  
  mouseOut: function(event){
    Nodes.mouse.x = -1000;
    Nodes.mouse.y = -1000;
    Nodes.mouse.down = false;
  },

  // Resize and redraw the canvas.
  onWindowResize: function() {
    cancelAnimationFrame( this.animation );
    this.drawImageToBackground();
  }
}
  
  setTimeout( function() {
    Nodes.init();
}, 10 );
