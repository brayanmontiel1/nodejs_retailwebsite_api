const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY)

//Stripe payment method
router.post("/payment", (req, res) => {
    stripe.charges.create(  //creates the charge method
      {
        source: req.body.tokenId,
        amount: req.body.amount,
        currency: "usd",
      },
      (stripeErr, stripeRes) => {
        if (stripeErr) {
          res.status(500).json(stripeErr);
        } else {
          res.status(200).json(stripeRes);
        }
      }
    );
  });

module.exports = router;