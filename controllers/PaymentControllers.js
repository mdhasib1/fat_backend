// Import necessary libraries and modules
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const { Order, OrderItem } = require('../models/order_items');
const moment = require('moment');
const Email = require("../utils/sendEmail");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

const uuid = uuidv4();

const invoiceNumber = uuid.slice(0, 5);

const payment = async (req, res) => {
    console.log(req.body)
  try {

    const logoImagePath = path.join(__dirname, 'logo.png');
    const logoImage = fs.readFileSync(logoImagePath).toString('base64');
  
    const logoAttachment = {
      content: logoImage,
      filename: 'logo.png',
      type: 'image/png',
      disposition: 'inline',
      content_id: 'logo@pawcert.com',
    };

    let productRows = '';
    let subTotal = 0;

    const productIds = req.body.products.map(product => product.id)
    console.log(productIds)


    for (const product of req.body.products) {
        const totalPrice = product.price * product.quantity;
        subTotal += totalPrice;
  
        productRows += `
          <tr>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>$${totalPrice.toFixed(2)}</td>
          </tr>
        `;
      }

      const date = new Date(); 

      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
      
      const formattedDate = date.toLocaleDateString('en-US', options);

    const message = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invoice</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo img {
            width: 250px;
            margin: 0 auto;
          }
          .logo h3 {
            text-align: center;
            color: #333;
            font-size: 24px;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
          }
          table,
          th,
          td {
            border: 1px solid #ccc;
          }
          th,
          td {
            padding: 12px;
            text-align: left;
          }
          .total {
            text-align: right;
            margin-top: 20px;
          }
          .total h2 {
            color: #333;
            font-size: 24px;
            margin: 0;
          }
          .invoice-info {
            margin-top: 45px;
            margin-bottom: 40px;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
          }
          .invoice-info p {
            margin: 0;
          }
          .invoice-info .label {
            font-weight: bold;
            color: #333;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="cid:logo@pawcert.com" alt="Logo" />
            <h3>Invoice</h3>
          </div>
          <div
            class="invoice-info"
            style="width: 100%; display: flex; justify-content: space-between"
          >
            <div style="width: 60%">
              <p>Dear ${req.body.billingInfo.fullName},</p>
              <p style="margin-top: 10px">
                <span class="label">Billing:</span> ${req.body.billingInfo.billingAddressLine1},${req.body.billingInfo.selectedCity},${req.body.billingInfo.selectedState}, ${req.body.billingInfo.zipCode}, ${req.body.billingInfo.selectedCountry}
              </p>
              <p>
                <span class="label">Shipping:</span> ${req.body.shippingInfo.billingAddressLine1},${req.body.shippingInfo.selectedCity},${req.body.shippingInfo.selectedState}, ${req.body.shippingInfo.zipCode}, ${req.body.shippingInfo.selectedCountry}
              </p>
            </div>
            <div style="text-align: right; width: 40%">
              <p><span class="label">Invoice Number:</span>INV${invoiceNumber}</p>
              <p><span class="label">Date:</span>${formattedDate}</p>
            </div>
          </div>
          <table>
            <thead  style="background-color: #b91c1b; color: #fff">
              <tr>
                <th>Item Title</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
            ${productRows}
            </tbody>
          </table>
          <div class="total">
            <p><span class="label">Sub Total:</span>$ ${req.body.billingInfo.subtotal}</p>
            <p><span class="label">Shipping Charge:</span>$ ${req.body.billingInfo.shipping}</p>
            <p><span class="label">Tax:</span>$ ${req.body.billingInfo.tax}</p>
            <h2>Total:$ ${req.body.billingInfo.total}</h2>
          </div>
          <div class="footer">
            <a
              style="text-decoration: none; font-size: 15px"
              href="https://fatstogies.shop"
            >
              <p style="color: red">FAT STOGIES</p>
            </a>
            <p>17300 Ventura Blvd, Encino, CA 91316</p>
            <p>Email: info@fatstogies.shop | Phone: (818) 907-0211</p>
          </div>
        </div>
      </body>
    </html>
    
    `;
    const subject = "Thank you for your order from FAT STOGIES Cigar!";
    const emailHeader = 'Order by FAT STOGIES Cigar!'
    const send_to = req.body.billingInfo.email; 
    const sent_from = process.env.EMAIL_USER;

    const { paymentMethodId, amount, billingInfo, shippingInfo, products } = req.body;

    const amountWithTwoDecimalPlaces = parseFloat(amount).toFixed(2);
    const amountInCents = Math.round(parseFloat(amountWithTwoDecimalPlaces));

    if(billingInfo.selectedState === 'HI' || billingInfo.selectedState === 'UT' || billingInfo.selectedState === 'SD' ){
            res.send({
              message: 'for your address order is Restricted',
            });
    }else if (billingInfo.selectedState === 'DE') {
      const verified = true;

      if (verified) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'usd',
          payment_method: paymentMethodId,
          confirm: true,
          payment_method_types: ['card'],
        });

        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } else {
        res.status(400).send('ID verification failed.');
      }
    } else if (billingInfo.selectedState === 'CA') {
      const userId = req.body.billingInfo.userId;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method: paymentMethodId,
        payment_method_types: ['card'],
        capture_method: 'manual',
        confirm: true,
      });

      const pendingPayment = {
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        id:paymentIntent.id,
      };

      console.log('payment id' , pendingPayment)
      const newOrder = new Order({
        userId: userId,
        totalAmount: amountWithTwoDecimalPlaces,
        status: 'pending',
        paymentstatus:'pending', 
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        paymentID: paymentIntent.id, 
      });
      Order.create(newOrder, async (orderErr, order) => {
        if (orderErr) {
          console.error('Error creating order:', orderErr);
          res.status(500).send('Error creating order.');
        } else {
          try {
            for (const product of req.body.products) {
                const productId = product.id; 
                const newOrderItem = new OrderItem({
                  orderId: order.id,
                  productId: productId,
                  quantity: product.quantity,
                  pricePerItem: product.price,
                });
              
                OrderItem.create(newOrderItem, (orderItemErr, orderItem) => {
                  if (orderItemErr) {
                    console.error('Error creating order item:', orderItemErr);
                    res.status(500).send('Error creating order item.');
                  }
                });
              }
              
      
            res.send({
              success: 200,
              message: 'Payment is pending admin approval.',
              paymentDetails: pendingPayment,
              orderId: order.id,
            });
            Email(subject, message, send_to, sent_from, undefined, logoAttachment, emailHeader);
          } catch (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error.');
          }
        }
      });
    } else {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        payment_method_types: ['card'],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).send('Payment processing error.');
  }
};


const adminCapturePayment = async (req, res) => {
    const { paymentIntentId } = req.params;
    const orderId = req.body.orderId; 
    console.log(req.body)
    try {

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
      if (!paymentIntent) {
        return res.status(404).send('Payment intent not found.');
      }

      if (paymentIntent.status === 'requires_capture') {
        await stripe.paymentIntents.capture(paymentIntentId);

        Order.updatePaymentStatus(orderId, 'confirm', (err, result) => {
          if (err) {
            return res.status(500).send('Error updating payment status in the database.');
          }
          return res.send('Payment successfully captured and order updated.');
        });
      } else {
        return res.status(400).send('Payment cannot be captured at this time.');
      }
    } catch (error) {
      console.error('Capture payment error:', error);
      res.status(500).send('Capture payment error.');
    }
  };


  const cancelPayment = async (req, res) => {
    const { paymentIntentId } = req.params;
    const orderId = req.body.orderId; 
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
      if (!paymentIntent) {
        return res.status(404).send('Payment intent not found.');
      }
  
      if (paymentIntent.status === 'requires_capture') {
        await stripe.paymentIntents.cancel(paymentIntentId);
       
        Order.updatePaymentStatus(orderId, 'reject', (err, result) => {
          if (err) {
            return res.status(500).send('Error updating payment status in the database.');
          }
          return res.send('Payment successfully captured and order updated.');
        });
      } else {
        return res.status(400).send('Payment cannot be canceled at this time.');
      }
    } catch (error) {
      console.error('Cancel payment error:', error);
      res.status(500).send('Cancel payment error.');
    }
  };



  const getAllOrders = async (req, res) => {
    Order.getAll(async (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      for (const order of orders) {
        await fetchOrderItems(order);
      }
  
      return res.status(200).json(orders);
    });
  };
  
  async function fetchOrderItems(order) {
    return new Promise((resolve, reject) => {
      OrderItem.findByOrderId(order.id, (err, orderItems) => {
        if (err) {
          reject(err);
        } else {
          order.orderItems = orderItems;
          resolve();
        }
      });
    });
  }

  const getUserOrders = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const userOrders = await fetchUserOrders(userId);
      console.log('User Orders:', userOrders);
      return res.status(200).json(userOrders);
    } catch (err) {
      console.error('Error fetching user orders:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  async function fetchUserOrders(userId) {
    return new Promise((resolve, reject) => {
      Order.getUserOrders(userId)
        .then((userOrders) => {
          resolve(userOrders);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  
  
  
  


module.exports = {
  payment,
  adminCapturePayment,
  cancelPayment,
  getAllOrders,
  getUserOrders,
};
