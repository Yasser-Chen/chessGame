function Move(board) {
  let tab = [];

  for (const piece of board.pieces) {
    if (piece) {
      tab.push(
        `${piece.color}-${piece.x}-${piece.y}-${piece.constructor.name}`.padEnd(
          6
        )
      );
    }
  }

  tab.sort();

  this.boardDescription = tab.join("||");
}

function makeMove(board, x, y, newX, newY) {
  let searchOld = board.pieceAtSquare(x, y);
  if (searchOld) {
    let piece = searchOld.element;
    let square = $(`td[x=${newX}][y=${newY}]`);

    $(piece).animate(
      {
        left: square.offset().left - $(piece).parent().offset().left,
        top: square.offset().top - $(piece).parent().offset().top,
      },
      animationTime
    );

    if (piece) {
      setTimeout(() => {
        $(piece).css({
          top: "0px",
          left: "0px",
        });

        var draggable = piece.draggable(),
          droppable = square.droppable(),
          droppableOffset = droppable.offset(),
          draggableOffset = draggable.offset(),
          dx = droppableOffset.left - draggableOffset.left,
          dy = droppableOffset.top - draggableOffset.top;

        draggable.simulate("drag", {
          dx: dx,
          dy: dy,
        });
      }, animationTime + 100);
    }
  }

  // square.droppable('option', 'drop')({stopPropagation:()=>{}},{draggable:piece});
}
