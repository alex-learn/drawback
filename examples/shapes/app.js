// Expose modules in ./support for demo purposes
require.paths.unshift(__dirname + '/../../support');

/*** Module dependencies. ***/
var express = require('express')
  ,  drawback = require(__dirname + '/../../lib/drawback');

// Path to our public directory
var pub = __dirname + '/public';

var app = express.createServer(
  express.compiler({src: pub, enable: ['sass']}),
  express.staticProvider(pub)
);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


app.get('/', function(req, res){
  res.render('partials/shapes', {});
});

// rendering server side
app.get('/draw/linealBallChart', function(req, res){
  var dataUrl = req.query.url
    ,  forceDownload = req.query.forceDownload
    ,  dims = req.query.dims || {}
})

app.listen(3000);
console.log('Express app started on port 3000');
