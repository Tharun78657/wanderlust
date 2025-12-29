const Listing = require('../models/listing');
const Review = require('../models/review');

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({})
    res.render('listings/index', { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new');
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const singleListing = await Listing.findById(id).populate({ path: 'reviews', populate: { path: 'author' }, }).populate('owner');
    if (!singleListing) {
        req.flash("error", "Listing you Requested for does not exist!");
        return res.redirect('/listings');
    }
    console.log(singleListing);
    res.render('listings/show', { Listing: singleListing });

};

module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing is Created!");
    res.redirect('/listings');

};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you Requested for does not exist!");
        return res.redirect('/listings');
    }
    res.render('listings/edit', { listing });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);

};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect('/listings');

};