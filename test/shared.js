var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');

var server;
var serverUsers = 0;

(function(){
    beforeAll(function(done) {

        var serve = serveStatic('test/fixtures', {'index': ['index.html', 'index.htm']});

        server = http.createServer(function(req, res){
            var final = finalhandler(req, res);
            serve(req, res, final)
        });

        server.listen(3001);

        done();
    });

    afterAll(function() {
      server.close();
      server = null;
    });
})();