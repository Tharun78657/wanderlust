require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require('./models/user');
const Booking = require('./models/booking'); // Add this line
const { isLoggedIn } = require("./middleware");
const Listing = require("./models/listing");

const listingRouter = require('./routes/listing');
const reviewRouter = require('./routes/review');
const userRouter = require('./routes/user');
const bookingRouter = require('./routes/booking');



// Connecting mongodb with our app
// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/wanderlust';

main().then(() => {
  console.log('Connected to DB');
}).catch((err) => {
  console.log("DB Connection Error:");
  console.log(err);
})


async function main() {
  console.log("Attempting to connect to DB...");
  // console.log("DB URL: " + dbUrl); // Be careful not to log full credentials in production!
  await mongoose.connect(dbUrl);
}




// setting views

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// handling add form req.body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET || 'thisshouldbeabettersecret',
  },
  touchAfter: 24 * 3600,
});
const sessionOptions = {
  store,
  secret: process.env.SECRET || 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


app.get("/listings/search", async (req, res) => {
  const { query } = req.query; // Get the search query from the URL
  const listings = await Listing.find({
    title: { $regex: query, $options: "i" } // Search for listings that match the query (case-insensitive)
  });

  if (listings.length === 0) {
    req.flash("error", "No listings found for your search.");
    return res.redirect("/listings");
  }

  res.render("listings/index", { listings }); // Render listings if found
});



app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.redirect('/listings');
});





//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });

//    let registeredUser = await User.register(fakeUser, "helloworld");
//    res.send(registeredUser);
// });

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);
app.use('/bookings', bookingRouter);


// In app.js, after initializing passport, flash, and session
app.use(async (req, res, next) => {
  if (req.isAuthenticated()) {
    const bookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.locals.bookings = bookings;  // Add bookings to res.locals
  } else {
    res.locals.bookings = [];
  }
  next();
});

app.get('/bookings', isLoggedIn, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('listing');
    res.render('bookings/index', { bookings });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/');
  }
});




app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page not Found!'));

})

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  // res.status(statusCode).send(message);
  res.render('error.ejs', { message })
})

if (require.main === module) {
  app.listen(8080, () => {
    console.log('Server is listening to port 8080');
  });
}

module.exports = app;