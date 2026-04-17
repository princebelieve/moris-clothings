//server/src/routes/payment.routes.js
const express = require("express");
const stripe = require("../services/stripe");
const Product = require("../models/Product");

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const session = await stripe.checkout.sessions.create({
      automatic_payment_methods: {
        enabled: true,
      },
      mode: "payment",

      customer_email: req.body.email, // IMPORTANT ADDITION

      metadata: {
        productId: product._id.toString(),
      },

      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: product.name,
            },
            unit_amount: product.price * 100,
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
