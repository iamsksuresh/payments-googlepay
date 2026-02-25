const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

// ✅ Serve static files
app.use(express.static(path.join(__dirname, '.')));

// ✅ Serve index.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Mock database for demo purposes
const processedPayments = [];

/**
 * Stub endpoint to process Google Pay tokens
 */
app.post('/api/process-payment', async (req, res) => {
    try {
        const { token, amount, currency } = req.body;

        // Validate request
        if (!token || !amount || !currency) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: token, amount, currency'
            });
        }

        // Validate amount format
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount'
            });
        }

        // STUB: Simulate token decryption
        const decryptedToken = simulateTokenDecryption(token);
        console.log('Decrypted token:', decryptedToken);

        // STUB: Simulate validation with payment processor
        const validationResult = simulateTokenValidation(decryptedToken);
        if (!validationResult.isValid) {
            return res.status(400).json({
                success: false,
                error: validationResult.error
            });
        }

        // STUB: Simulate charging the payment method
        const chargeResult = simulateChargePayment(decryptedToken, amountNum, currency);
        
        if (!chargeResult.success) {
            return res.status(400).json({
                success: false,
                error: chargeResult.error
            });
        }

        // Store payment record for demo
        const paymentRecord = {
            id: generateTransactionId(),
            token: maskToken(token),
            amount: amountNum,
            currency: currency,
            status: 'completed',
            chargeId: chargeResult.chargeId,
            timestamp: new Date().toISOString(),
            cardLast4: decryptedToken.cardLast4,
            cardNetwork: decryptedToken.cardNetwork
        };

        processedPayments.push(paymentRecord);

        // Return success response
        res.json({
            success: true,
            message: 'Payment processed successfully',
            transaction: {
                transactionId: paymentRecord.id,
                amount: paymentRecord.amount,
                currency: paymentRecord.currency,
                status: paymentRecord.status,
                timestamp: paymentRecord.timestamp,
                cardLast4: paymentRecord.cardLast4
            }
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

/**
 * Get payment history (demo endpoint)
 */
app.get('/api/payments', (req, res) => {
    res.json({
        success: true,
        count: processedPayments.length,
        payments: processedPayments
    });
});

/**
 * Get specific payment details (demo endpoint)
 */
app.get('/api/payments/:transactionId', (req, res) => {
    const payment = processedPayments.find(p => p.id === req.params.transactionId);
    
    if (!payment) {
        return res.status(404).json({
            success: false,
            error: 'Payment not found'
        });
    }

    res.json({
        success: true,
        payment: payment
    });
});

// STUB: Simulate token decryption
function simulateTokenDecryption(token) {
    console.log('Simulating token decryption for token:', token.substring(0, 20) + '...');
    
    return {
        cardNumber: '****-****-****-4242',
        cardLast4: '4242',
        cardNetwork: 'VISA',
        expiryMonth: '12',
        expiryYear: '2025',
        cardHolderName: 'Demo User',
    };
}

// STUB: Simulate validation with payment processor
function simulateTokenValidation(decryptedToken) {
    const randomChance = Math.random();
    
    // 90% success rate for demo
    if (randomChance < 0.9) {
        return {
            isValid: true
        };
    }

    const errors = [
        'Card declined',
        'Insufficient funds',
        'Invalid card number',
        'Card expired'
    ];
    
    return {
        isValid: false,
        error: errors[Math.floor(Math.random() * errors.length)]
    };
}

// STUB: Simulate charging the payment method
function simulateChargePayment(decryptedToken, amount, currency) {
    console.log(`Simulating charge of ${amount} ${currency} to card ending in ${decryptedToken.cardLast4}`);
    
    return {
        success: true,
        chargeId: `ch_demo_${generateTransactionId()}`,
        amount: amount,
        currency: currency,
        cardLast4: decryptedToken.cardLast4,
        status: 'succeeded'
    };
}

// Helper functions
function generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function maskToken(token) {
    return token.substring(0, 10) + '...' + token.substring(token.length - 10);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n✅ Google Pay Demo Server Running!\n`);
    console.log(`🌐 Open your browser: http://localhost:${PORT}`);
    console.log(`\n📡 Available Endpoints:`);
    console.log(`  POST http://localhost:${PORT}/api/process-payment`);
    console.log(`  GET  http://localhost:${PORT}/api/payments`);
    console.log(`  GET  http://localhost:${PORT}/api/payments/:transactionId\n`);
});