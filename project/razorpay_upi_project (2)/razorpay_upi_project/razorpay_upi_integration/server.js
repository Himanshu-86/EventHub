const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const razorpay = new Razorpay({
    key_id: "rzp_test_kajPoorLCM1n6u",
    key_secret: "JVRPG5saCCIIvBwHPffBy092"
});

app.post("/create-order", async (req, res) => {
    const options = {
        amount: req.body.amount * 100, // amount in smallest currency unit
        currency: "INR",
        receipt: "receipt_order_74394",
        payment_capture: 1
    };
    try {
        const response = await razorpay.orders.create(options);
        res.json(response);
    } catch (err) {
        res.status(500).send("Error creating order");
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
