const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// ✅ Create a New Booking
router.post("/:listingId/book", isLoggedIn, async (req, res) => {
  const { listingId } = req.params;
  const { checkIn, checkOut } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  const days = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
  const totalPrice = days * listing.price;

  const booking = new Booking({
    listing: listing._id,
    user: req.user._id,
    checkIn,
    checkOut,
    totalPrice,
  });

  await booking.save();

  req.flash("success", "Booking confirmed!");
  res.redirect("/bookings");
});

// ✅ Show All Bookings of Current User
router.get("/", isLoggedIn, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("listing");
  res.render("bookings/index", { bookings });
});

// ✅ Edit Booking Form
router.get("/:bookingId/edit", isLoggedIn, async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId).populate("listing");

  if (!booking || !booking.user.equals(req.user._id)) {
    req.flash("error", "You are not authorized to edit this booking.");
    return res.redirect("/bookings");
  }

  res.render("bookings/edit", { booking });
});

// ✅ Update Booking
router.put("/:bookingId", isLoggedIn, async (req, res) => {
  const { bookingId } = req.params;
  const { checkIn, checkOut } = req.body;
  const booking = await Booking.findById(bookingId).populate("listing");

  if (!booking || !booking.user.equals(req.user._id)) {
    req.flash("error", "You are not authorized to update this booking.");
    return res.redirect("/bookings");
  }

  const days = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
  const totalPrice = days * booking.listing.price;

  booking.checkIn = checkIn;
  booking.checkOut = checkOut;
  booking.totalPrice = totalPrice;
  await booking.save();

  req.flash("success", "Booking updated.");
  res.redirect("/bookings");
});

// ✅ Cancel (Delete) Booking
router.delete("/:bookingId", isLoggedIn, async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking || !booking.user.equals(req.user._id)) {
    req.flash("error", "You are not authorized to delete this booking.");
    return res.redirect("/bookings");
  }

  await Booking.findByIdAndDelete(bookingId);
  req.flash("success", "Booking canceled.");
  res.redirect("/bookings");
});

module.exports = router;
