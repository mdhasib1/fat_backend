require('dotenv').config();
const stripeSecretKey = process.env.STRIPE_SECRET;
const stripe = require('stripe')(stripeSecretKey);

// Define a function to calculate taxes
async function calculateTaxes(req, res) {
  try {
    const { currency, cart, address } = req.body;

    // Log the request body for debugging
    console.log('Request Body:', req.body);

    // Convert each cart item to a Stripe line item object
    const lineItems = cart.items.map((cartItem) => {
      const unitPrice = Math.round(parseFloat(cartItem.price) * 100);
      const quantity = parseInt(cartItem.quantity);

      // Log the values for debugging
      console.log(`Item ID: ${cartItem.id}, Unit Price: ${unitPrice}, Quantity: ${quantity}`);

      if (isNaN(unitPrice) || isNaN(quantity)) {
        throw new Error('Invalid unitPrice or quantity');
      }

      return {
        reference: cartItem.id,
        amount: unitPrice * quantity,
        quantity,
      };
    });

    // Create a tax calculation using the Stripe API
    const calculation = await stripe.tax.calculations.create({
      currency,
      line_items: lineItems,
      customer_details: {
        address: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country,
        },
        address_source: "billing"
      },
      expand: ['line_items.data.tax_breakdown']
    });

    if (calculation.line_items && calculation.line_items.data.length > 0) {
      const taxAmount = calculation.line_items.data[0].amount_tax;
      res.status(200).json({ taxAmount });
    } else {
      res.status(200).json({ taxAmount: 0 });
    }
  } catch (error) {
    console.error('Error calculating taxes:', error);

    // Log the specific Stripe error message, if available
    if (error && error.message) {
      console.error('Stripe Error Message:', error.message);
    }

    res.status(500).json({ error: 'Error calculating taxes' });
  }
}

module.exports = {
  calculateTaxes,
};

