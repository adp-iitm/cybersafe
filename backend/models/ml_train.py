"""
Enhanced ML-Powered Fraud Detection System
Improved real-world fraud pattern detection
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from typing import Dict, List, Tuple, Optional
import joblib
from datetime import datetime, timedelta
import logging
from collections import defaultdict, Counter
import hashlib
import re
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== ENHANCED FEATURE ENGINEERING ====================

class EnhancedFeatureEngineering:
    """Advanced feature engineering with real-world fraud patterns"""
    
    def __init__(self):
        self.scalers = {}
        self.feature_stats = {}
        
        # Known legitimate domains for comparison
        self.legitimate_domains = {
            'google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 
            'apple.com', 'netflix.com', 'paypal.com', 'ebay.com',
            'linkedin.com', 'twitter.com', 'instagram.com', 'youtube.com',
            'chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citibank.com'
        }
        
        # Common typosquatting patterns
        self.typosquat_substitutions = {
            'o': ['0'], '0': ['o'], 'l': ['1', 'i'], '1': ['l', 'i'],
            'i': ['1', 'l'], 'a': ['@'], 'e': ['3'], 's': ['5', '$'],
            'g': ['9'], 'b': ['8'], 'rn': ['m'], 'vv': ['w']
        }
    
    def calculate_levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein distance between two strings"""
        if len(s1) < len(s2):
            return self.calculate_levenshtein_distance(s2, s1)
        if len(s2) == 0:
            return len(s1)
        
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]
    
    def detect_typosquatting(self, domain: str) -> Dict[str, float]:
        """Detect typosquatting attempts"""
        domain_lower = domain.lower().replace('www.', '')
        
        # Remove TLD for comparison
        domain_base = domain_lower.split('.')[0] if '.' in domain_lower else domain_lower
        
        typosquat_features = {
            'min_distance_to_legit': 999,
            'has_digit_substitution': 0,
            'has_homoglyph': 0,
            'has_added_chars': 0,
            'similarity_to_popular': 0.0
        }
        
        # Check against legitimate domains
        for legit_domain in self.legitimate_domains:
            legit_base = legit_domain.split('.')[0]
            distance = self.calculate_levenshtein_distance(domain_base, legit_base)
            
            if distance < typosquat_features['min_distance_to_legit']:
                typosquat_features['min_distance_to_legit'] = distance
                
                # Calculate similarity
                max_len = max(len(domain_base), len(legit_base))
                typosquat_features['similarity_to_popular'] = 1 - (distance / max_len)
        
        # Check for digit substitutions (g00gle, micr0soft)
        if any(char.isdigit() for char in domain_base):
            # Check if digits could be letter substitutions
            for char in ['0', '1', '3', '5', '8', '9']:
                if char in domain_base:
                    typosquat_features['has_digit_substitution'] = 1
                    break
        
        # Check for homoglyphs and suspicious patterns
        suspicious_patterns = ['rn', 'vv', 'cl']
        if any(pattern in domain_base for pattern in suspicious_patterns):
            typosquat_features['has_homoglyph'] = 1
        
        # Check for added characters (googgle, amazzon)
        for legit_domain in self.legitimate_domains:
            legit_base = legit_domain.split('.')[0]
            if len(domain_base) > len(legit_base):
                # Check if it's the same with repeated chars
                for i in range(len(domain_base) - len(legit_base) + 1):
                    substring = domain_base[i:i+len(legit_base)]
                    if self.calculate_levenshtein_distance(substring, legit_base) <= 2:
                        typosquat_features['has_added_chars'] = 1
                        break
        
        return typosquat_features
    
    def extract_url_features(self, url: str) -> Dict[str, float]:
        """Extract comprehensive URL features with typosquatting detection"""
        from urllib.parse import urlparse
        
        parsed = urlparse(url)
        domain = parsed.netloc or ''
        path = parsed.path or ''
        
        # Basic features
        features = {
            'url_length': len(url),
            'domain_length': len(domain),
            'path_length': len(path),
            'num_dots': url.count('.'),
            'num_hyphens': url.count('-'),
            'num_underscores': url.count('_'),
            'num_slashes': url.count('/'),
            'num_digits': sum(c.isdigit() for c in url),
            'digit_ratio': sum(c.isdigit() for c in url) / len(url) if url else 0,
            'num_special_chars': sum(not c.isalnum() and c not in '/:.-_' for c in url),
        }
        
        # Domain analysis
        domain_parts = domain.split('.')
        features['num_subdomains'] = max(0, len(domain_parts) - 2)
        features['has_ip'] = 1 if any(part.replace('.', '').isdigit() for part in domain_parts[:3]) else 0
        features['has_at_symbol'] = 1 if '@' in url else 0
        features['has_https'] = 1 if url.startswith('https://') else 0
        features['has_www'] = 1 if 'www.' in domain else 0
        
        # Port detection
        features['has_port'] = 1 if ':' in domain and any(c.isdigit() for c in domain.split(':')[-1]) else 0
        
        # Suspicious TLDs
        suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.pw', '.cc', 
                          '.buzz', '.work', '.top', '.xyz', '.club', '.info']
        features['suspicious_tld'] = 1 if any(domain.endswith(tld) for tld in suspicious_tlds) else 0
        
        # TYPOSQUATTING DETECTION
        typosquat_features = self.detect_typosquatting(domain)
        features.update(typosquat_features)
        
        # Entropy calculation
        if url:
            freq = Counter(url.lower())
            entropy = -sum((count/len(url)) * math.log2(count/len(url)) for count in freq.values())
            features['entropy'] = entropy
        else:
            features['entropy'] = 0.0
        
        # Character analysis
        vowels = sum(1 for c in url.lower() if c in 'aeiou')
        consonants = sum(1 for c in url.lower() if c.isalpha() and c not in 'aeiou')
        features['vowel_ratio'] = vowels / (consonants + 1)
        features['consonant_ratio'] = consonants / (vowels + 1)
        
        # Suspicious keywords
        suspicious_keywords = ['login', 'verify', 'account', 'secure', 'update', 'confirm', 
                              'banking', 'paypal', 'signin', 'credential', 'password',
                              'security', 'validation', 'suspended', 'locked']
        features['suspicious_keyword_count'] = sum(1 for kw in suspicious_keywords if kw in url.lower())
        features['has_suspicious_keyword'] = 1 if features['suspicious_keyword_count'] > 0 else 0
        
        # Path analysis
        features['path_depth'] = path.count('/') if path else 0
        features['has_query'] = 1 if '?' in url else 0
        features['query_length'] = len(url.split('?')[1]) if '?' in url else 0
        
        # Domain age simulation (in production, use WHOIS)
        features['domain_age_days'] = abs(hash(domain) % 3650)
        features['is_new_domain'] = 1 if features['domain_age_days'] < 180 else 0
        
        return features
    
    def extract_email_features(self, email_text: str, subject: str = "", 
                               sender: str = "") -> Dict[str, float]:
        """Extract comprehensive email features with phishing detection"""
        text_lower = email_text.lower()
        
        features = {
            'email_length': len(email_text),
            'word_count': len(email_text.split()),
            'avg_word_length': np.mean([len(word) for word in email_text.split()]) if email_text else 0,
            'sentence_count': max(1, len(re.split(r'[.!?]+', email_text))),
        }
        
        # ENHANCED URGENCY DETECTION
        urgency_words = ['urgent', 'immediate', 'immediately', 'act now', 'expires', 
                        'limited time', 'verify now', 'suspended', 'blocked', 
                        'security alert', 'expire', 'within 24 hours', 'right now',
                        'asap', 'critical', 'action required', 'final notice']
        features['urgency_word_count'] = sum(1 for word in urgency_words if word in text_lower)
        features['urgency_score'] = min(1.0, features['urgency_word_count'] / 3)
        
        # ENHANCED FINANCIAL INDICATORS
        financial_words = ['bank', 'account', 'credit card', 'payment', 'transaction',
                          'refund', 'tax', 'invoice', 'wire', 'money', 'cash', 'transfer',
                          'billing', 'subscription', 'card', 'debit', 'balance']
        features['financial_word_count'] = sum(1 for word in financial_words if word in text_lower)
        features['financial_score'] = min(1.0, features['financial_word_count'] / 3)
        
        # PHISHING PATTERNS
        phishing_patterns = [
            'click here', 'verify account', 'confirm identity', 'update payment',
            'suspended account', 'unusual activity', 'verify your information',
            'confirm your account', 'your account will be', 'failure to verify',
            'account suspension', 'detected unusual', 'for your safety',
            'click the link', 'may result in', 'security team', 'prevent suspension'
        ]
        features['phishing_pattern_count'] = sum(1 for pattern in phishing_patterns if pattern in text_lower)
        features['phishing_score'] = min(1.0, features['phishing_pattern_count'] / 3)
        
        # THREAT LANGUAGE
        threat_words = ['suspend', 'block', 'close', 'terminate', 'disable', 
                       'restrict', 'lock', 'freeze', 'failure', 'consequence']
        features['threat_word_count'] = sum(1 for word in threat_words if word in text_lower)
        features['has_threat_language'] = 1 if features['threat_word_count'] > 0 else 0
        
        # Personal info requests
        personal_keywords = ['ssn', 'social security', 'password', 'pin', 'credit card',
                            'cvv', 'card number', 'date of birth', 'passport', 'verify your',
                            'confirm your', 'provide your', 'enter your']
        features['personal_info_request_count'] = sum(1 for kw in personal_keywords if kw in text_lower)
        features['requests_personal_info'] = 1 if features['personal_info_request_count'] > 0 else 0
        
        # Link analysis
        links = re.findall(r'https?://\S+', email_text)
        features['num_links'] = len(links)
        features['has_multiple_links'] = 1 if len(links) > 2 else 0
        
        # Shortened URLs
        short_url_services = ['bit.ly', 'tinyurl', 'goo.gl', 't.co', 'ow.ly', 'is.gd']
        features['has_shortened_url'] = 1 if any(short in ''.join(links) for short in short_url_services) else 0
        
        # Check for mismatched links
        features['has_suspicious_link'] = 0
        for link in links:
            if any(keyword in link.lower() for keyword in ['login', 'verify', 'secure', 'account']):
                features['has_suspicious_link'] = 1
                break
        
        # Text characteristics
        features['uppercase_ratio'] = sum(1 for c in email_text if c.isupper()) / len(email_text) if email_text else 0
        features['exclamation_count'] = email_text.count('!')
        features['question_count'] = email_text.count('?')
        features['digit_ratio'] = sum(1 for c in email_text if c.isdigit()) / len(email_text) if email_text else 0
        features['has_excessive_punctuation'] = 1 if (features['exclamation_count'] > 2) else 0
        
        # Subject line analysis
        if subject:
            subject_lower = subject.lower()
            features['subject_length'] = len(subject)
            features['subject_all_caps'] = 1 if subject.isupper() and len(subject) > 3 else 0
            features['subject_has_re_fwd'] = 1 if any(x in subject_lower for x in ['re:', 'fwd:']) else 0
            features['subject_urgent'] = 1 if any(word in subject_lower for word in ['urgent', 'immediate', 'action required']) else 0
            features['subject_exclamation'] = subject.count('!')
        else:
            features['subject_length'] = 0
            features['subject_all_caps'] = 0
            features['subject_has_re_fwd'] = 0
            features['subject_urgent'] = 0
            features['subject_exclamation'] = 0
        
        # Sender analysis
        if sender:
            sender_lower = sender.lower()
            # Generic sender detection
            generic_senders = ['noreply', 'no-reply', 'donotreply', 'info', 'support', 'security', 'admin']
            features['sender_is_generic'] = 1 if any(generic in sender_lower for generic in generic_senders) else 0
            
            # Free email services
            features['sender_is_freemail'] = 1 if any(domain in sender_lower 
                for domain in ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']) else 0
            
            # Check for domain mismatch in sender
            if '@' in sender:
                sender_domain = sender.split('@')[1].lower()
                # Check if sender domain matches common brands but uses suspicious TLD
                brand_names = ['paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook', 'bank']
                features['sender_brand_mismatch'] = 0
                for brand in brand_names:
                    if brand in sender_domain and not sender_domain.endswith(f'{brand}.com'):
                        features['sender_brand_mismatch'] = 1
                        break
            else:
                features['sender_brand_mismatch'] = 0
        else:
            features['sender_is_generic'] = 0
            features['sender_is_freemail'] = 0
            features['sender_brand_mismatch'] = 0
        
        # Grammar and spelling indicators (simple heuristics)
        features['avg_sentence_length'] = features['word_count'] / features['sentence_count']
        features['has_poor_grammar'] = 1 if features['avg_sentence_length'] > 50 or features['avg_sentence_length'] < 3 else 0
        
        return features
    
    def extract_transaction_features(self, transaction: Dict) -> Dict[str, float]:
        """Extract comprehensive transaction features with fraud patterns"""
        features = {}
        
        # Amount features
        amount = float(transaction.get('amount', 0))
        features['amount'] = amount
        features['amount_log'] = np.log1p(amount)
        features['is_round_amount'] = 1 if amount % 100 == 0 and amount >= 100 else 0
        features['amount_digits'] = len(str(int(amount)))
        features['is_high_amount'] = 1 if amount > 1000 else 0
        features['is_very_high_amount'] = 1 if amount > 5000 else 0
        
        # Temporal features
        timestamp = transaction.get('timestamp', datetime.now())
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        
        features['hour'] = timestamp.hour
        features['day_of_week'] = timestamp.weekday()
        features['is_weekend'] = 1 if timestamp.weekday() >= 5 else 0
        features['is_night'] = 1 if timestamp.hour < 6 or timestamp.hour > 22 else 0
        features['is_very_late_night'] = 1 if 1 <= timestamp.hour <= 5 else 0
        features['is_business_hours'] = 1 if 9 <= timestamp.hour <= 17 and timestamp.weekday() < 5 else 0
        
        # Geographic features
        customer_country = transaction.get('customer_country', 'US')
        merchant_country = transaction.get('merchant_country', 'US')
        features['is_international'] = 1 if customer_country != merchant_country else 0
        
        # High-risk countries (expanded list)
        high_risk_countries = ['NG', 'RU', 'CN', 'BR', 'IN', 'PK', 'VN', 'ID', 'UA', 'RO']
        features['merchant_high_risk'] = 1 if merchant_country in high_risk_countries else 0
        features['customer_high_risk'] = 1 if customer_country in high_risk_countries else 0
        features['both_high_risk'] = 1 if (features['merchant_high_risk'] and features['customer_high_risk']) else 0
        
        # Device features
        device_type = transaction.get('device_type', 'unknown')
        features['device_mobile'] = 1 if device_type == 'mobile' else 0
        features['device_desktop'] = 1 if device_type == 'desktop' else 0
        features['device_unknown'] = 1 if device_type == 'unknown' else 0
        
        # Card features
        card_type = transaction.get('card_type', 'credit')
        features['is_credit_card'] = 1 if card_type == 'credit' else 0
        features['is_debit_card'] = 1 if card_type == 'debit' else 0
        features['card_manual_entry'] = transaction.get('is_manual_entry', 0)
        
        # Transaction type
        txn_type = transaction.get('transaction_type', 'purchase')
        features['is_withdrawal'] = 1 if txn_type == 'withdrawal' else 0
        features['is_transfer'] = 1 if txn_type == 'transfer' else 0
        features['is_purchase'] = 1 if txn_type == 'purchase' else 0
        
        # Historical features
        user_txn_count = transaction.get('user_transaction_count', 1)
        features['user_transaction_count'] = user_txn_count
        features['is_new_user'] = 1 if user_txn_count < 5 else 0
        features['is_very_new_user'] = 1 if user_txn_count == 1 else 0
        
        days_since_last = transaction.get('days_since_last_transaction', 1)
        features['days_since_last_txn'] = days_since_last
        features['long_gap_since_last'] = 1 if days_since_last > 30 else 0
        
        # Amount deviation
        avg_amount = transaction.get('user_avg_transaction', amount)
        features['user_avg_transaction'] = avg_amount
        if avg_amount > 0:
            features['amount_vs_avg_ratio'] = amount / avg_amount
            features['amount_deviation'] = abs(amount - avg_amount)
            features['amount_much_higher'] = 1 if amount > avg_amount * 3 else 0
        else:
            features['amount_vs_avg_ratio'] = 1.0
            features['amount_deviation'] = 0
            features['amount_much_higher'] = 0
        
        # Velocity features
        features['velocity_1h'] = transaction.get('velocity_1h', 1)
        features['velocity_24h'] = transaction.get('velocity_24h', 1)
        features['velocity_7d'] = transaction.get('velocity_7d', 1)
        features['high_velocity'] = 1 if features['velocity_1h'] > 3 else 0
        features['very_high_velocity'] = 1 if features['velocity_1h'] > 5 else 0
        
        # Merchant category (if available)
        merchant_category = transaction.get('merchant_category', 'retail')
        high_risk_categories = ['gambling', 'crypto', 'wire_transfer', 'money_order', 'gift_cards']
        features['high_risk_merchant'] = 1 if merchant_category in high_risk_categories else 0
        
        # Combined risk factors
        risk_score = 0
        if features['is_international']: risk_score += 1
        if features['merchant_high_risk']: risk_score += 2
        if features['is_night']: risk_score += 1
        if features['card_manual_entry']: risk_score += 1
        if features['is_new_user']: risk_score += 1
        if features['amount_much_higher']: risk_score += 2
        if features['high_velocity']: risk_score += 2
        
        features['combined_risk_score'] = risk_score
        features['high_risk_combination'] = 1 if risk_score >= 4 else 0
        
        return features
    
    def fit_scalers(self, X: pd.DataFrame):
        """Fit scalers on training data"""
        for col in X.select_dtypes(include=[np.number]).columns:
            scaler = StandardScaler()
            self.scalers[col] = scaler.fit(X[[col]])
            self.feature_stats[col] = {
                'mean': X[col].mean(),
                'std': X[col].std(),
                'min': X[col].min(),
                'max': X[col].max()
            }
    
    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """Transform features using fitted scalers"""
        X_scaled = X.copy()
        for col in X.select_dtypes(include=[np.number]).columns:
            if col in self.scalers:
                X_scaled[col] = self.scalers[col].transform(X[[col]])
        return X_scaled

# ==================== ENHANCED TRAINING DATA ====================

class EnhancedTrainingDataGenerator:
    """Generate realistic training data with real-world fraud patterns"""
    
    @staticmethod
    def generate_url_data(n_samples: int = 2000) -> Tuple[List[str], List[int]]:
        """Generate realistic URL training data with typosquatting"""
        urls = []
        labels = []
        
        # Legitimate URLs (50%)
        legit_domains = [
            'google.com', 'amazon.com', 'github.com', 'stackoverflow.com',
            'wikipedia.org', 'microsoft.com', 'apple.com', 'facebook.com',
            'linkedin.com', 'twitter.com', 'netflix.com', 'youtube.com'
        ]
        legit_paths = ['', '/home', '/about', '/products', '/services', '/contact', '/blog']
        
        for i in range(n_samples // 2):
            domain = np.random.choice(legit_domains)
            path = np.random.choice(legit_paths)
            protocol = 'https' if np.random.random() > 0.1 else 'http'
            www = 'www.' if np.random.random() > 0.5 else ''
            urls.append(f"{protocol}://{www}{domain}{path}")
            labels.append(0)
        
        # Fraudulent URLs (50%)
        fraud_patterns = [
            # Typosquatting with digit substitution
            'g00gle.com', 'g0ogle.com', 'go0gle.com', 'micr0soft.com',
            'amaz0n.com', 'faceb00k.com', 'yah00.com', 'paypa1.com',
            
            # Typosquatting with similar chars
            'gooogle.com', 'googlee.com', 'googlle.com', 'arnaz0n.com',
            'microosoft.com', 'rnicrosoft.com', 'applle.com', 'twittter.com',
            
            # Suspicious keywords + legitimate-looking domains
            'verify-google.com', 'secure-amazon.com', 'login-paypal.com',
            'account-microsoft.com', 'security-apple.com', 'confirm-netflix.com',
            'update-facebook.com', 'alert-bank.com',
            
            # Suspicious TLDs
            'google.tk', 'amazon.ml', 'microsoft.ga', 'paypal.cf',
            'facebook.pw', 'apple.xyz', 'netflix.top',
            
            # Phishing paths
            'banking-secure.com/verify', 'account-login.com/update',
            'secure-verify.com/account', 'payment-update.com/confirm'
        ]
        
        # Generate fraud URLs
        for i in range(n_samples // 2):
            if np.random.random() < 0.7:
                # Use predefined patterns
                base_url = np.random.choice(fraud_patterns)
            else:
                # Generate random suspicious URL
                suspicious_keywords = ['verify', 'secure', 'login', 'account', 'update', 'confirm']
                keyword = np.random.choice(suspicious_keywords)
                tld = np.random.choice(['.tk', '.ml', '.ga', '.cf', '.pw', '.xyz'])
                base_url = f"{keyword}-banking{i % 100}{tld}"
            
            protocol = 'http' if np.random.random() > 0.3 else 'https'
            path = '/login' if np.random.random() > 0.5 else '/phishing'
            urls.append(f"{protocol}://{base_url}{path}")
            labels.append(1)
        
        # Shuffle
        combined = list(zip(urls, labels))
        np.random.shuffle(combined)
        urls, labels = zip(*combined)
        
        return list(urls), list(labels)
    
    @staticmethod
    def generate_email_data(n_samples: int = 2000) -> Tuple[List[Dict], List[int]]:
        """Generate realistic email training data with phishing patterns"""
        emails = []
        labels = []
        
        # Legitimate emails (50%)
        legit_templates = [
            {
                'text': "Thank you for your order #{}. Your items will be shipped within 2-3 business days. Track your package using the link in your account.",
                'subject': "Order Confirmation #{}",
                'sender': "orders@company.com"
            },
            {
                'text': "Your monthly statement is now available. Login to your account to view your transactions and balance.",
                'subject': "Monthly Statement Available",
                'sender': "statements@yourbank.com"
            },
            {
                'text': "Meeting reminder: We have a team meeting scheduled for tomorrow at 2 PM in Conference Room B. Please review the attached agenda.",
                'subject': "Meeting Reminder - Tomorrow 2 PM",
                'sender': "calendar@company.com"
            },
            {
                'text': "Welcome to our newsletter! Here are this month's featured articles and product updates.",
                'subject': "Monthly Newsletter - {} Edition",
                'sender': "newsletter@company.com"
            }
        ]
        
        for i in range(n_samples // 2):
            template = np.random.choice(legit_templates)
            emails.append({
                'text': template['text'].format(100000 + i),
                'subject': template['subject'].format(100000 + i) if '{}' in template['subject'] else template['subject'],
                'sender': template['sender']
            })
            labels.append(0)
        
        # Phishing emails (50%) - REALISTIC PATTERNS
        phishing_templates = [
            {
                'text': "Dear Customer, We detected unusual activity in your account. For your safety, please verify your information immediately by clicking the link below: [Verify Your Account] Failure to verify within 24 hours may result in account suspension. Thank you, YourBank Security Team",
                'subject': "Urgent: Verify Your Account",
                'sender': "security@yourbank.com"
            },
            {
                'text': "URGENT ACTION REQUIRED! Your account has been temporarily suspended due to suspicious activity. Click here immediately to restore access and prevent permanent closure.",
                'subject': "URGENT: Account Suspended",
                'sender': "no-reply@account-security.tk"
            },
            {
                'text': "Your payment method needs to be updated. Please confirm your credit card details to continue using our service. Update now to avoid service interruption.",
                'subject': "Payment Update Required",
                'sender': "billing@service-update.ml"
            },
            {
                'text': "Congratulations! You've been selected for a special refund of $500. Click here to claim your refund by providing your bank account information.",
                'subject': "You Have a Pending Refund!!!",
                'sender': "refunds@tax-department.ga"
            },
            {
                'text': "Security Alert: We noticed unusual login attempts on your account. Verify your identity now by confirming your password and security questions.",
                'subject': "Security Alert - Action Required",
                'sender': "security-team@verify-account.cf"
            },
            {
                'text': "Your account will be closed within 24 hours unless you verify your information. Click the link below immediately to prevent account termination.",
                'subject': "Final Notice: Verify Account Now",
                'sender': "admin@account-verify.pw"
            }
        ]
        
        for i in range(n_samples // 2):
            template = np.random.choice(phishing_templates)
            emails.append({
                'text': template['text'],
                'subject': template['subject'],
                'sender': template['sender']
            })
            labels.append(1)
        
        # Shuffle
        combined = list(zip(emails, labels))
        np.random.shuffle(combined)
        emails, labels = zip(*combined)
        
        return list(emails), list(labels)
    
    @staticmethod
    def generate_transaction_data(n_samples: int = 2000) -> Tuple[List[Dict], List[int]]:
        """Generate realistic transaction training data"""
        transactions = []
        labels = []
        
        # Legitimate transactions (50%)
        for i in range(n_samples // 2):
            hour = np.random.choice(range(8, 22))  # Business hours mostly
            transactions.append({
                'amount': np.random.uniform(10, 500),
                'timestamp': datetime.now() - timedelta(hours=np.random.randint(1, 720)),
                'customer_country': np.random.choice(['US', 'US', 'US', 'CA', 'GB', 'DE']),
                'merchant_country': np.random.choice(['US', 'US', 'US', 'CA', 'GB']),
                'device_type': np.random.choice(['mobile', 'desktop', 'mobile']),
                'card_type': np.random.choice(['credit', 'debit']),
                'is_manual_entry': 0,
                'transaction_type': np.random.choice(['purchase', 'purchase', 'purchase', 'transfer']),
                'user_transaction_count': np.random.randint(20, 200),
                'user_avg_transaction': np.random.uniform(100, 300),
                'days_since_last_transaction': np.random.randint(1, 7),
                'velocity_1h': 1,
                'velocity_24h': np.random.randint(1, 5),
                'velocity_7d': np.random.randint(5, 30),
                'merchant_category': np.random.choice(['retail', 'grocery', 'restaurant', 'gas'])
            })
            labels.append(0)
        
        # Fraudulent transactions (50%)
        high_risk_countries = ['NG', 'RU', 'CN', 'BR', 'PK', 'VN']
        for i in range(n_samples // 2):
            fraud_type = np.random.choice(['high_amount', 'international', 'velocity', 'new_account', 'night'])
            
            if fraud_type == 'high_amount':
                # High amount transactions
                amount = np.random.uniform(2000, 10000)
                merchant_country = np.random.choice(high_risk_countries)
                velocity_1h = np.random.randint(1, 3)
                user_count = np.random.randint(10, 50)
            elif fraud_type == 'international':
                # International high-risk
                amount = np.random.uniform(500, 3000)
                merchant_country = np.random.choice(high_risk_countries)
                velocity_1h = 1
                user_count = np.random.randint(5, 30)
            elif fraud_type == 'velocity':
                # High velocity
                amount = np.random.uniform(100, 1000)
                merchant_country = np.random.choice(['US'] + high_risk_countries)
                velocity_1h = np.random.randint(5, 15)
                user_count = np.random.randint(1, 10)
            elif fraud_type == 'new_account':
                # New account, large transaction
                amount = np.random.uniform(1000, 5000)
                merchant_country = np.random.choice(high_risk_countries)
                velocity_1h = 1
                user_count = np.random.randint(1, 3)
            else:  # night
                # Late night transactions
                amount = np.random.uniform(500, 3000)
                merchant_country = np.random.choice(['US'] + high_risk_countries)
                velocity_1h = np.random.randint(1, 4)
                user_count = np.random.randint(1, 20)
            
            hour = np.random.choice(range(0, 6)) if fraud_type == 'night' else np.random.randint(0, 24)
            
            transactions.append({
                'amount': amount,
                'timestamp': datetime.now() - timedelta(hours=int(np.random.randint(1, 48))) + timedelta(hours=int(hour - 12)),
                'customer_country': 'US',
                'merchant_country': merchant_country,
                'device_type': np.random.choice(['desktop', 'mobile', 'unknown']),
                'card_type': 'credit',
                'is_manual_entry': np.random.choice([0, 1]),
                'transaction_type': np.random.choice(['purchase', 'withdrawal', 'transfer']),
                'user_transaction_count': user_count,
                'user_avg_transaction': np.random.uniform(50, 200),
                'days_since_last_transaction': np.random.randint(0, 30),
                'velocity_1h': velocity_1h,
                'velocity_24h': velocity_1h + np.random.randint(1, 5),
                'velocity_7d': velocity_1h + np.random.randint(5, 20),
                'merchant_category': np.random.choice(['retail', 'crypto', 'gambling', 'wire_transfer'])
            })
            labels.append(1)
        
        # Shuffle
        combined = list(zip(transactions, labels))
        np.random.shuffle(combined)
        transactions, labels = zip(*combined)
        
        return list(transactions), list(labels)

# ==================== MODELS (same structure as before) ====================

class FraudDetectionModel:
    """Enhanced fraud detection model"""
    
    def __init__(self, model_type: str = "random_forest"):
        self.model_type = model_type
        self.model = None
        self.feature_engineering = EnhancedFeatureEngineering()
        self.feature_names = []
        self.is_trained = False
        self.metrics = {}
        
    def _create_model(self):
        if self.model_type == "random_forest":
            return RandomForestClassifier(
                n_estimators=300,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                class_weight='balanced',
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == "gradient_boosting":
            return GradientBoostingClassifier(
                n_estimators=300,
                learning_rate=0.05,
                max_depth=8,
                min_samples_split=5,
                min_samples_leaf=2,
                subsample=0.8,
                random_state=42
            )
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
    
    def train(self, X: pd.DataFrame, y: np.ndarray):
        logger.info(f"Training {self.model_type} with {len(X)} samples...")
        
        self.feature_engineering.fit_scalers(X)
        X_scaled = self.feature_engineering.transform(X)
        self.feature_names = list(X.columns)
        
        self.model = self._create_model()
        self.model.fit(X_scaled, y)
        self.is_trained = True
        
        y_pred = self.model.predict(X_scaled)
        y_proba = self.model.predict_proba(X_scaled)[:, 1]
        
        self.metrics['train'] = {
            'accuracy': accuracy_score(y, y_pred),
            'precision': precision_score(y, y_pred),
            'recall': recall_score(y, y_pred),
            'f1': f1_score(y, y_pred),
            'roc_auc': roc_auc_score(y, y_proba)
        }
        
        logger.info(f"Training complete. Accuracy: {self.metrics['train']['accuracy']:.4f}")
        return self.metrics['train']
    
    def predict(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        if not self.is_trained:
            raise ValueError("Model must be trained first")
        
        X_scaled = self.feature_engineering.transform(X)
        predictions = self.model.predict(X_scaled)
        probabilities = self.model.predict_proba(X_scaled)[:, 1]
        
        return predictions, probabilities
    
    def evaluate(self, X: pd.DataFrame, y: np.ndarray) -> Dict:
        predictions, probabilities = self.predict(X)
        
        metrics = {
            'accuracy': accuracy_score(y, predictions),
            'precision': precision_score(y, predictions),
            'recall': recall_score(y, predictions),
            'f1': f1_score(y, predictions),
            'roc_auc': roc_auc_score(y, probabilities)
        }
        
        cm = confusion_matrix(y, predictions)
        metrics['confusion_matrix'] = cm.tolist()
        metrics['true_negatives'] = int(cm[0][0])
        metrics['false_positives'] = int(cm[0][1])
        metrics['false_negatives'] = int(cm[1][0])
        metrics['true_positives'] = int(cm[1][1])
        
        return metrics
    
    def get_feature_importance(self) -> Dict[str, float]:
        if not self.is_trained:
            return {}
        
        importance = self.model.feature_importances_
        feature_importance = {
            name: float(imp) 
            for name, imp in zip(self.feature_names, importance)
        }
        
        return dict(sorted(feature_importance.items(), 
                          key=lambda x: x[1], reverse=True))

class URLFraudDetector(FraudDetectionModel):
    def prepare_data(self, urls: List[str]) -> pd.DataFrame:
        features_list = []
        for url in urls:
            features = self.feature_engineering.extract_url_features(url)
            features_list.append(features)
        return pd.DataFrame(features_list)

class EmailFraudDetector(FraudDetectionModel):
    def prepare_data(self, emails: List[Dict]) -> pd.DataFrame:
        features_list = []
        for email in emails:
            features = self.feature_engineering.extract_email_features(
                email.get('text', ''),
                email.get('subject', ''),
                email.get('sender', '')
            )
            features_list.append(features)
        return pd.DataFrame(features_list)

class TransactionFraudDetector(FraudDetectionModel):
    def prepare_data(self, transactions: List[Dict]) -> pd.DataFrame:
        features_list = []
        for txn in transactions:
            features = self.feature_engineering.extract_transaction_features(txn)
            features_list.append(features)
        return pd.DataFrame(features_list)

# ==================== ENSEMBLE ====================

class EnhancedEnsembleFraudDetector:
    """Enhanced ensemble with better fraud detection"""
    
    def __init__(self):
        self.url_detector = URLFraudDetector("random_forest")
        self.email_detector = EmailFraudDetector("gradient_boosting")
        self.transaction_detector = TransactionFraudDetector("random_forest")
    
    def train_all(self):
        logger.info("Training enhanced ensemble models...")
        
        gen = EnhancedTrainingDataGenerator()
        
        # Train URL detector
        urls, url_labels = gen.generate_url_data(3000)
        url_features = self.url_detector.prepare_data(urls)
        self.url_detector.train(url_features, np.array(url_labels))
        
        # Train email detector
        emails, email_labels = gen.generate_email_data(3000)
        email_features = self.email_detector.prepare_data(emails)
        self.email_detector.train(email_features, np.array(email_labels))
        
        # Train transaction detector
        txns, txn_labels = gen.generate_transaction_data(3000)
        txn_features = self.transaction_detector.prepare_data(txns)
        self.transaction_detector.train(txn_features, np.array(txn_labels))
        
        logger.info("All models trained successfully!")
    
    def predict_url(self, url: str) -> Dict:
        features_df = self.url_detector.prepare_data([url])
        prediction, probability = self.url_detector.predict(features_df)
        
        # Extract key features for explanation
        features = features_df.iloc[0].to_dict()
        risk_factors = []
        
        if features.get('has_digit_substitution', 0) == 1:
            risk_factors.append("Contains digit substitution (e.g., 0 for O)")
        if features.get('similarity_to_popular', 0) > 0.7:
            risk_factors.append(f"Similar to popular domain (similarity: {features['similarity_to_popular']:.2f})")
        if features.get('suspicious_tld', 0) == 1:
            risk_factors.append("Uses suspicious TLD")
        if features.get('has_suspicious_keyword', 0) == 1:
            risk_factors.append("Contains suspicious keywords")
        
        result = {
            'prediction': 'FRAUDULENT' if prediction[0] == 1 else 'SAFE',
            'confidence': float(probability[0]),
            'risk_score': float(probability[0] * 100),
            'risk_factors': risk_factors,
            'model': 'url_detector'
        }
        
        return result
    
    def predict_email(self, email: Dict) -> Dict:
        features_df = self.email_detector.prepare_data([email])
        prediction, probability = self.email_detector.predict(features_df)
        
        features = features_df.iloc[0].to_dict()
        risk_factors = []
        
        if features.get('urgency_score', 0) > 0.3:
            risk_factors.append(f"High urgency language (score: {features['urgency_score']:.2f})")
        if features.get('phishing_pattern_count', 0) > 0:
            risk_factors.append(f"Contains {int(features['phishing_pattern_count'])} phishing patterns")
        if features.get('requests_personal_info', 0) == 1:
            risk_factors.append("Requests personal information")
        if features.get('has_threat_language', 0) == 1:
            risk_factors.append("Uses threatening language")
        if features.get('sender_brand_mismatch', 0) == 1:
            risk_factors.append("Sender domain doesn't match brand")
        
        result = {
            'prediction': 'FRAUDULENT' if prediction[0] == 1 else 'SAFE',
            'confidence': float(probability[0]),
            'risk_score': float(probability[0] * 100),
            'risk_factors': risk_factors,
            'model': 'email_detector'
        }
        
        return result
    
    def predict_transaction(self, transaction: Dict) -> Dict:
        features_df = self.transaction_detector.prepare_data([transaction])
        prediction, probability = self.transaction_detector.predict(features_df)
        
        features = features_df.iloc[0].to_dict()
        risk_factors = []
        
        if features.get('is_international', 0) == 1:
            risk_factors.append("International transaction")
        if features.get('merchant_high_risk', 0) == 1:
            risk_factors.append("High-risk merchant country")
        if features.get('is_night', 0) == 1:
            risk_factors.append("Transaction during unusual hours")
        if features.get('amount_much_higher', 0) == 1:
            risk_factors.append("Amount significantly higher than usual")
        if features.get('high_velocity', 0) == 1:
            risk_factors.append("High transaction velocity")
        if features.get('is_new_user', 0) == 1:
            risk_factors.append("New user account")
        
        result = {
            'prediction': 'FRAUDULENT' if prediction[0] == 1 else 'SAFE',
            'confidence': float(probability[0]),
            'risk_score': float(probability[0] * 100),
            'risk_factors': risk_factors,
            'model': 'transaction_detector'
        }
        
        return result

# ==================== MAIN DEMO ====================

def main():
    print("="*80)
    print("ENHANCED FRAUD DETECTION SYSTEM")
    print("="*80)
    
    # Initialize and train
    print("\n[1/3] Training models...")
    ensemble = EnhancedEnsembleFraudDetector()
    ensemble.train_all()
    
    # Test real-world examples
    print("\n[2/3] Testing Real-World Fraud Examples")
    print("="*80)
    
    # Test typosquatting URL
    print("\n--- URL Test: Typosquatting (g00gle.com) ---")
    test_url = "http://g00gle.com/login"
    result = ensemble.predict_url(test_url)
    print(f"URL: {test_url}")
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print(f"Risk Score: {result['risk_score']:.1f}/100")
    if result['risk_factors']:
        print("Risk Factors:")
        for factor in result['risk_factors']:
            print(f"  • {factor}")
    
    # Test legitimate URL
    print("\n--- URL Test: Legitimate (google.com) ---")
    test_url = "https://www.google.com/search"
    result = ensemble.predict_url(test_url)
    print(f"URL: {test_url}")
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print(f"Risk Score: {result['risk_score']:.1f}/100")
    
    # Test phishing email
    print("\n--- Email Test: Phishing ---")
    phishing_email = {
        'text': "Dear Customer, We detected unusual activity in your account. For your safety, please verify your information immediately by clicking the link below: [Verify Your Account] Failure to verify within 24 hours may result in account suspension. Thank you, YourBank Security Team",
        'subject': "Urgent: Verify Your Account",
        'sender': "security@yourbank.com"
    }
    result = ensemble.predict_email(phishing_email)
    print(f"Subject: {phishing_email['subject']}")
    print(f"Sender: {phishing_email['sender']}")
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print(f"Risk Score: {result['risk_score']:.1f}/100")
    if result['risk_factors']:
        print("Risk Factors:")
        for factor in result['risk_factors']:
            print(f"  • {factor}")
    
    # Test legitimate email
    print("\n--- Email Test: Legitimate ---")
    legit_email = {
        'text': "Thank you for your order #12345. Your items will ship within 2-3 business days.",
        'subject': "Order Confirmation #12345",
        'sender': "orders@amazon.com"
    }
    result = ensemble.predict_email(legit_email)
    print(f"Subject: {legit_email['subject']}")
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print(f"Risk Score: {result['risk_score']:.1f}/100")
    
    # Test suspicious transaction
    print("\n--- Transaction Test: Suspicious ---")
    suspicious_txn = {
        'amount': 3500.0,
        'timestamp': datetime.now().replace(hour=2),  # 2 AM
        'customer_country': 'US',
        'merchant_country': 'NG',
        'device_type': 'desktop',
        'card_type': 'credit',
        'is_manual_entry': 1,
        'transaction_type': 'withdrawal',
        'user_transaction_count': 2,
        'user_avg_transaction': 80.0,
        'days_since_last_transaction': 45,
        'velocity_1h': 1,
        'velocity_24h': 1,
        'velocity_7d': 2,
        'merchant_category': 'wire_transfer'
    }
    result = ensemble.predict_transaction(suspicious_txn)
    print(f"Amount: ${suspicious_txn['amount']:.2f}")
    print(f"Time: {suspicious_txn['timestamp'].strftime('%I:%M %p')}")
    print(f"Merchant Country: {suspicious_txn['merchant_country']}")
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print(f"Risk Score: {result['risk_score']:.1f}/100")
    if result['risk_factors']:
        print("Risk Factors:")
        for factor in result['risk_factors']:
            print(f"  • {factor}")
    
    # Test legitimate transaction
    print("\n--- Transaction Test: Legitimate ---")
    legit_txn = {
        'amount': 45.0,
        'timestamp': datetime.now().replace(hour=14),
        'customer_country': 'US',
        'merchant_country': 'US',
        'device_type': 'mobile',
        'card_type': 'credit',
        'is_manual_entry': 0,
        'transaction_type': 'purchase',
        'user_transaction_count': 150,
        'user_avg_transaction': 50.0,
        'days_since_last_transaction': 2,
        'velocity_1h': 1,
        'velocity_24h': 2,
        'velocity_7d': 12,
        'merchant_category': 'grocery'
    }
    result = ensemble.predict_transaction(legit_txn)
    print(f"Amount: ${legit_txn['amount']:.2f}")
    print(f"Category: {legit_txn['merchant_category']}")
    print(f"Prediction: {result['prediction']}")
    print(f"Confidence: {result['confidence']:.2%}")
    print(f"Risk Score: {result['risk_score']:.1f}/100")
    
    print("\n[3/3] Model Performance")
    print("="*80)
    print(f"URL Model - Accuracy: {ensemble.url_detector.metrics['train']['accuracy']:.3f}")
    print(f"Email Model - Accuracy: {ensemble.email_detector.metrics['train']['accuracy']:.3f}")
    print(f"Transaction Model - Accuracy: {ensemble.transaction_detector.metrics['train']['accuracy']:.3f}")
    
    print("\n" + "="*80)
    print("SYSTEM READY!")
    print("="*80)
    
    return ensemble

if __name__ == "__main__":
    ensemble = main()