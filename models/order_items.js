const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class Order {
  constructor(orderData) {
    this.id = uuidv4();
    this.userId = orderData.userId || '';
    this.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    this.totalAmount = orderData.totalAmount;
    this.status = orderData.status;
    this.paymentstatus = orderData.paymentstatus;
    this.paymentID = orderData.paymentID || null;
  }

  static create(newOrder, result) {
    db.query(
      'INSERT INTO orders SET ?',
      {
        id: newOrder.id,
        userId: newOrder.userId,
        createdAt: newOrder.createdAt,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        paymentstatus: newOrder.paymentstatus,
        paymentID: newOrder.paymentID,
      },
      (err, res) => {
        if (err) {
          console.error('Error creating order:', err);
          result(err, null);
        } else {
          console.log('Created order:', newOrder);
          result(null, newOrder);
        }
      }
    );
  }

  static findById(orderId, result) {
    db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, res) => {
      if (err) {
        console.error('Error finding order by ID:', err);
        result(err, null);
      } else {
        if (res.length > 0) {
          const order = { ...res[0] };
          result(null, order);
        } else {
          result(null, null);
        }
      }
    });
  }

  static getAll(result) {
    db.query('SELECT * FROM orders', (err, res) => {
      if (err) {
        console.error('Error getting all orders:', err);
        result(err, null);
      } else {
        const orders = res.map((row) => ({ ...row }));
        result(null, orders);
      }
    });
  }

  static updateStatus(orderId, newStatus, result) {
    db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [newStatus, orderId],
      (err, res) => {
        if (err) {
          console.error('Error updating order status:', err);
          result(err, null);
        } else {
          console.log('Updated order status for ID:', orderId);
          result(null, res);
        }
      }
    );
  }
  static getUserOrders(userId) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT o.*, oi.*, p.* FROM orders o ' +
        'JOIN order_items oi ON o.id = oi.orderId ' +
        'JOIN products p ON oi.productId = p.id ' +
        'WHERE o.userId = ?',
        [userId],
        (err, res) => {
          if (err) {
            console.error('Error getting user orders:', err);
            reject(err);
          } else {
            const userOrders = [];
            const orderMap = new Map();
  
            res.forEach((row) => {
              const orderId = row.id;
  
              if (!orderMap.has(orderId)) {
                orderMap.set(orderId, {
                  id: orderId,
                  userId: row.userId,
                  createdAt: row.createdAt,
                  totalAmount: row.totalAmount,
                  status: row.status,
                  paymentID: row.paymentID,
                  orderItems: [],
                });
              }
  
              const orderItem = {
                id: row.orderItemId,
                productId: row.productId,
                quantity: row.quantity,
                pricePerItem: row.pricePerItem,
              };
  
              orderMap.get(orderId).orderItems.push(orderItem);
            });
  
            userOrders.push(...orderMap.values());
  
            resolve(userOrders);
          }
        }
      );
    });
  }


  static updatePaymentStatus(orderId, newPaymentStatus, result) {
    db.query(
      'UPDATE orders SET paymentstatus = ? WHERE id = ?',
      [newPaymentStatus, orderId],
      (err, res) => {
        if (err) {
          console.error('Error updating payment status:', err);
          result(err, null);
        } else {
          console.log('Updated payment status for order ID:', orderId);
          result(null, res);
        }
      }
    );
  }
  
}

class OrderItem {
  constructor(orderItemData) {
    this.id = uuidv4();
    this.orderId = orderItemData.orderId || '';
    this.productId = orderItemData.productId || '';
    this.quantity = orderItemData.quantity || 0;
    this.pricePerItem = orderItemData.pricePerItem || 0.0;
  }


  static create(newOrderItem, result) {
    db.query(
      'INSERT INTO order_items SET ?',
      {
        id: newOrderItem.id,
        orderId: newOrderItem.orderId,
        productId: newOrderItem.productId,
        quantity: newOrderItem.quantity,
        pricePerItem: newOrderItem.pricePerItem,
      },
      (err, res) => {
        if (err) {
          console.error('Error creating order item:', err);
          result(err, null);
        } else {
          console.log('Created order item:', newOrderItem);
          result(null, newOrderItem);
        }
      }
    );
  }

  static findByOrderId(orderId, result) {
    db.query(
      'SELECT * FROM order_items WHERE orderId = ?',
      [orderId],
      (err, res) => {
        if (err) {
          console.error('Error finding order items by order ID:', err);
          result(err, null);
        } else {
          const orderItems = res.map((row) => ({ ...row }));
          result(null, orderItems);
        }
      }
    );
  }
}

module.exports = { Order, OrderItem };
