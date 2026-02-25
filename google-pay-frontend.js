// Process payment (send to your backend stub)
function processPayment(paymentData) {
    const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
    
    // Show loading state
    document.getElementById('googlePayButton').disabled = true;
    showLoadingSpinner(true);
    
    fetch('http://localhost:3000/api/process-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: paymentToken,
            amount: '10.00',
            currency: 'USD'
        })
    })
    .then(response => response.json())
    .then(data => {
        showLoadingSpinner(false);
        document.getElementById('googlePayButton').disabled = false;
        
        if (data.success) {
            showSuccessMessage(`Payment successful! Transaction ID: ${data.transaction.transactionId}`);
            console.log('Payment successful:', data.transaction);
        } else {
            showErrorMessage(`Payment failed: ${data.error}`);
            console.error('Payment error:', data.error);
        }
    })
    .catch(error => {
        showLoadingSpinner(false);
        document.getElementById('googlePayButton').disabled = false;
        showErrorMessage('Network error processing payment');
        console.error('Error processing payment:', error);
    });
}

function showLoadingSpinner(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showSuccessMessage(message) {
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = message;
    msgDiv.style.color = 'green';
}

function showErrorMessage(message) {
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = message;
    msgDiv.style.color = 'red';
}