var express = require('express');

var app = express();

var handlebars = require('express3-handlebars').create({
        defaultLayout: 'main',
        helpers:{
            section: function(name, options){
                if(!this._section) this._section = {};
                this._section[name] = options.fn(this);
                return null;
            }
        }
    });

app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');

//Added on chapter 8.1 begin
app.use(require('body-parser')());

app.get('/newsletter', function(req, res){
    res.render('newsletter', {csrf: 'CSRF token goes here'});
});

// This is the redirect way. Added in chapter 8.1
// app.post('/process', function(req, res){
//     console.log('Form(from queryString): ' + req.query.form);
//     console.log('CSRF token(from hidden form field): ' + req.body._csrf);
//     console.log('Name (from visible form field): ' + req.body.name);
//     console.log('Email (from visible form field): ' + req.body.email);
//     res.redirect(303, '/thank-you');
// });

app.get('/thank-you', function(req, res){
    res.render('thankyou');
});
//Added on chapter 8.1 end

// Added in chapter 8.2 begin
app.get('/newsletter-ajax', function(req, res){
    res.render('newsletter-ajax', {csrf: 'CSRF token goes here'});
});

// This is AJAX way, added in chapter 8.3
app.post('/process', function(req, res){
    if(req.xhr || req.accepts('json,html') === 'json'){
        //如果错误发生， 应该发送{error: 'error description'}
        console.log('AJAX')
        res.send({success: true});
    }else{
        //如果发生错误，应该重定向到错误页面
        console.log(req.xhr);
        console.log(req.accepts('json,html'));
        console.log('redirect');
        res.redirect(303, '/thank-you');
    }
});
// Added in chapter 8.2 end

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

app.get('/jquery-test', function(req, res){
    res.render('jquerytest');
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

