/*
  Function fixing the pixelation && stretching
  It help TreeJS to know when update the canvas size && internal resolution
  
  This function basically listening to canvas && window size and return a boolean based on if the size are the same
  It use for determine whether to re-render the scene or not and take into account the device pixel as well
  Taking account to device pixel allow the canvas to be sharp in mobile device too
  @return => Boolean
*/
export function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvasPixelWidth = canvas.width / window.devicePixelRatio;
  var canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    
    renderer.setSize(width, height, false);
  }
  return needResize;
}