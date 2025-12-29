const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { listingSchema} = require('../schema');
const Listing = require('../models/listing');
const { isLoggedIn} = require('../middleware');
const listingController =  require('../controllers/listings');

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        let errorMessage = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errorMessage);
    } else {
        next();
    }
};

router.get("/", async (req, res) => {
    const { search, filter } = req.query; // Get both search and filter from the query
    let allListings;
  
    // Create a case-insensitive regex for search
    const searchRegex = search ? new RegExp(search, 'i') : null;
  
    // Construct the query based on search and filter
    const query = {};
    if (searchRegex) {
      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { country: searchRegex }
      ];
    }
    if (filter) {
      query.category = filter; // Filter by category (like "Castles", "Beach Front")
    }
  
    // Fetch listings based on the constructed query
    allListings = await Listing.find(query);
  
    res.render("listings/index", { allListings, searchQuery: search, activeFilter: filter });
  });
router
    .route('/')
    .get(wrapAsync(listingController.index))
    .post( isLoggedIn, wrapAsync(listingController.createListing));

// new route
router.get('/new', isLoggedIn, listingController.renderNewForm);

router
    .route('/:id')
    .get( wrapAsync(listingController.showListing))
    .put( isLoggedIn, wrapAsync(listingController.updateListing))
    .delete( isLoggedIn, wrapAsync(listingController.destroyListing));
// index route



// Show Route



// Create route


//edit route
router.get('/:id/edit', isLoggedIn, wrapAsync(listingController.renderEditForm));

//update route


// delete route


module.exports = router;