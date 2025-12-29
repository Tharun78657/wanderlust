const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const Usercontroller = require('../controllers/users.js');

router
    .route('/signup')
    .get( Usercontroller.renderSignupForm)
    .post( wrapAsync(Usercontroller.signup ));

router  
    .route('/login')
    .get( Usercontroller.renderLoginForm)
    .post( saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true,}) ,Usercontroller.login);


router.get("/logout", Usercontroller.logout);

module.exports = router;