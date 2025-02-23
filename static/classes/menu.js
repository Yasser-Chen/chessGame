$(".overlay").css("display", "flex");

$("html").droppable({
  drop: function (event, ui) {
    event.preventDefault();
    $(ui.draggable).css({
      top: "0px",
      left: "0px",
    });
  },
});

let searchingLoop = -1;

var createNewGame = (playAs) => {
  window.board = new Board($("#board"), playAs);

  let i = 0; //the first tr is useless
  for (let row of board.board.find(`tr`)) {
    let j = 1;
    for (let square of $(row).find("td")) {
      $(square).attr("x", i);
      $(square).attr("y", j);
      j++;
    }
    i++;
  }

  for (let i = 1; i <= 8; i++) {
    board.add(new Pawn(2, i, "black"));
    board.add(new Pawn(7, i, "white"));
  }

  board.add(new King(8, 5, "white"));
  board.add(new King(1, 5, "black"));

  board.add(new Queen(8, 4, "white"));
  board.add(new Queen(1, 4, "black"));

  board.add(new Bishop(8, 6, "white"));
  board.add(new Bishop(8, 3, "white"));
  board.add(new Bishop(1, 3, "black"));
  board.add(new Bishop(1, 6, "black"));

  board.add(new Rook(8, 8, "white"));
  board.add(new Rook(8, 1, "white"));
  board.add(new Rook(1, 8, "black"));
  board.add(new Rook(1, 1, "black"));

  board.add(new Knight(8, 2, "white"));
  board.add(new Knight(8, 7, "white"));
  board.add(new Knight(1, 7, "black"));
  board.add(new Knight(1, 2, "black"));

  board.resetAttacks();

  if ($('input[name="mode_of_play"]:checked').val() == "vs_bot") {
    window.isGameVsBot = true;
  } else if ($('input[name="mode_of_play"]:checked').val() == "online") {
    window.isGameOnline = true;
  }
  $(".overlay").css("display", "none");

  if (playAs) {
    $(`i`).draggable({
      drag: onPieceDrag,
      accept: "td",
      containment: "#game",
      stop: onPieceStopDrag,
      scroll: false,
    });
    $(`i`).draggable("destroy");
    if (window.isGameOnline) {
      $(`.fg-${playAs}`).draggable({
        drag: onPieceDrag,
        accept: "td",
        containment: "#game",
        stop: onPieceStopDrag,
        scroll: false,
      });
    }
  }
};

$("#playerIncrementInput , #playerTimeInput").on("input", function (e) {
  $(".is-invalid").removeClass("is-invalid");
  window.timeSetted = +$("#playerTimeInput").val();
  window.increment = +$("#playerIncrementInput").val();

  if (
    isNaN(window.timeSetted) ||
    !(20 < window.timeSetted && window.timeSetted <= 60 * 60)
  ) {
    $("#playerTimeInput").addClass("is-invalid");
  }

  if (
    isNaN(window.increment) ||
    !(0 <= window.increment && window.increment <= 10)
  ) {
    $("#playerIncrementInput").addClass("is-invalid");
  }
});

var syncDone = false;

function initGame() {
  $(".is-invalid").removeClass("is-invalid");
  let isValid = true;
  window.normalMovesCounter = 0;
  window.timeSetted = +$("#playerTimeInput").val();
  window.increment = +$("#playerIncrementInput").val();

  if (
    isNaN(window.timeSetted) ||
    !(20 < window.timeSetted && window.timeSetted <= 24 * 60 * 60)
  ) {
    $("#playerTimeInput").addClass("is-invalid");
    isValid = false;
  }

  if (
    isNaN(window.increment) ||
    !(0 <= window.increment && window.increment <= 10)
  ) {
    $("#playerIncrementInput").addClass("is-invalid");
    isValid = false;
  }

  if (isValid) {
    if ($('input[name="mode_of_play"]:checked').val() == "online") {
      $("#loadding_pannnel").css({ display: "flex" });
      $("#main_pannnel").css({ display: "none" });

      let url = `ws://${window.location.host}/ws/socket-server/`;

      window.gameSocket = new WebSocket(url);

      window.gameSocket.onmessage = function (e) {
        let data = JSON.parse(JSON.parse(e.data).chess_event);

        if (
          !syncDone &&
          ((data.type == "sync" && data.priority != priority) ||
            data.type == "sync_accepted")
        ) {
          syncDone = true;
          clearInterval(searchingLoop);

          window.gameSocket.send(
            JSON.stringify({
              chess_event: JSON.stringify({
                type: "sync_accepted",
                priority: priority,
                date_start: data.date_start,
              }),
            })
          );

          const date1 = new Date();
          const date2 = new Date();
          date2.setTime(data.date_start);

          const diffTime = Math.abs(date2 - date1);
          console.log(diffTime);

          $("#loading_chess_event").html("Match Found");

          if (data.type == "sync_accepted") {
            //must play as black
            setTimeout(function () {
              createNewGame("black");

              window.playAs = "black";
              animateRotate();
            }, diffTime);
          } else {
            //must play as black
            setTimeout(function () {
              createNewGame("white");

              window.playAs = "white";
            }, diffTime);
          }
        } else if (data.type == "upgrade") {
          window.lastUpgradedPiece = data.piece;
          makeMove(board, data.x, data.y, data.newX, data.newY);
        } else if (
          data.type != "upgrade" &&
          data.type != "sync" &&
          data.type != "sync_accepted"
        ) {
          makeMove(board, data.x, data.y, data.newX, data.newY);
        }
      };

      setTimeout(function () {
        clearInterval(searchingLoop);
        searchingLoop = setInterval(function () {
          var uneDateImportant = new Date();
          uneDateImportant.setSeconds(uneDateImportant.getSeconds() + 2);

          window.gameSocket.send(
            JSON.stringify({
              chess_event: JSON.stringify({
                type: "sync",
                date_start: uneDateImportant.getTime(),
                priority: priority,
              }),
            })
          );
        }, 1000);
      }, 100);
    } else {
      createNewGame();
    }
  }
}

function showSquaresQueen() {
  var arr = {};
  for (var a of board.pieces) {
    ((a ?? {}).attackingSquares ?? []).forEach(function (e) {
      if (a.constructor.name == "Queen" && a.color == "white") {
        arr[`${e.x}_${e.y}`] = $(`td[x=${e.x}][y=${e.y}]`)[0];
      }
    });
  }
  console.log(arr);
}
