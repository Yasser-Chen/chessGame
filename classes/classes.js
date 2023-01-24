window.gameState = 'notPlaying' ;

var castel      = new Audio(`audios/castel.mp3`)       ,
    check       = new Audio(`audios/check.mp3`)        ,
    checkMate   = new Audio(`audios/checkmate.mp3`)    ,
    eat         = new Audio(`audios/eat.mp3`)          ,
    gameStarted = new Audio(`audios/game started.mp3`) ,
    movePlayed  = new Audio(`audios/move played.mp3`)  ,
    timeWarning = new Audio(`audios/time-warning.mp3`)  ,
    stallMate   = new Audio(`audios/stallmate.mp3`)    ;

function onPieceDrag(e,ui){
    var pieceElem = ui.helper[0],
    piece = $(pieceElem).data('piece');
    for (const cXandY of piece.attackingSquares) {
        $(`td[x=${cXandY.x}][y=${cXandY.y}]`).addClass('possibleMove');
    }
}
function onPieceStopDrag() {  
    $('.possibleMove').removeClass('possibleMove');
}

function comparingObjs (obj) { 
    for (const elem of this ) {
        if(typeof elem == 'object' && elem.x == obj.x && elem.y == obj.y){
            return true;
        }
    }
    return false;
};
function pushItem (item) { 
    if(
            (1 <= item.x && item.x <= 8)
            &&
            (1 <= item.y && item.y <= 8)
        ){
        this.push(item);
    }
};
$('body').on('click',function (e) {
    var isRightMB;
    e = e || window.event;

    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = e.which == 3; 
    else if ("button" in e)  // IE, Opera 
        isRightMB = e.button == 2; 

    if(isRightMB){
        $( '.ui-draggable-dragging').css({
            top: "0px",left: "0px"
        });
    }
});


function diff (num1, num2) {
    if (num1 > num2) {
        return Math.abs(num1 - num2);
    } else {
        return Math.abs(num2 - num1);
    }
  }

function startTimer(seconds , oncomplete , display) {
    let startTime, timer, ms = seconds*1000,
    obj = {};
    obj.resume = function() {
        startTime = new Date().getTime();
        if(timer!=undefined){
            clearInterval(timer);
        }
        timer = setInterval(obj.step,250);
    };
    obj.pause = function() {
        ms = obj.step();
        clearInterval(timer);
    };
    
    obj.step = function() {
        var now = Math.max(0,ms-(new Date().getTime()-startTime)),
            m = Math.floor(now/60000), s = Math.floor(now/1000)%60;
        s = (s < 10 ? "0" : "")+s;
        m = (m < 10 ? "0" : "")+m;
        if(window.gameState=='playing'){
            display.innerHTML = m+":"+s;
            if( now <= 20000) {
                if(!$(display).hasClass('low-on-time')){
                    $(display).addClass('low-on-time');
                    timeWarning.play();
                }
            }else{
                $(display).removeClass('low-on-time');
            }
        }
        // else{
        //     clearInterval(timer);
        // }
        if( now <= 0) {
            clearInterval(timer);
            obj.resume = function() {};
            obj.step = function() {};
            obj.pause = function() {};
            if( oncomplete ) oncomplete();
        }
        return now;
    };
    obj.resume();
    return obj;
}
  

  
$("html").droppable({
    drop: function(event, ui) {
        event.preventDefault();
        $(ui.draggable).css({
            top: "0px",left: "0px"
        });
    }
});
function Board(board){
    window.gameState = 'playing' ;
    $('.overlay').css('display','none');
    let bigBoardObject = this ;
    this.movesCounter = 0 ;
    this.board = board  ;
    this.turn = 'black';
    this.pieces = []    ;
    this.timerWhite = startTimer(window.timeSetted + 0.5, function() { stallMate.play(); bigBoardObject.playerWon('black','on time');},$('#WhiteTimer')[0]);
    this.timerBlack = startTimer(window.timeSetted + 0.5, function() { stallMate.play(); bigBoardObject.playerWon('white','on time');},$('#BlackTimer')[0]);
    this.aterTurns();
    gameStarted.play();
    
    $("td").droppable({
        drop: function(event, ui) {
            event.stopPropagation();
            let square = $(this);
            let piece = $(ui.draggable).data('piece');
            let x = +square.attr("x") ;
            let y = +square.attr("y") ;
            
            if( 
                bigBoardObject.turn == piece.color 
                &&
                ( piece.x != x || piece.y!=y)
                ){//don't count useless moves
                
                //disallow everything if your king is or will be in check
                
                if( bigBoardObject.movesCounter == 30 ){
                    bigBoardObject.stallMate('15 moves without moving a pawn or eating a piece');
                }
                //else do this =>

                else if( piece.isLegal(bigBoardObject,x,y) && !bigBoardObject.isCheckIfMovePlayed(piece,x,y) ){
                    $(".incheck").removeClass('incheck');
                    piece.x = x;
                    piece.y = y;
                    piece.firstMoveDone = true ;
                    bigBoardObject.moveTo(piece,square);
                    //detect if a checkmate was done
                    if(piece.constructor.name=='Pawn' && (piece.x == 8 && piece.color=='black' || piece.x == 1 && piece.color=='white')){
                        $(`.fg-${this.turn}`).draggable('destroy');

                        let div = $('<div>');
                        let btn = $(`<button class="btn btn-dark btn-select-piece">
                                        <i class="fas fa-chess-queen"></i>
                                    </button>`);
                        btn.on('click', function () {
                            piece.element.popover('dispose');
                            square.empty();
                            bigBoardObject.add(new Queen(piece.x,piece.y,piece.color));
                            bigBoardObject.aterTurns();
                        });
                        div.append(btn);
                        btn = $(`<button class="btn btn-light btn-select-piece">
                                    <i class="fas fa-chess-knight"></i>
                                </button>`);
                        btn.on('click', function () {
                            piece.element.popover('dispose');
                            square.empty();
                            bigBoardObject.add(new Knight(piece.x,piece.y,piece.color));
                            bigBoardObject.aterTurns();
                        });
                        div.append(btn);
                        btn = $(`<button class="btn btn-dark btn-select-piece">
                                    <i class="fas fa-chess-rook"></i>
                                </button>`);
                        btn.on('click', function () {
                            piece.element.popover('dispose');
                            square.empty();
                            bigBoardObject.add(new Rook(piece.x,piece.y,piece.color));
                            bigBoardObject.aterTurns();
                        });
                        div.append(btn);
                        btn = $(`<button class="btn btn-light btn-select-piece">
                                    <i class="fas fa-chess-bishop"></i>
                                </button>`);
                        btn.on('click', function () {
                            piece.element.popover('dispose');
                            square.empty();
                            bigBoardObject.add(new Bishop(piece.x,piece.y,piece.color));
                            bigBoardObject.aterTurns();
                        });
                        div.append(btn);
                
                        piece.element.popover({
                            placement: 'bottom',
                            container: 'body',
                            html: true,
                            content  : div 
                        });
                        piece.element.popover('show');
                    }else{
                        bigBoardObject.aterTurns();
                    }
                    
                    let inCheck = bigBoardObject.inCheck(bigBoardObject.turn);

                    let playCheckSound = false;
                    if(inCheck){
                        $(`.king.fg-${bigBoardObject.turn}`).parent('td').addClass('incheck');
                        playCheckSound = true ;
                    }
                    let hasAuthMoves = bigBoardObject.hasAuthMoves(bigBoardObject.turn);

                    //if can't play and check = check mate
                    if(inCheck && !hasAuthMoves){
                        playCheckSound = false;
                        checkMate.play();
                        bigBoardObject.playerWon((bigBoardObject.turn =='white'?'black' :'white'),` by checkmate`);
                    }else if(!hasAuthMoves){
                        bigBoardObject.stallMate(`No legal move left for ${bigBoardObject.turn}`);
                    }

                    if(playCheckSound){
                        check.play();
                    }

                }
            }
        }
    });
}

Board.prototype.isCheckIfMovePlayed = function (piece,x,y) {
    let king = null ;
    let isCheckNow = false ;
    for (const p of this.pieces) {
        if(p){
            if(p.constructor.name=='King'&&piece.color==p.color){
                king = p;
                break;
            }
        }
    }
    //copying old active bord
    var AllpiecesBefore = [] ;
    for (i = 0; i < this.pieces.length; i++) {
        AllpiecesBefore[i] = this.pieces[i] ;
    }


    let pieceMove = board.pieceAtSquare(x,y) ,
    indexOfDelete = -1 ;
    let pieceX = piece.x ; 
    let pieceY = piece.y ;

    piece.x = x ;
    piece.y = y ;
    if(pieceMove){
        if(pieceMove.color!=piece.color){
            indexOfDelete = AllpiecesBefore.indexOf(pieceMove) ;
            this.pieces[AllpiecesBefore.indexOf(pieceMove)] = null ;
        }
    }

    isCheckNow = this.inCheck(king.color,king.x,king.y);

    piece.x = pieceX ;
    piece.y = pieceY ;
    if(indexOfDelete!=-1){
        this.pieces[indexOfDelete] = AllpiecesBefore[indexOfDelete] ;
    }    
    return isCheckNow ;
}

Board.prototype.playerWon = function (color,reason) {
    window.gameState = 'notPlaying' ;
    this.timerWhite.pause()  ;
    this.timerBlack.pause() ;
    if(color == 'white'){
        $('.overlay').html('<div style="text-align:center;" ><b>White wins</b>'+`<br />${reason}</div>`);
    }else if(color == 'black'){
        $('.overlay').html('<div style="text-align:center;"><b>Black wins</b>'+`<br />${reason}</div>`);
    }
    $('.overlay').css('display','flex');
}

Board.prototype.pieceAtSquare = function (x,y) {
    for (const piece of this.pieces) {
        if(piece){
            if( piece.x == x
                &&
                piece.y == y
                ){
                return piece ;
            }
        }
    }
    return null ;
}

Board.prototype.stallMate = function (reason) {
    window.gameState = 'notPlaying' ;
    this.timerWhite.pause()  ;
    this.timerBlack.pause() ;
    $('.overlay').html('<div style="text-align:center;"><b>Stall Mate</b>'+`<br />${reason}</div>`);
    $('.overlay').css('display','flex');
    stallMate.play();
}
Board.prototype.inCheck = function (color,Kx,Ky) {
    let square = $(`.king.fg-${this.turn}`).parent('td');
    let attrX ,
        attrY ;
    if(!(Kx&&Ky)){
        attrX = square.attr("x") ;  
        attrY = square.attr("y") ; 
    }else{
        attrX = Kx ;  
        attrY = Ky ; 
    }
    for (const piece of this.pieces) {
        if(piece){
            if(piece.color!=color){
                if(
                    piece.constructor.name == 'Queen' ||
                    piece.constructor.name == 'Rook'  ||
                    piece.constructor.name == 'Bishop'
                    ){
                    piece.recalculateAttackingSquares(this)
                }
                if(piece.attackingSquares.exists({x:attrX,y:attrY})){
                    return  true;
                }
                
            }
        }
    }
    return  false;
}
Board.prototype.hasAuthMoves = function (color) {   
    let king = null ;
    for (const piece of this.pieces) {
        if(piece){
            if(piece.constructor.name=='King'&&piece.color==color){
                king = piece;
                break;
            }
        }
    }
    //copying old active bord
    var AllpiecesBefore = [] ;
    for (i = 0; i < this.pieces.length; i++) {
        AllpiecesBefore[i] = this.pieces[i] ;
    }
    // look only for how to prevent it to the king
    for (const piece of AllpiecesBefore) {
        if(piece){
            let oldAttacks = [] ;
            Object.assign(oldAttacks, piece.attackingSquares) ;
            pieceX = piece.x ,
            pieceY = piece.y ;
            if(piece.color==color){
                if(piece.constructor.name!='Pawn'){
                    for (const attack of oldAttacks){
                        let indexOfDelete = -1 ;
                        let p = this.pieceAtSquare(attack.x,attack.y);
                        if(p){
                            if(p.color==color){
                                continue;
                            }else{
                                indexOfDelete = AllpiecesBefore.indexOf(p) ;
                                this.pieces[AllpiecesBefore.indexOf(p)] = null ;
                            }
                        }
                        piece.x = attack.x ;
                        piece.y = attack.y ;
                        piece.recalculateAttackingSquares(this);

                        let kingX = king.x,
                            kingY = king.y;
                        if(piece.constructor.name=='King'){
                            kingX = attack.x ;
                            kingY = attack.y ;
                        }
                        if(!this.inCheck(color,kingX,kingY) ){
                            //recorrect changed data
                            piece.x = pieceX ;
                            piece.y = pieceY ;
                            piece.attackingSquares = oldAttacks ;
                            this.pieces = AllpiecesBefore ;
                            return true;
                        }
                        if(indexOfDelete!=-1){
                            this.pieces[indexOfDelete] = AllpiecesBefore[indexOfDelete] ;
                        }
                    }
                }else if(piece.constructor.name=='Pawn'){
                    let forwardOnly ;
                    if(piece.color=='black'){
                        forwardOnly = function (a,b){ return a+b; };
                    }else if(piece.color=='white'){
                        forwardOnly = function (a,b){ return a-b; };
                    }
                    
                    let pieceMove           ;
                
                    pieceMove = board.pieceAtSquare(forwardOnly(piece.x,1),piece.y);
                    piece.x = forwardOnly(piece.x,1) ;
                    if(!pieceMove){
                        if(!this.inCheck(color,king.x,king.y) ){
                            //recorrect changed data
                            piece.x = pieceX ;
                            piece.y = pieceY ;
                            piece.attackingSquares = oldAttacks ;
                            this.pieces = AllpiecesBefore ;
                            return true;
                        }
                        if( (piece.color=='black' && piece.x == 2)  || (piece.color=='white' && piece.x == 7)){
                            pieceMove = board.pieceAtSquare(forwardOnly(piece.x,2),piece.y) ; 
                            piece.x = forwardOnly(piece.x,2) ;
                            if(!pieceMove){
                                if(!this.inCheck(color,king.x,king.y) ){
                                    //recorrect changed data
                                    piece.x = pieceX ;
                                    piece.y = pieceY ;
                                    piece.attackingSquares = oldAttacks ;
                                    this.pieces = AllpiecesBefore ;
                                    return true;
                                }
                            }
                        }
                    }
                    pieceMove = board.pieceAtSquare(forwardOnly(piece.x,1),piece.y+1) ; 
                    let indexOfDelete = -1 ;
                    piece.x = forwardOnly(piece.x,1) ;
                    piece.y = piece.y+1 ;
                    if(pieceMove){
                        if(pieceMove.color!=color){
                            indexOfDelete = AllpiecesBefore.indexOf(pieceMove) ;
                            this.pieces[AllpiecesBefore.indexOf(pieceMove)] = null ;
                            if(!this.inCheck(color,king.x,king.y) ){
                                //recorrect changed data
                                piece.x = pieceX ;
                                piece.y = pieceY ;
                                piece.attackingSquares = oldAttacks ;
                                this.pieces = AllpiecesBefore ;
                                return true;
                            }
                        }
                    }
                    pieceMove = board.pieceAtSquare(forwardOnly(piece.x,1),piece.y-1) ;
                    piece.x = forwardOnly(piece.x,1) ;
                    piece.y = piece.y-1 ;
                    if(pieceMove){
                        if(pieceMove.color!=color){
                            indexOfDelete = AllpiecesBefore.indexOf(pieceMove) ;
                            this.pieces[AllpiecesBefore.indexOf(pieceMove)] = null ;
                            if(!this.inCheck(color,king.x,king.y) ){
                                //recorrect changed data
                                piece.x = pieceX ;
                                piece.y = pieceY ;
                                piece.attackingSquares = oldAttacks ;
                                this.pieces = AllpiecesBefore ;
                                return true;
                            }
                        }
                    }
                    if(indexOfDelete!=-1){
                        this.pieces[indexOfDelete] = AllpiecesBefore[indexOfDelete] ;
                    }
                }
            }
            piece.x = pieceX ;
            piece.y = pieceY ;
            piece.attackingSquares = oldAttacks ;
        }
    }
    this.pieces = AllpiecesBefore ;
    return false ;

}
Board.prototype.resetAttacks = function () {
    for (const piece of this.pieces) {
        if(piece){
            piece.recalculateAttackingSquares(this);
        }
    }
}
Board.prototype.add = function (piece) {
    this.pieces.push(piece) ;
    $(`td[x=${piece.x}][y=${piece.y}]`).html(piece.element);
}
Board.prototype.aterTurns = function () {
    $(`#game`).removeClass('role-black role-white');
    $(`.fg-${this.turn}`).draggable('destroy');
    this.turn = this.turn == 'white' ? 'black' : 'white' ;
    if(this.turn == 'white'){
        this.timerWhite.resume();
        this.timerBlack.pause();
    }else if(this.turn == 'black'){
        this.timerWhite.pause();
        this.timerBlack.resume();
    }
    $(`.fg-${this.turn}`).draggable({ 
        drag: onPieceDrag,
        stop: onPieceStopDrag,
        scroll: false 
    });
    $(`#game`).addClass(`role-${this.turn}`);
}
Board.prototype.moveTo = function (piece,square) {
    $(piece.element).css({
        top: "0px",left: "0px"
    });
    let oldPiece = ($(square).find('i')??{data:()=>{}}).data('piece') ;
    let oldIndex = this.pieces.indexOf(oldPiece);
    console.log(oldPiece);
    if(
        oldPiece
        &&
        piece.color == oldPiece.color
        &&
        piece.x == oldPiece.x
        &&
        piece.constructor.name == 'King' && oldPiece.constructor.name == 'Rook'
        ){
            if(oldPiece.y==8){
                piece.y = 7 ;
                oldPiece.y = 6 ;
            }else{
                piece.y = 3 ;
                oldPiece.y = 4 ;
            }
            let king = $(piece.element).detach() ;
            king.draggable({
                drag: onPieceDrag,
                stop: onPieceStopDrag,
                scroll: false 
            });
            piece.element = king ;

            let rook = $(oldPiece.element).detach() ;
            rook.draggable({
                drag: onPieceDrag,
                stop: onPieceStopDrag,
                scroll: false 
            });
            piece.element = rook ;
    
            $(`td[x=${piece.x}][y=${piece.y}]`).append(king);
            $(`td[x=${oldPiece.x}][y=${oldPiece.y}]`).append(rook);

            piece.recalculateAttackingSquares(this);
            oldPiece.recalculateAttackingSquares(this);

            castel.play();
            this.movesCounter = 0 ;
    }else{
        if(oldIndex!=-1){
            this.movesCounter = 0;
            this.pieces[oldIndex] = null ;
            eat.play();
            $(square).empty();
            
        }else{
            movePlayed.play();
        }

        let a = $(piece.element).detach();
        a.draggable({
            drag: onPieceDrag,
            stop: onPieceStopDrag,
            scroll: false 
        });
        piece.element = a ;

        //15 rule
        if(piece.constructor.name == 'Pawn'){
            this.movesCounter = 0;
        }

        piece.recalculateAttackingSquares(this);
        $(square).append(a);
    }

    this.movesCounter ++;
}

function Piece(x,y,color){
    this.x      = x     ;
    this.y      = y     ;
    this.color  = color ;
    this.attackingSquares = [];
    this.attackingSquares.exists = comparingObjs ;
    this.attackingSquares.pushItem = pushItem ;

    if(this.element==undefined){
        this.element  = $(`<i class="fg-${color} fas fa-pizza-slice"></i>`) ;
    }
    this.element.data('piece',this);
    this.element.draggable({ 
        drag: onPieceDrag,
        stop: onPieceStopDrag,
        scroll: false 
    });
}

Piece.prototype.isLegal = function(board,x,y) {

    // CHECK IF THE KING WILL GET A CHECK IF THIS MOVE IS GOING TO HAPPEND
    // AND RETURN FALSE
    let oldPiece = board.pieceAtSquare(x,y);
    // can't eat same color
    if(oldPiece){
        if(oldPiece.color == this.color)
            return false ;
    }
    return true ;
}

function Queen(x,y,color){
    this.element  = $(`<i class="fg-${color} fas fa-chess-queen"></i>`) ;
    Piece.call(this, x,y,color );
}

Queen.prototype.isLegal = function(board,x,y) {
    let oldPiece = board.pieceAtSquare(x,y);
    // can't eat same color
    if(oldPiece){
        if(oldPiece.color == this.color)
            return false ;
    }
    if(diff(this.y,y) == diff(this.x ,x)){
        // musn't have anything in between
        if(this.x < x && this.y < y){
            for (let i = this.x+1 ; i < x ; i++) {
                for (let j = this.y+1 ; j < y ; j++) {
                    if(diff(j,y) == diff(i,x)){
                        let oldPiece = board.pieceAtSquare(i,j);
                        if(oldPiece){
                            return false;
                        }
                    }
                }
            }
        }else if(this.x > x && this.y > y){
            for (let i = this.x - 1 ; i > x ; i--) {
                for (let j = this.y - 1 ; j > y ; j--) {
                    if(diff(j,y) == diff(i,x)){
                        let oldPiece = board.pieceAtSquare(i,j);
                        if(oldPiece){
                            return false;
                        }
                    }
                }
            }
        }else if(this.x < x && this.y > y){
            for (let i = this.x + 1 ; i < x ; i++) {
                for (let j = this.y - 1 ; j > y ; j--) {
                    if(diff(j,y) == diff(i,x)){
                        let oldPiece = board.pieceAtSquare(i,j);
                        if(oldPiece){
                            return false;
                        }
                    }
                }
            }
        }else if(this.x > x && this.y < y){
            for (let i = this.x-1 ; i > x ; i--) {
                for (let j = this.y+1 ; j < y ; j++) {
                    if(diff(j,y) == diff(i,x)){
                        let oldPiece = board.pieceAtSquare(i,j);
                        if(oldPiece){
                            return false;
                        }
                    }
                }
            }
        }else{
            return false;
        }
    }else if(!(this.y!=y && this.x!=x)){
        if(this.x<x){
            for (let i = this.x+1 ; i < x ; i++) {
                let oldPiece = board.pieceAtSquare(i,this.y);
                if(oldPiece){
                    return false;
                }
            }
        }else if(this.y<y){
            for (let j = this.y+1 ; j < y ; j++) {
                let oldPiece = board.pieceAtSquare(this.x,j);
                if(oldPiece){
                    return false;
                }
            }
        }else if(this.x>x){
            for (let i = this.x-1 ; i > x ; i--) {
                let oldPiece = board.pieceAtSquare(i,this.y);
                if(oldPiece){
                    return false;
                }
            }
        }else if(this.y>y){
            for (let j = this.y-1 ; j > y ; j--) {
                let oldPiece = board.pieceAtSquare(this.x,j);
                if(oldPiece){
                    return false;
                }
            }
        }else{
            return false;
        }
    }else{
        return false;
    }


    return true ;
};

Queen.prototype.recalculateAttackingSquares = function(board) {
    this.attackingSquares = [];
    this.attackingSquares.exists = comparingObjs ;
    this.attackingSquares.pushItem = pushItem ;

    let oldPiece1 ,
        oldPiece2 ,
        oldPiece3 ,
        oldPiece4 ;

    for (let inc = 1 ; inc <= 8 ; inc++) {
        if( oldPiece1 == undefined){
            oldPiece1 = board.pieceAtSquare(this.x+inc,this.y-inc);
            this.attackingSquares.pushItem({x:this.x+inc,y:this.y-inc}) ;
        }
        if( oldPiece2 == undefined){
            oldPiece2 = board.pieceAtSquare(this.x-inc,this.y+inc);
            this.attackingSquares.pushItem({x:this.x-inc,y:this.y+inc}) ;
        }
        if( oldPiece3 == undefined){
            oldPiece3 = board.pieceAtSquare(this.x-inc,this.y-inc);
            this.attackingSquares.pushItem({x:this.x-inc,y:this.y-inc}) ;
        }
        if( oldPiece4 == undefined){
            oldPiece4 = board.pieceAtSquare(this.x+inc,this.y+inc);
            this.attackingSquares.pushItem({x:this.x+inc,y:this.y+inc}) ;
        }
    }
    
    for (let i = this.x+1 ; i <= 8 ; i++) {
        let oldPiece = board.pieceAtSquare(i,this.y);
        this.attackingSquares.pushItem({x:i,y:this.y}) ;
        if(oldPiece){
            break;
        }
    }
    for (let j = this.y+1 ; j <= 8 ; j++) {
        let oldPiece = board.pieceAtSquare(this.x,j);
        this.attackingSquares.pushItem({x:this.x,y:j}) ;
        if(oldPiece){
            break;
        }
    }
    for (let i = this.x-1 ; i >= 1 ; i--) {
        let oldPiece = board.pieceAtSquare(i,this.y);
        this.attackingSquares.pushItem({x:i,y:this.y}) ;
        if(oldPiece){
            break;
        }
    }
    for (let j = this.y-1 ; j >= 1 ; j--) {
        let oldPiece = board.pieceAtSquare(this.x,j);
        this.attackingSquares.pushItem({x:this.x,y:j}) ;
        if(oldPiece){
            break;
        }
    }

}

function Pawn(x,y,color){
    this.element  = $(`<i class="fg-${color} fas fa-chess-pawn"></i>`) ;
    Piece.call(this, x,y,color );
}
Pawn.prototype.recalculateAttackingSquares = function(board) {
    this.attackingSquares = [] ;
    this.attackingSquares.exists = comparingObjs ;
    this.attackingSquares.pushItem = pushItem ;
    
    let forwardOnly ; 
    if(this.color=='black'){
        forwardOnly = function (a,b){
            return a+b;
        };
    }else if(this.color=='white'){
        forwardOnly = function (a,b){
            return a-b;
        };
    }

    if(this.y == 8){
        this.attackingSquares.pushItem({x:forwardOnly(this.x,1),y:this.y-1});
    }else if(this.y == 1){
        this.attackingSquares.pushItem({x:forwardOnly(this.x,1),y:this.y+1});
    }else{
        this.attackingSquares.pushItem({x:forwardOnly(this.x,1),y:this.y+1});
        this.attackingSquares.pushItem({x:forwardOnly(this.x,1),y:this.y-1});
    }
    
}

Pawn.prototype.isLegal = function(board,x,y) {
    //check if king is in check
    let oldPiece = board.pieceAtSquare(x,y);
    // can't eat same color
    if(oldPiece){
        if(oldPiece.color == this.color)
            return false ;
    }

    let forwardOnly ; 
    if(this.color=='black'){
        forwardOnly = function (a,b){
            return a+b;
        };
    }else if(this.color=='white'){
        forwardOnly = function (a,b){
            return a-b;
        };
    }
    if(this.y==y && !oldPiece){
        if(forwardOnly(this.x,1) == x){
            
        }else if(!this.firstMoveDone && (forwardOnly(this.x,2)==x && !board.pieceAtSquare(forwardOnly(this.x,1),y) )){
            
        }else{
            return false ;
        }
    }else if( this.y-1==y && forwardOnly(this.x,1) == x && oldPiece){

    }else if( this.y+1==y && forwardOnly(this.x,1) == x && oldPiece){

    }else{
        return false;
    }
        
    return true ;
}

function King(x,y,color){
    this.element  = $(`<i class="fg-${color} king fas fa-chess-king"></i>`) ;
    Piece.call( this,x,y,color );
}
King.prototype.recalculateAttackingSquares = function(board) {
    this.attackingSquares = [] ;
    this.attackingSquares.exists = comparingObjs ;
    this.attackingSquares.pushItem = pushItem ;
    
    if((this.x+1)<9){
        if((this.y-1)>0){
            this.attackingSquares.pushItem({x:this.x+1,y:this.y-1}) ;
        }
        this.attackingSquares.pushItem({x:this.x+1,y:this.y})   ;
        if((this.y+1)<9){
            this.attackingSquares.pushItem({x:this.x+1,y:this.y+1}) ;
        }
    }
    if((this.x-1)>0){
        if((this.y-1)>0){
            this.attackingSquares.pushItem({x:this.x-1,y:this.y-1}) ;
        }
        this.attackingSquares.pushItem({x:this.x-1,y:this.y})   ;
        if((this.y+1)<9){
            this.attackingSquares.pushItem({x:this.x-1,y:this.y+1}) ;
        }
    }
    this.attackingSquares.pushItem({x:this.x,y:this.y-1})   ;
    this.attackingSquares.pushItem({x:this.x,y:this.y+1})   ;

}
King.prototype.isLegal = function(board,x,y) {
    let oldPiece = board.pieceAtSquare(x,y);
    // can't eat same color
    if(oldPiece){
        if(oldPiece.color == this.color){
            //can't castle in check and can't when a square is attacked ! you can if the rook is attacked so no worried looking if that square is attacked ! now only 
            /*
                    LONG CASTLING :
                        Y2 
                        Y3 
                        Y4
                    SHORT CASTLING :
                        Y6 
                        Y7 
                    NOT ATTACKED BY OPPOSITE COLORS !
                */
            if(
                oldPiece.constructor.name == 'Rook'
                &&
                !oldPiece.firstMoveDone
                &&
                !this.firstMoveDone
                &&
                this.x == oldPiece.x
            ){
                if( oldPiece.y >  this.y){ // SHORT CASTELING
                    if(
                        board.pieceAtSquare(this.x,6) 
                            || 
                        board.pieceAtSquare(this.x,7) 
                    ){
                        return false ;
                    }else{
                        for (const posiblPiece of board.pieces) {
                            if(posiblPiece){
                                if(posiblPiece.color!=this.color){
                                    if(
                                        posiblPiece.constructor.name == 'Queen' ||
                                        posiblPiece.constructor.name == 'Rook'  ||
                                        posiblPiece.constructor.name == 'Bishop'
                                        ){
                                            posiblPiece.recalculateAttackingSquares(board);
                                    }
                                    if(
                                        posiblPiece.attackingSquares.exists({x:this.x,y:6})
                                        ||
                                        posiblPiece.attackingSquares.exists({x:this.x,y:7})
                                        ){
                                        return  false;
                                    }
                                }
                            }
                        }
                    }
                }else{// LONG CASTELING
                    if( 
                        board.pieceAtSquare(this.x,4)
                            ||
                        board.pieceAtSquare(this.x,3)
                            ||
                        board.pieceAtSquare(this.x,2)
                    ){
                        return false ;
                    }else{
                        for (const posiblPiece of board.pieces) {
                            if(posiblPiece){
                                if(posiblPiece.color!=this.color){
                                    if(
                                        posiblPiece.constructor.name == 'Queen' ||
                                        posiblPiece.constructor.name == 'Rook'  ||
                                        posiblPiece.constructor.name == 'Bishop'
                                        ){
                                            posiblPiece.recalculateAttackingSquares(board);
                                    }
                                    if(
                                        posiblPiece.attackingSquares.exists({x:this.x,y:2})
                                        ||
                                        posiblPiece.attackingSquares.exists({x:this.x,y:3})
                                        ||
                                        posiblPiece.attackingSquares.exists({x:this.x,y:4})
                                        ){
                                        return  false;
                                    }
                                }
                            }
                        }
                    }
                }
                return true ;
            }
            return false ;
        }
    }
    
    if(
        (this.x+1 == x || this.x-1 == x || this.x == x) 
        &&
        (this.y+1 == y || this.y-1 == y || this.y == y)
    ){

    }else{
        return false;
    }

    return true ;
}

function Bishop(x,y,color){
    this.element  = $(`<i class="fg-${color} fas fa-chess-bishop"></i>`) ;
    Piece.call( this,x,y,color );
}
Bishop.prototype.recalculateAttackingSquares = function(board) {
    this.attackingSquares = [] ;
    this.attackingSquares.exists = comparingObjs ;
    this.attackingSquares.pushItem = pushItem ;

    let oldPiece1 ,
        oldPiece2 ,
        oldPiece3 ,
        oldPiece4 ;

    for (let inc = 1 ; inc <= 8 ; inc++) {
        if( oldPiece1 == undefined){
            oldPiece1 = board.pieceAtSquare(this.x+inc,this.y-inc);
            this.attackingSquares.pushItem({x:this.x+inc,y:this.y-inc}) ;
        }
        if( oldPiece2 == undefined){
            oldPiece2 = board.pieceAtSquare(this.x-inc,this.y+inc);
            this.attackingSquares.pushItem({x:this.x-inc,y:this.y+inc}) ;
        }
        if( oldPiece3 == undefined){
            oldPiece3 = board.pieceAtSquare(this.x-inc,this.y-inc);
            this.attackingSquares.pushItem({x:this.x-inc,y:this.y-inc}) ;
        }
        if( oldPiece4 == undefined){
            oldPiece4 = board.pieceAtSquare(this.x+inc,this.y+inc);
            this.attackingSquares.pushItem({x:this.x+inc,y:this.y+inc}) ;
        }
    }
}   
Bishop.prototype.isLegal = function(board,x,y) {
    let oldPiece = board.pieceAtSquare(x,y);
    // can't eat same color
    if(oldPiece){
        if(oldPiece.color == this.color)
            return false ;
    }
    
    if(diff(this.y,y) == diff(this.x ,x)){

    }else{
        return false ;
    }
    

    // musn't have anything in between
    if(this.x < x && this.y < y){
        for (let i = this.x+1 ; i < x ; i++) {
            for (let j = this.y+1 ; j < y ; j++) {
                if(diff(j,y) == diff(i,x)){
                    let oldPiece = board.pieceAtSquare(i,j);
                    if(oldPiece){
                        return false ;
                    }
                }
            }
        }
    }else if(this.x > x && this.y > y){
        for (let i = this.x - 1 ; i > x ; i--) {
            for (let j = this.y - 1 ; j > y ; j--) {
                if(diff(j,y) == diff(i,x)){
                    let oldPiece = board.pieceAtSquare(i,j);
                    if(oldPiece){
                        return false ;
                    }
                }
            }
        }
    }else if(this.x < x && this.y > y){
        for (let i = this.x + 1 ; i < x ; i++) {
            for (let j = this.y - 1 ; j > y ; j--) {
                if(diff(j,y) == diff(i,x)){
                    let oldPiece = board.pieceAtSquare(i,j);
                    if(oldPiece){
                        return false ;
                    }
                }
            }
        }
    }else if(this.x > x && this.y < y){
        for (let i = this.x-1 ; i > x ; i--) {
            for (let j = this.y+1 ; j < y ; j++) {
                if(diff(j,y) == diff(i,x)){
                    let oldPiece = board.pieceAtSquare(i,j);
                    if(oldPiece){
                        return false ;
                    }
                }
            }
        }
    }else{
        return false ;
    }

    return true ;
}

function Rook(x,y,color){
    this.element  = $(`<i class="fg-${color} fas fa-chess-rook"></i>`) ;
    Piece.call( this,x,y,color );
}
Rook.prototype.recalculateAttackingSquares = function(board) {
    this.attackingSquares = [] ;
    this.attackingSquares.exists = comparingObjs ;
    this.attackingSquares.pushItem = pushItem ;

    for (let i = this.x+1 ; i <= 8 ; i++) {
        let oldPiece = board.pieceAtSquare(i,this.y);
        this.attackingSquares.pushItem({x:i,y:this.y}) ;
        if(oldPiece){
            break;
        }
    }
    for (let j = this.y+1 ; j <= 8 ; j++) {
        let oldPiece = board.pieceAtSquare(this.x,j);
        this.attackingSquares.pushItem({x:this.x,y:j}) ;
        if(oldPiece){
            break;
        }
    }
    for (let i = this.x-1 ; i >= 1 ; i--) {
        let oldPiece = board.pieceAtSquare(i,this.y);
        this.attackingSquares.pushItem({x:i,y:this.y}) ;
        if(oldPiece){
            break;
        }
    }
    for (let j = this.y-1 ; j >= 1 ; j--) {
        let oldPiece = board.pieceAtSquare(this.x,j);
        this.attackingSquares.pushItem({x:this.x,y:j}) ;
        if(oldPiece){
            break;
        }
    }
}

Rook.prototype.isLegal = function(board,x,y) {
    let oldPiece = board.pieceAtSquare(x,y);
    // can't eat same color
    if(oldPiece){
        if(oldPiece.color == this.color)
            return false ;
    }
    if(this.y!=y && this.x!=x){
        return false ;
    }

    if(this.x<x){
        for (let i = this.x+1 ; i < x ; i++) {
            let oldPiece = board.pieceAtSquare(i,this.y);
            if(oldPiece){
                return false ;
            }
        }
    }else if(this.y<y){
        for (let j = this.y+1 ; j < y ; j++) {
            let oldPiece = board.pieceAtSquare(this.x,j);
            if(oldPiece){
                return false ;
            }
        }
    }else if(this.x>x){
        for (let i = this.x-1 ; i > x ; i--) {
            let oldPiece = board.pieceAtSquare(i,this.y);
            if(oldPiece){
                return false ;
            }
        }
    }else if(this.y>y){
        for (let j = this.y-1 ; j > y ; j--) {
            let oldPiece = board.pieceAtSquare(this.x,j);
            if(oldPiece){
                return false ;
            }
        }
    }else{
        return false ;
    }


    return true ;
}

function Knight(x,y,color){
    this.element  = $(`<i class="fg-${color} fas fa-chess-knight"></i>`) ;
    Piece.call( this,x,y,color );
}
Knight.prototype.recalculateAttackingSquares = function(board) {
    this.attackingSquares = [] ;
    this.attackingSquares.exists = comparingObjs ;
    this.attackingSquares.pushItem = pushItem ;

    this.attackingSquares.pushItem({ x: (this.x - 1) , y: (this.y - 2) }) ;
    this.attackingSquares.pushItem({ x: (this.x - 1) , y: (this.y + 2) }) ;
    this.attackingSquares.pushItem({ x: (this.x + 1) , y: (this.y - 2) }) ;
    this.attackingSquares.pushItem({ x: (this.x + 1) , y: (this.y + 2) }) ;
    this.attackingSquares.pushItem({ x: (this.x - 2) , y: (this.y - 1) }) ;
    this.attackingSquares.pushItem({ x: (this.x - 2) , y: (this.y + 1) }) ;
    this.attackingSquares.pushItem({ x: (this.x + 2) , y: (this.y - 1) }) ;
    this.attackingSquares.pushItem({ x: (this.x + 2) , y: (this.y + 1) }) ;
    
}
Knight.prototype.isLegal = function(board,x,y) {
    //check if king is in check
    let oldPiece = board.pieceAtSquare(x,y);
    // can't eat same color
    if(oldPiece){
        if(oldPiece.color == this.color)
            return false ;
    }

    if((this.x - 1 == x || this.x + 1 == x ) && ( this.y - 2 == y || this.y + 2 == y)){
        return true ;
    }
    else if( (this.x - 2 == x || this.x + 2 == x) && (this.y - 1 == y || this.y + 1 == y) ){
        return true ;
    }else{
        return false ;
    }

    return true ;
}

// Created By Gaadi OUSSAMA .