'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const winston = require('winston');
const routerLogger = winston.loggers.get('router');
const router = require('./routing/');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const dmmAuthenticator = require('./middleware/dmm-passport');
const morgan = require('morgan');
const app = express();

setupMiddleware();
setupTemplateEngine();
setupDefaultLocalResponseHeader();
setupRouting();


function setupDefaultLocalResponseHeader() {
	app.use(function(req, res, next) {
	   res.set('X-Powered-By', 'ModColle');
	   next();
	});
}

function setupRouting() {
	app.use('/', router);
}

function setupMiddleware() {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(session({
		secret: 'shhhh',
		resave: true,
		saveUninitialized: false
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	passport.use(new LocalStrategy(dmmAuthenticator.authenticate));
	passport.serializeUser(dmmAuthenticator.serialize);
	passport.deserializeUser(dmmAuthenticator.deserialize);

	routerLogger.stream = {
	    write: function(message, encoding){
	        routerLogger.info(message);
	    }
	};
	app.use(morgan('combined', {stream: routerLogger.stream}))
}

function setupTemplateEngine() {
	var engineName = 'hbs';
	var templateExtension = 'hbs';
	var baseDirView = 'src/views';

	var options = {
		defaultLayout: 'defaultLayout', 
		extname: templateExtension,

		layoutsDir: baseDirView + '/layouts',
		partialsDir: baseDirView + '/partials'
	}
	var hbs = expressHandlebars.create(options);

	app.engine(engineName, hbs.engine);
	app.set('views', baseDirView);
	app.set('view engine', engineName);
}

module.exports = exports = app;