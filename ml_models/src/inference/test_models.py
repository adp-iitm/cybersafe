"""
Quick smoke tests for inference functions.
Run after training models and saving artifacts in ml_models/saved/.
"""

import os
import sys

# Ensure package imports work when running from project root
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_ROOT = os.path.dirname(SRC_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from inference import (
    predict_url,
    predict_email,
    predict_transaction,
    predict_url_batch,
    predict_email_batch,
    predict_transaction_batch,
)


def main():
    print("Testing URL inference...")
    print(predict_url("https://www.google.com"))
    print(predict_url("http://verify-paypal.tk/secure-login"))

    print("\nTesting Email inference...")
    print(predict_email("Hello, your invoice is attached. Thank you for your business."))
    print(predict_email("URGENT: Your account was suspended. Click here to verify now!"))

    print("\nTesting Transaction inference...")
    print(predict_transaction({
        'amount': 25.50,
        'currency': 'USD',
        'merchant_name': 'Starbucks',
        'merchant_category': 'restaurant',
        'timestamp': '2024-01-15 14:30:00',
        'country': 'US',
        'city': 'Seattle',
        'card_type': 'credit',
        'transaction_type': 'purchase'
    }))
    print(predict_transaction({
        'amount': 8450.00,
        'currency': 'USD',
        'merchant_name': 'Suspicious Casino',
        'merchant_category': 'gambling',
        'timestamp': '2024-01-15 02:15:00',
        'country': 'NG',
        'city': 'Lagos',
        'card_type': 'prepaid',
        'transaction_type': 'purchase'
    }))

    print("\nTesting batch endpoints...")
    print(predict_url_batch([
        "https://github.com", "http://login-apple.tk/verify"
    ]))
    print(predict_email_batch([
        "Reminder: Meeting at 2pm.",
        "CONGRATULATIONS, you have WON! Click to claim now!"
    ]))
    print(predict_transaction_batch([
        {'amount': 12.0, 'currency': 'USD', 'merchant_name': 'Subway', 'merchant_category': 'restaurant', 'timestamp': '2024-01-15 11:15:00', 'country': 'US', 'city': 'Austin', 'card_type': 'debit', 'transaction_type': 'purchase'},
        {'amount': 9999.0, 'currency': 'USD', 'merchant_name': 'Unknown Shop', 'merchant_category': 'cryptocurrency', 'timestamp': '2024-01-15 00:15:00', 'country': 'PK', 'city': 'Karachi', 'card_type': 'credit', 'transaction_type': 'purchase'}
    ]))


if __name__ == "__main__":
    main()
