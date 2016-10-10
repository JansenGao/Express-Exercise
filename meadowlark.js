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

// Added in chapter 9.2 - Cookie, begin
var credentials = require('./credentials.js');
app.use(require('cookie-parser')(credentials.cookieSecret));
// Added in chapter 9.2 - Cookie, end
// Added in chapter 9.4 - Session, begin
app.use(require('express-session')({
                                        resave: false,
                                        saveUninitialized: false,
                                        secret: credentials.sessionKey,
                                    }));
// Added in chapter 9.4 - Session, end

//Begin route
/// Added in chapter 9.5, begin
app.use(function(req, res, next){
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});
/// Added in chapter 9.5, end

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
        // Added in chapter 9.2 - Cookie, begin
        res.cookie('monster', 'nom nom');
        res.cookie('signed_monster', 'nom nom', {signed: true});
        // Added in chapter 9.2 - Cookie, end
        res.render('home');
});

app.get('/jquery-test', function(req, res){
    res.render('jquerytest');
});
    
app.get('/about', function(req, res){
        //var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        res.render('about', {fortune: fortune.getFortune()});
});

/// Added in chapter 9.5, begin
var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// for now, we're mocking NewsletterSignup:
function NewsletterSignup(){
}
NewsletterSignup.prototype.save = function(cb){
    cb();
};

app.post('/newsletter', function(req, res){
    var name = req.body.name || '', email = req.body.email || '';
    if(! email.match(VALID_EMAIL_REGEX)){
        if(req.xhr) return res.json({error: 'Invalid name email address.'});
        req.session.flash = {
                            type: 'danger',
                            intro: 'Validation error!',
                            message: 'The email address you entered was not valid.',
                            };
        return res.redirect(303, '/newsletter/archive');
    };

    new NewsletterSignup({name: name, email: email}).save(function(err){
        if(err){
            if(req.xhr) return res.json({error: 'Database error.'});
            req.session.flash = {
                                type: 'danger',
                                intro: 'Database error!',
                                message: 'There was a database error; please try again later.',
                                };
            return res.redirect(303, '/newsletter/archive');
        }
        if(req.xhr) return res.json({success: true});
        req.session.flash = {
                                type: 'success',
                                intro: 'Thank you',
                                message: 'You have now been signed up for the newsletter.',
                            };
        return res.redirect(303, 'newsletter/archive');
    });
});

app.get('/newsletter/archive', function(req, res){
    res.render('newsletter/archive');
});
/// Added in chapter 9.5, end


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

