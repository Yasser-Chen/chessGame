$('.overlay').css('display','flex');

$("#playerIncrementInput , #playerTimeInput").on('input',function (e) {
  $(".is-invalid").removeClass('is-invalid');
  window.timeSetted = +$("#playerTimeInput").val()      ;
  window.increment  = +$("#playerIncrementInput").val() ;

  if(isNaN(window.timeSetted) || !(20 < window.timeSetted  && window.timeSetted <= (60*60)  ) ){
    $("#playerTimeInput").addClass('is-invalid');
  }

  if(isNaN(window.increment) || !(0 <= window.increment  && window.increment <= 10  ) ){
    $("#playerIncrementInput").addClass('is-invalid');
  }

});


function initGame(){
  $(".is-invalid").removeClass('is-invalid');
  let isValid = true ;
  
  window.timeSetted = +$("#playerTimeInput").val()      ;
  window.increment  = +$("#playerIncrementInput").val() ;

  if(isNaN(window.timeSetted) || !(20 < window.timeSetted  && window.timeSetted <= (24*60*60)  ) ){
    $("#playerTimeInput").addClass('is-invalid');
    isValid = false;
  }

  if(isNaN(window.increment) || !(0 <= window.increment  && window.increment <= 10  ) ){
    $("#playerIncrementInput").addClass('is-invalid');
    isValid = false;
  }

  if(isValid){
    window.board = new Board($("#board")) ;
  
    let i = 0;//the first tr is useless
    for( let row of board.board.find(`tr`)  ){
      let j = 1 ;
      for( let square of $(row).find('td') ){
          $(square).attr('x',i);
          $(square).attr('y',j);
          j++;
      }
      i++ ;
    }
  
    for (let i = 1; i <= 8 ; i++) {
      board.add(new Pawn(2,i,'black'));
      board.add(new Pawn(7,i,'white'));
    }
  
  
    board.add(new King(8,5,'white'));
    board.add(new King(1,5,'black'));
  
  
    board.add(new Queen(8,4,'white'));
    board.add(new Queen(1,4,'black'));
  
  
    board.add(new Bishop(8,6,'white'));
    board.add(new Bishop(8,3,'white'));
    board.add(new Bishop(1,3,'black'));
    board.add(new Bishop(1,6,'black'));
  
  
    board.add(new Rook(8,8,'white'));
    board.add(new Rook(8,1,'white'));
    board.add(new Rook(1,8,'black'));
    board.add(new Rook(1,1,'black'));
  
  
    board.add(new Knight(8,2,'white'));
    board.add(new Knight(8,7,'white'));
    board.add(new Knight(1,7,'black'));
    board.add(new Knight(1,2,'black'));
  
    board.resetAttacks();
  }
}



function showSquaresQueen(){
  var arr = {} ;
  for(var a of board.pieces ){
    ((a??{}).attackingSquares ?? []).forEach(function(e){
      if(a.constructor.name=='Queen' && a.color=='white'){
        arr[`${e.x}_${e.y}`]=$(`td[x=${e.x}][y=${e.y}]`)[0];
      } 
    });
  }
  console.log(arr);
}

// var FLIP= true;
// function animateRotate() {
//   var $elem = $('i, #board');
  
//   let x = 180 ,
//       y = 0 ;

//   if(FLIP){ x = 0; y = 180; FLIP = false; }
//   else{ FLIP = true ; }

//   $({deg: x}).animate({deg: y}, {
//       duration: 1000,
//       step: function(now) {
//           $elem.css({
//               transform: 'rotate(' + now + 'deg)'
//           });
//       }
//   });
// }