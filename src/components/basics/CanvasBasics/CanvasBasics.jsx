import React from 'react';

/*
  Basic Canvas element
  Has the height/width of the current window
  @props: id: String, canvasRef: Callback<DOMElement>
*/
function CanvasBasics(props) {
  const { id, canvasRef } = props;

  return (
    <canvas id={id} ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
  )
}

export default CanvasBasics;