const express = require('express');
const router = express.Router({mergeParams : true});
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schema');
const Review = require('../models/review');
const Listing = require('../models/listing');
const { isLoggedIn ,isReviewAuthor } = require('../middleware');
const reviewcontroller = require('../controllers/reviews');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        let errorMessage = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errorMessage);
    } else {
        next();
    }
}

//reviews
//post route
router.post('/',isLoggedIn, validateReview, wrapAsync(reviewcontroller.createReview));

//Delete review  route

router.delete('/:reviewId' ,isLoggedIn,isReviewAuthor, wrapAsync(reviewcontroller.destroyReview));


module.exports =  router ;