var http = require('http');

// http.createServer(function(req, res){
// 	res.writeHead(200, {'Content-Type': 'text/html'});
// 	res.end('Hello World');
// }).listen(3000);

// console.log('Server started on localhost:3000; press Ctrl-C to terminate...');

http.createServer(function(req, res){
	//规范化url，去掉查询字符串、可选的反斜杠，并把它变成小写
	var path = req.url.replace(/\/?(?: \?. *)? $/, '').toLowerCase();
	switch(path){
		case '':
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('Homepage');
			break;
		case '/about':
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('About');
			break;
		default:
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('Not found');
			break;
	}
}).listen(3000);

console.log('Server started on localhost:3000; press Ctrl-C to terminate...');
