# Mock Standard Operating Procedures (SOPs)

This document details the design specifications and contents of the 4 mock Standard Operating Procedure (SOP) documents used for the portfolio demonstration scenarios. 

To demonstrate real-world RAG capabilities and advanced agent troubleshooting, each SOP is structured to represent a comprehensive, **5-page policy document** (~2000-2500 words).

---

## SOP 1: E-Commerce Support Guidelines
*   **Business ID:** `ecommerce_demo`
*   **Company Name:** `ApexCart Retail`
*   **Tone:** Friendly, helpful, customer-centric.
*   **Scope:** Returns, damaged items, cancellations, promotional discounts, and shipping issues.
*   **Key Troubleshooting Steps & Requirements:**
    *   **Order Tracking:** Require the user to confirm their email address and Order ID. Explain that orders are in one of three states: *Processing*, *Shipped*, or *Delivered*.
    *   **Return Policy:** Return windows are strictly 30 days from delivery. Return shipping is free only for items marked "Free Returns" or if the item was received damaged/defective.
    *   **Damaged Goods:** Require proof of damage. If value is <$50, trigger a mock automatic replacement or refund. If value is >=$50, escalate to human support.
    *   **Cancellations:** Orders can only be cancelled if their status is *Processing*. Shipped orders must be returned instead.
    *   **Promo Codes:** Explains coupon stacking restrictions (only one promo code per order) and expired code policies (no exceptions except for first-time buyers where we can offer a 10% courtesy code).

---

## SOP 2: Credit Card Dispute Procedures
*   **Business ID:** `creditcard_demo`
*   **Company Name:** `Apex Credit & Trust`
*   **Tone:** Secure, professional, structured, cautious.
*   **Scope:** Unrecognized charges, merchant dispute flow, card locking/unlocking, annual fee waivers, and limit adjustments.
*   **Key Troubleshooting Steps & Requirements:**
    *   **Unrecognized Charge (Potential Fraud):** Immediately ask user if they have the physical card in possession. If lost/stolen, instruct the card block procedure and initiate replacement. If in possession, trigger transaction search.
    *   **Merchant Dispute:** Verify charge is not pending (must be posted). Ask if user attempted to resolve directly with the merchant first. Document transaction ID, merchant name, date, and dispute reason.
    *   **Card Lock/Unlock:** Instruct user how to lock card in mobile app. If they cannot access the app, verify account email and trigger mock action `lock_card`.
    *   **Fee Waiver Policy:** Only customers with accounts in good standing for >12 months and annual spend >$10,000 are eligible for an annual fee waiver. If ineligible, offer the option to downgrade card.
    *   **Credit Limit Increase:** Verify identity. Perform a soft check of employment status and income. If credit score is updated, apply maximum 20% limit boost.

---

## SOP 3: Internet Provider Support Manual
*   **Business ID:** `internet_demo`
*   **Company Name:** `Apex Broadband`
*   **Tone:** Highly technical, patient, systematic.
*   **Scope:** Router reboot protocols, connection drops, low Wi-Fi signal troubleshooting, outage validation, billing error claims, and upgrades.
*   **Key Troubleshooting Steps & Requirements:**
    *   **Connection Drops (Reboot Loop):** Guide user to unplug power cable, wait 30 seconds, and reconnect. If it fails, check LED indicators (Power, DSL/Cable, Internet, Wi-Fi) and ask which lights are flashing red.
    *   **Slow Speed/Low Signal:** Determine distance from the router. Advise moving closer or disconnecting high-bandwidth background downloads (torrents, streaming). Check if using 2.4GHz or 5GHz band.
    *   **Outage Validation:** Ask for zip code. Check regional outage database. If active outage, give ETA. If no active outage, schedule technician visit.
    *   **Billing Error Claims:** Resolve billing discrepancies. If overcharged due to promotion expiration, explain details. If due to service downtime, calculate service credit ($5 per day of outage).

---

## SOP 4: E-Learning Platform Help Desk
*   **Business ID:** `elearning_demo`
*   **Company Name:** `Apex Academix`
*   **Tone:** Encouraging, educational, supportive.
*   **Scope:** Course enrollment troubleshooting, payment/coupon failures, certificate generation, login resets, subscription management.
*   **Key Troubleshooting Steps & Requirements:**
    *   **Course Access:** Verify payment is completed. Instruct user to check "My Library" tab.
    *   **Coupon Codes:** Explain coupon conditions (certain courses excluded). If a coupon fails, verify code expiry and eligible category.
    *   **Certificate Errors:** Verify user has completed 100% of video lessons and passed all quizzes with >=70% score. If requirements met but certificate fails to generate, trigger `generate_certificate` action.
    *   **Subscription Cancellation:** Provide instructions to cancel auto-renew in account settings. If subscription was purchased via mobile app store (iOS/Android), explain that cancellation must be handled through Apple/Google subscriptions.
