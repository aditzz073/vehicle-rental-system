const db = require('../config/db');

class Payment {
  static async findById(paymentId) {
    try {
      const [rows] = await db.execute('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding payment by ID:', error);
      throw error;
    }
  }

  static async getByRentalId(rentalId) {
    try {
      const [rows] = await db.execute('SELECT * FROM payments WHERE rental_id = ?', [rentalId]);
      return rows;
    } catch (error) {
      console.error('Error getting payments by rental ID:', error);
      throw error;
    }
  }

  static async create(paymentData) {
    try {
      const { rental_id, amount, payment_method, transaction_id, status } = paymentData;
      
      const [result] = await db.execute(
        `INSERT INTO payments 
         (rental_id, amount, payment_method, transaction_id, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [rental_id, amount, payment_method, transaction_id || null, status || 'pending']
      );
      
      if (status === 'successful') {
        // Update rental payment status
        await db.execute(
          'UPDATE rentals SET payment_status = ? WHERE rental_id = ?',
          ['paid', rental_id]
        );
      }
      
      return { paymentId: result.insertId, ...paymentData };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  static async updateStatus(paymentId, status) {
    try {
      const [payment] = await db.execute('SELECT rental_id FROM payments WHERE payment_id = ?', [paymentId]);
      const rentalId = payment[0] ? payment[0].rental_id : null;
      
      if (!rentalId) {
        throw new Error('Payment not found');
      }
      
      const [result] = await db.execute(
        'UPDATE payments SET status = ? WHERE payment_id = ?',
        [status, paymentId]
      );
      
      // Update rental payment status based on payment status
      if (status === 'successful') {
        await db.execute(
          'UPDATE rentals SET payment_status = ? WHERE rental_id = ?',
          ['paid', rentalId]
        );
      } else if (status === 'refunded') {
        await db.execute(
          'UPDATE rentals SET payment_status = ? WHERE rental_id = ?',
          ['refunded', rentalId]
        );
      } else if (status === 'failed') {
        await db.execute(
          'UPDATE rentals SET payment_status = ? WHERE rental_id = ?',
          ['pending', rentalId]
        );
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  static async processPayment(rentalId, paymentData) {
    try {
      // Start a transaction
      await db.beginTransaction();
      
      try {
        const { amount, payment_method, transaction_id } = paymentData;
        
        // Create payment record
        const [paymentResult] = await db.execute(
          `INSERT INTO payments 
           (rental_id, amount, payment_method, transaction_id, status) 
           VALUES (?, ?, ?, ?, ?)`,
          [rentalId, amount, payment_method, transaction_id || null, 'successful']
        );
        
        // Update rental payment status
        await db.execute(
          'UPDATE rentals SET payment_status = ?, status = ? WHERE rental_id = ?',
          ['paid', 'active', rentalId]
        );
        
        // Commit transaction
        await db.commit();
        
        return { 
          success: true, 
          paymentId: paymentResult.insertId,
          message: 'Payment processed successfully' 
        };
      } catch (error) {
        // Rollback in case of error
        await db.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  static async processRefund(paymentId) {
    try {
      // Start a transaction
      await db.beginTransaction();
      
      try {
        // Get payment and rental info
        const [payment] = await db.execute('SELECT rental_id FROM payments WHERE payment_id = ?', [paymentId]);
        
        if (!payment[0]) {
          throw new Error('Payment not found');
        }
        
        const rentalId = payment[0].rental_id;
        
        // Create refund record (as a new payment with negative amount)
        const [refundPayment] = await db.execute(
          `INSERT INTO payments 
           (rental_id, amount, payment_method, status, transaction_id) 
           SELECT rental_id, -amount, payment_method, 'refunded', CONCAT('REF-', transaction_id) 
           FROM payments 
           WHERE payment_id = ?`,
          [paymentId]
        );
        
        // Update original payment status
        await db.execute(
          'UPDATE payments SET status = ? WHERE payment_id = ?',
          ['refunded', paymentId]
        );
        
        // Update rental payment status
        await db.execute(
          'UPDATE rentals SET payment_status = ? WHERE rental_id = ?',
          ['refunded', rentalId]
        );
        
        // Commit transaction
        await db.commit();
        
        return { 
          success: true, 
          refundId: refundPayment.insertId,
          message: 'Refund processed successfully' 
        };
      } catch (error) {
        // Rollback in case of error
        await db.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  static async getPaymentStatistics() {
    try {
      const [totalPayments] = await db.execute(
        `SELECT 
          COUNT(*) as count, 
          SUM(CASE WHEN status = 'successful' THEN amount ELSE 0 END) as total_successful,
          SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as total_refunded,
          SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) as total_failed,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending
        FROM payments`
      );
      
      const [paymentsByMethod] = await db.execute(
        `SELECT 
          payment_method, 
          COUNT(*) as count,
          SUM(CASE WHEN status = 'successful' THEN amount ELSE 0 END) as total_amount
        FROM payments
        GROUP BY payment_method`
      );
      
      return {
        summary: totalPayments[0],
        byMethod: paymentsByMethod
      };
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      throw error;
    }
  }
}

module.exports = Payment;