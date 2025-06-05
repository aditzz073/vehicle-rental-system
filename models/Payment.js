const db = require('../config/db');

class Payment {
  constructor(data) {
    this.id = data.id;
    this.rental_id = data.rental_id;
    this.user_id = data.user_id;
    this.amount = data.amount;
    this.payment_method = data.payment_method;
    this.transaction_id = data.transaction_id;
    this.status = data.status;
    this.payment_date = data.payment_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new payment
  static async create(paymentData) {
    try {
      const {
        rental_id,
        user_id,
        amount,
        payment_method,
        transaction_id
      } = paymentData;

      const query = `
        INSERT INTO payments 
        (rental_id, user_id, amount, payment_method, transaction_id, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `;

      const [result] = await db.execute(query, [
        rental_id, user_id, amount, payment_method, transaction_id
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating payment: ${error.message}`);
    }
  }

  // Find payment by ID
  static async findById(id) {
    try {
      const query = `
        SELECT p.*, r.start_date, r.end_date, u.full_name as user_name, u.email,
               v.make, v.model, v.year
        FROM payments p
        JOIN rentals r ON p.rental_id = r.id
        JOIN users u ON p.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE p.id = ?
      `;
      
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new Payment(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding payment: ${error.message}`);
    }
  }

  // Find payment by transaction ID
  static async findByTransactionId(transactionId) {
    try {
      const query = 'SELECT * FROM payments WHERE transaction_id = ?';
      const [rows] = await db.execute(query, [transactionId]);
      return rows.length > 0 ? new Payment(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding payment by transaction ID: ${error.message}`);
    }
  }

  // Get payments by rental ID
  static async findByRentalId(rentalId) {
    try {
      const query = `
        SELECT * FROM payments 
        WHERE rental_id = ? 
        ORDER BY created_at DESC
      `;
      
      const [rows] = await db.execute(query, [rentalId]);
      return rows.map(row => new Payment(row));
    } catch (error) {
      throw new Error(`Error fetching payments for rental: ${error.message}`);
    }
  }

  // Get payments by user ID
  static async findByUserId(userId, limit = 10, offset = 0) {
    try {
      const query = `
        SELECT p.*, r.start_date, r.end_date,
               v.make, v.model, v.year
        FROM payments p
        JOIN rentals r ON p.rental_id = r.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await db.execute(query, [userId, limit, offset]);
      return rows.map(row => new Payment(row));
    } catch (error) {
      throw new Error(`Error fetching user payments: ${error.message}`);
    }
  }

  // Get all payments with pagination
  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      let query = `
        SELECT p.*, r.start_date, r.end_date, u.full_name as user_name, u.email,
               v.make, v.model, v.year
        FROM payments p
        JOIN rentals r ON p.rental_id = r.id
        JOIN users u ON p.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE 1=1
      `;
      const params = [];

      // Apply filters
      if (filters.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
      }
      if (filters.payment_method) {
        query += ' AND p.payment_method = ?';
        params.push(filters.payment_method);
      }
      if (filters.user_id) {
        query += ' AND p.user_id = ?';
        params.push(filters.user_id);
      }
      if (filters.date_from) {
        query += ' AND p.payment_date >= ?';
        params.push(filters.date_from);
      }
      if (filters.date_to) {
        query += ' AND p.payment_date <= ?';
        params.push(filters.date_to);
      }

      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await db.execute(query, params);
      return rows.map(row => new Payment(row));
    } catch (error) {
      throw new Error(`Error fetching payments: ${error.message}`);
    }
  }

  // Update payment status
  static async updateStatus(id, status, paymentDate = null) {
    try {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid payment status');
      }

      let query = 'UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP';
      const params = [status];

      if (paymentDate) {
        query += ', payment_date = ?';
        params.push(paymentDate);
      } else if (status === 'completed') {
        query += ', payment_date = CURRENT_TIMESTAMP';
      }

      query += ' WHERE id = ?';
      params.push(id);

      await db.execute(query, params);
      
      // If payment is completed, update rental payment status
      if (status === 'completed') {
        const payment = await this.findById(id);
        if (payment) {
          await db.execute(
            'UPDATE rentals SET payment_status = ? WHERE id = ?',
            ['paid', payment.rental_id]
          );
        }
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating payment status: ${error.message}`);
    }
  }

  // Process payment (simulate payment processing)
  static async processPayment(paymentData) {
    try {
      const {
        rental_id,
        user_id,
        amount,
        payment_method,
        card_details
      } = paymentData;

      // Generate transaction ID
      const transaction_id = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create payment record
      const payment = await this.create({
        rental_id,
        user_id,
        amount,
        payment_method,
        transaction_id
      });

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate payment success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        await this.updateStatus(payment.id, 'completed', new Date());
        return {
          success: true,
          payment,
          transaction_id,
          message: 'Payment processed successfully'
        };
      } else {
        await this.updateStatus(payment.id, 'failed');
        return {
          success: false,
          payment,
          transaction_id,
          message: 'Payment processing failed'
        };
      }
    } catch (error) {
      throw new Error(`Error processing payment: ${error.message}`);
    }
  }

  // Refund payment
  static async refund(id, reason = null) {
    try {
      const payment = await this.findById(id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Only completed payments can be refunded');
      }

      // Create refund transaction
      const refundTransactionId = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const refundQuery = `
        INSERT INTO payments 
        (rental_id, user_id, amount, payment_method, transaction_id, status, payment_date)
        VALUES (?, ?, ?, 'refund', ?, 'completed', CURRENT_TIMESTAMP)
      `;

      await db.execute(refundQuery, [
        payment.rental_id,
        payment.user_id,
        -payment.amount, // Negative amount for refund
        refundTransactionId
      ]);

      // Update original payment status
      await this.updateStatus(id, 'refunded');

      // Update rental payment status
      await db.execute(
        'UPDATE rentals SET payment_status = ? WHERE id = ?',
        ['refunded', payment.rental_id]
      );

      return {
        success: true,
        refund_transaction_id: refundTransactionId,
        amount: payment.amount,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      throw new Error(`Error processing refund: ${error.message}`);
    }
  }

  // Get payment statistics
  static async getStats(dateFrom = null, dateTo = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_payments,
          COUNT(CASE WHEN payment_status = 'successful' THEN 1 END) as successful_payments,
          COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments,
          COUNT(CASE WHEN payment_status = 'refunded' THEN 1 END) as refunded_payments,
          SUM(CASE WHEN payment_status = 'successful' AND amount > 0 THEN amount ELSE 0 END) as total_revenue,
          SUM(CASE WHEN payment_status = 'refunded' OR amount < 0 THEN ABS(amount) ELSE 0 END) as total_refunds,
          AVG(CASE WHEN payment_status = 'successful' AND amount > 0 THEN amount ELSE NULL END) as avg_payment_amount
        FROM payments
        WHERE 1=1
      `;
      const params = [];

      if (dateFrom) {
        query += ' AND created_at >= ?';
        params.push(dateFrom);
      }
      if (dateTo) {
        query += ' AND created_at <= ?';
        params.push(dateTo);
      }

      const [rows] = await db.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching payment stats: ${error.message}`);
    }
  }

  // Get payment methods breakdown
  static async getPaymentMethodsStats() {
    try {
      const query = `
        SELECT 
          payment_method,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'completed' AND amount > 0 THEN amount ELSE 0 END) as total_amount
        FROM payments
        WHERE status = 'completed' AND amount > 0
        GROUP BY payment_method
        ORDER BY total_amount DESC
      `;

      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching payment methods stats: ${error.message}`);
    }
  }

  // Get recent failed payments
  static async getRecentFailedPayments(limit = 10) {
    try {
      const query = `
        SELECT p.*, u.full_name as user_name, u.email,
               v.make, v.model, v.year
        FROM payments p
        JOIN rentals r ON p.rental_id = r.id
        JOIN users u ON p.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE p.status = 'failed'
        ORDER BY p.created_at DESC
        LIMIT ?
      `;

      const [rows] = await db.execute(query, [limit]);
      return rows.map(row => new Payment(row));
    } catch (error) {
      throw new Error(`Error fetching failed payments: ${error.message}`);
    }
  }

  // Validate payment amount
  static validateAmount(amount) {
    if (!amount || amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }
    if (amount > 4000000) { // Max ₹40,00,000 per transaction (equivalent to $50,000)
      throw new Error('Payment amount exceeds maximum limit');
    }
    return true;
  }

  // Get formatted amount
  getFormattedAmount() {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(this.amount);
  }
}

module.exports = Payment;
