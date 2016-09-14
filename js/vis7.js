window.onload = function() {
  // Some temporary variables
  var r, g, b, grey;
  var character, currentLine = '';
  
  // Get image dimensions
  var spriteImg = document.getElementById('sprite');
  var spriteWidth = spriteImg.width;
  var spriteHeight = spriteImg.height;
  
  // Create a temporary canvas for greyscale conversion
  var tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = spriteWidth;
  tmpCanvas.height = spriteHeight;
  
  // Draw the sprite image to the temporary canvas
  var tmpCanvasCtx = tmpCanvas.getContext('2d');
  tmpCanvasCtx.fillStyle = 'white';
  tmpCanvasCtx.fillRect(0, 0, spriteWidth, spriteHeight);
  tmpCanvasCtx.drawImage(spriteImg, 0, 0, spriteWidth, spriteHeight);
  
  // Access pixel data and convert to greyscale
  var pixelData = tmpCanvasCtx.getImageData(0, 0, spriteWidth, spriteHeight);
  var colorData = pixelData.data;
  var asciiCnt = document.getElementById('ascii');
  
  for(var i = 0; i < colorData.length; i += 4) {
    // Convert pixel data into greyscale
    r = colorData[i]; g = colorData[i + 1]; b = colorData[i + 2];
    grey = r * 0.21 + g * 0.71 + b * 0.07;
    colorData[i] = colorData[i + 1] = colorData[i + 2] = grey;
    
    // Characters for ASCII art, color is represented by character density
    if(grey > 250) character = ' ';
    else if(grey > 230) character = '`';
    else if(grey > 200) character = ':';
    else if(grey > 175) character = '*';
    else if(grey > 150) character = '+';
    else if(grey > 125) character = '#';
    else if(grey > 50) character = 'W';
    else character = '@';
    
    currentLine += character;
    if(i != 0 && (i / 4) % spriteWidth == 0) { // At the end of the pixel-line
      asciiCnt.appendChild(document.createTextNode(currentLine));
      asciiCnt.appendChild(document.createElement('br'));
      currentLine = '';
    }
  }
  
  // Spritesheet calculations
  // Adjust frameCount to the number of frames, if you wanna use
  // another spritesheet...
  var container = document.getElementById('container');
  var frameCount = 4;
  var frameWidth = parseInt(window.getComputedStyle(container).width) / frameCount;
  console.log(parseInt(window.getComputedStyle(container).width));
  console.log('Frame width: ' + frameWidth);
  
  // Setup spritesheet animations and start the loop!
  container.style.width = frameWidth + 'px';
  asciiCnt.style.marginLeft = '0';
  setInterval(loopSprite, 350);
  
  // Sprite animation (works by adjusting marginLeft)
  function loopSprite() {
    var currentMargin = parseFloat(asciiCnt.style.marginLeft);
    var lastFrameMargin = frameWidth * (frameCount - 1) * -1;
    
    if(parseInt(currentMargin) == parseInt(lastFrameMargin))
      asciiCnt.style.marginLeft = '0';
    else
      asciiCnt.style.marginLeft = (currentMargin - frameWidth) + 'px';
  }
};
