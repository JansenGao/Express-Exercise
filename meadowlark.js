var express = require('express');

var app = express();

var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});

app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');

var fortune = require('./lib/fortune.js');

function getWeatherData(){
    return{
        locations: [
            {
                name: "Portland",
                forcastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: "Bend",
                forcastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forcastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}

// var fortunes = [
// "Conquer your fear or they will conquer you.",
// "Rivers need springs.",
// "Do not fear what you don't know.",
// "You will have a pleasant surprise.",
// "Whenever possible, keep it simple."
// ];


//设置路由
app.use(function(req,res,next){
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    //如果有即显消息，把它传到上下文中，然后清除它
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = getWeatherData();
	next();
})

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
        res.render('home');
});
    
app.get('/about', function(req, res){
        //var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        res.render('about', {fortune: fortune.getFortune()});
});

app.use(function(req, res, next){
        res.status(404);
        res.render('404');
});

app.use(function(err, req, res, next){
        console.error(err.stack);
        res.status(500);
        res.render('500');
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; prss Ctrl-C to terminate.');
});

