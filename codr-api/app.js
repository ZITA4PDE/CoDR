'use strict';

require('dotenv').load();

const fs = require('fs');
const SwaggerExpress = require('swagger-express-mw');
const express = require('express');
const session = require('express-session');
const app = express();
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const db = require('./api/database');
const sqlStatements = require('./api/sql-statements');

module.exports = app;

var samlStrategy = new SamlStrategy(
    {
        callbackUrl:    process.env.SAML_CALLBACK_URL || '/api/login/callback',
        entryPoint:     process.env.SAML_ENTRY_POINT || 'http://localhost:8080/SingleSignOnService',
        issuer:         process.env.SAML_ISSUER || 'http://mock-idp',
        // Service Provider private key
        decryptionPvk:  fs.readFileSync(__dirname + '/config/cert/key.pem', 'utf8'),
        // Service Provider Certificate
        privateCert:    fs.readFileSync(__dirname + '/config/cert/key.pem', 'utf8'),
        // Identity Provider's public key
        cert:           fs.readFileSync(__dirname + '/config/cert/idp_cert.pem', 'utf8'),
        identifierFormat:   'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified'
    },
    function(profile, done) {
        (async() => {
            const client = await db.connect();
            var userId = profile['urn:mace:dir:attribute-def:uid']
            var dbId;
            var dbLevel;

            try {
                await client.query(sqlStatements.createUserIfNotExists, [userId]); 
                const result = await client.query(sqlStatements.getUserByName, [userId]);
                dbId = result.rows[0].id;
                dbLevel = result.rows[0].user_level;
            } finally {
                client.release();
            }

            return done(null, {
                id: dbId,
                user_level: dbLevel,
                display_name: userId
            });
        })().catch(e => {
            console.log(e.stack);
            return done(err);
        });
    }
);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
    
passport.use(samlStrategy);

var config = {
    appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
    if (err) { 
        throw err; 
    }

    app.use(cors({
        origin: true,
        credentials: true,
    }));

    app.use(session({ 
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(multer({ dest: '/tmp/uploads' }).any());

    if (app.get('env') !== 'development') {
        console.log('Non-development environment, enabling authentication middleware ..');
        app.get('/api/login',
            passport.authenticate('saml', { successRedirect: '/', failureRedirect: '/api/login' })
        );

        app.get('/api/logout', function(req, res) {
            req.logout();
            res.redirect('http://130.89.7.104:3000');
        });

        app.post('/api/login/callback',
            passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }), function(req, res) {
                res.redirect('http://130.89.7.104:3000');
            }
        );

        app.get('/api/metadata', function(req, res) {
            res.type('application/xml');
            res.status(200).send(
                samlStrategy.generateServiceProviderMetadata(
                    fs.readFileSync(__dirname + '/config/cert/cert.pem', 'utf8')
                )
            );
        });
        
        app.use(function(req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            } else {
                res.status(401).send();
            }
        });
    } else {
        var user = '{"id":0,"user_level":0,"display_name":"Developer"}';
        console.log('Development environment, logging in as ' + user + ' ..');

        app.use(function(req, res, next) {
            req.user = JSON.parse(user);
            return next();
        });
    }
    
    // Install middleware
    swaggerExpress.register(app);
    // Install response validation listener (this will only be called if there actually are any errors or warnings)
    swaggerExpress.runner.on('responseValidationError', function(validationResponse, request, response) {
        // Log your validationResponse here.
        console.error(validationResponse.errors);
    });

    var port = process.env.PORT || 10010;
    app.listen(port);
});
