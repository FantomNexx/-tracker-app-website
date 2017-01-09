var canvas  = document.getElementById( 'bezier' );
var context = canvas.getContext( '2d' );
var formula = {};

formula.getPointOnLine = function( shift, points ){
  return [
    (points[1][0] - points[0][0]) * (shift / 100) + points[0][0],
    (points[1][1] - points[0][1]) * (shift / 100) + points[0][1]
  ];
};

formula.getPointOnCurve = function( shift, points ){
  if( points.length == 2 ){
    return this.getPointOnLine( shift, points );
  }
  var pointsPP = [];
  for( var i = 1; i < points.length; i++ ){
    pointsPP.push( this.getPointOnLine( shift, [
      points[i - 1],
      points[i]
    ] ) );
  }
  return this.getPointOnCurve( shift, pointsPP );
};

var points2 = [
  [10, 50],
  [40, -40],
  [190, 180],
  [40, -60],
  [80, 130],
  [10, 50]
];

var points = [
  [0, 0],
  [0, 25],
  [40, 70],
  [180, 70],
  [150, 150],
  [200, 200],
  [300, 200]
];


var points3 = [
  [0, 0],
  [0, 25],
  [40, 70]
];




context.strokeStyle = '#00cc00';

var shift = 0;
var step  = 10;

for( var idx = 0; idx <= 7; idx++ ){
  context.beginPath();

  context.moveTo( points[0][0], points[0][1] );

  if( shift > 100 ){
    //shift = 100;
    break;
  }

  for( var i = 0; i <= shift; i += step ){
    var coord = formula.getPointOnCurve( i, points );
    context.lineTo( coord[0], coord[1] );
    context.strokeRect( coord[0], coord[1], 5, 5 );
  }
  context.stroke();
  context.closePath();

  if( shift <= 100 ){
    shift += step;
  }else{
    break;
  }
  
}

context.strokeStyle = '#ff0000';
for( var j = 0; j < points.length; j++ ){
  context.strokeRect( points[j][0], points[j][1], 5, 5 );
}//for