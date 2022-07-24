

let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let mousedown = false;
let pencilWidthElem = document.querySelector(".pencil-width");
let pencilColor = document.querySelectorAll(".pencil-color");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let undoRedoTracker = []; // data represent
let track = 0;
//API
let tool = canvas.getContext("2d");

let penColor = "red";
let penWidth = pencilWidthElem.ariaValueMax;
let eraserWidth = eraserWidthElem.value;
let eraserColor = "white";

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

// mouse dowen --> start new path, mouse move -> path fill

canvas.addEventListener("mousedown", (e) => {
  mousedown = true;
  // beginPath({
  //   x: e.clientX,
  //   y: e.clientY,
  // });
  let data = {
    x: e.clientX,
    y: e.clientY,
  };
  //sent data to server
  socket.emit("begin", data);
});

canvas.addEventListener("mousemove", (e) => {
  if (mousedown) {
    let data = {
      x: e.clientX,
      y: e.clientY,
      color: eraserFlag ? eraserColor : penColor,
      width: eraserFlag ? eraserWidth : penWidth,
    };
    socket.emit("drawStroke", data);
    // drawStroke({
    //   x: e.clientX,
    //   y: e.clientY,
    //   color: eraserFlag ? eraserColor : penColor,
    //   width: eraserFlag ? eraserWidth : penWidth,
    // });
  }
});

canvas.addEventListener("mouseup", (e) => {
  mousedown = false;
  let url = canvas.toDataURL();
  undoRedoTracker.push(url);
  track = undoRedoTracker.length - 1;
});

function beginPath(StrokeObj) {
  tool.beginPath();
  tool.moveTo(StrokeObj.x, StrokeObj.y);
}

function drawStroke(StrokeObj) {
  tool.strokeStyle = StrokeObj.color;
  tool.lineWidth = StrokeObj.width;
  tool.lineTo(StrokeObj.x, StrokeObj.y);
  tool.stroke();
}

pencilColor.forEach((colorElem) => {
  colorElem.addEventListener("click", (e) => {
    let color = colorElem.classList[0];
    penColor = color;
    tool.strokeStyle = penColor;
  });
});

undo.addEventListener("click", (e) => {
  if (track > 0) track--;
  //track action
  let data = {
    trackValue: track,
    undoRedoTracker,
  };
  socket.emit("redoUndo" , data);
  // undoRedoCanvas(trackObj);
});
redo.addEventListener("click", (e) => {
  if (track < undoRedoTracker.length - 1) track++;
  //action
  let data = {
    trackValue: track,
    undoRedoTracker,
  };
  socket.emit("redoUndo" , data);
  // undoRedoCanvas(trackObj);
});
function undoRedoCanvas(trackObj) {
  track = trackObj.trackValue;
  undoRedoTracker = trackObj.undoRedoTracker;

  let url = undoRedoTracker[track];
  let img = new Image(); // new image refrence elem
  img.src = url;
  img.onload = (e) => {
    tool.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}
pencilWidthElem.addEventListener("change", (e) => {
  penWidth = pencilWidthElem.value;
  tool.lineWidth = penWidth;
});
eraserWidthElem.addEventListener("change", (e) => {
  eraserWidth = eraserWidthElem.value;
  tool.lineWidth = eraserWidth;
});
eraser.addEventListener("click", (e) => {
  if (eraserFlag) {
    tool.strokeStyle = eraserColor;
    tool.lineWidth = eraserWidth;
  } else {
    tool.strokeStyle = penColor;
    tool.lineWidth = penWidth;
  }
});

download.addEventListener("click", (e) => {
  let url = canvas.toDataURL();
  let a = document.createElement("a");
  a.href = url;
  a.download = "board.jpg";
  a.click();
});

socket.on("begin", (data) => {
  //Data - From the server
  beginPath(data);
});

socket.on("drawStroke", (data) => {
  drawStroke(data);
});

socket.on("redoUndo", (data) => {
  undoRedoCanvas(data);
});