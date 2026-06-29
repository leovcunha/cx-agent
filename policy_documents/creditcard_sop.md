# Standard Operating Procedure: Credit Card Services
**Business Profile:** Horizon Bank Card Services (creditcard_demo)
**Agent Tone:** Professional, secure, empathetic.

## Section 1: Unauthorized Transactions & Fraud
Security is our top priority. When a customer reports a transaction they do not recognize, follow these strict protocols:
1.  **Card Locking:** Immediately offer to lock the card to prevent further charges. (Trigger action: `lock_credit_card`). Ask: "To secure your account, may I lock your current card while we investigate?"
    *   *Hard Lock vs. Soft Lock:* A "Soft Lock" allows recurring subscriptions (like Netflix or utility bills) to process while blocking new point-of-sale transactions. A "Hard Lock" declines absolutely everything. Agents must default to a Hard Lock if physical theft is suspected, and a Soft Lock if the customer just misplaced their card in their own home.
    *   *Digital Wallets:* Locking the physical card automatically suspends tokens for Apple Pay, Google Pay, and Samsung Pay. Inform the customer they cannot use their phone to tap-to-pay while the card is locked.
2.  **Verification:** Ask the customer to review the merchant name, amount, and date. Sometimes merchants use parent company names that customers don't recognize.
    *   *Merchant Category Code (MCC) Check:* If the customer is unsure, check the MCC. For example, if a customer doesn't recognize "AWSPROV," check the MCC (which would indicate web hosting). This often jogs their memory.
    *   *Friendly Fraud Detection:* Ask if any authorized users (spouses, children) had access to the card. If an authorized user made the charge, it is classified as a "Civil Dispute" and cannot be processed as fraud under Federal Regulation Z.
3.  **Dispute Initiation:** If the customer confirms they did not make the charge, initiate a fraud dispute. 
    *   Inform them that provisional credit for the disputed amount will be applied to their account within 3-5 business days.
    *   The current card MUST be cancelled and a replacement issued. (Trigger action: `issue_replacement_card`). Standard shipping is free (7-10 days). Expedited shipping is $15 (2-3 days).
    *   *Provisional Credit Revocation:* Warn the customer that if the Visa/Mastercard arbitration process determines the charge was actually legitimate (e.g., the merchant provides a signature or IP address match), the provisional credit will be reversed after 90 days.
    *   *Expedited Shipping Waiver:* If the customer is a "Horizon Wealth Management" client (account balances >$250,000), the $15 expedited shipping fee is automatically waived. Do not charge them.

## Section 2: Anti-Money Laundering (AML) & KYC Compliance
Horizon Bank is strictly regulated by the Patriot Act and FinCEN. Certain activities trigger automated AML holds.
1.  **Suspicious Activity Reports (SAR):**
    *   If a customer attempts to pay their credit card bill using multiple money orders, cash deposits exceeding $10,000, or wire transfers from high-risk foreign jurisdictions, the system will freeze the account.
    *   *Agent Action:* Agents must NEVER inform the customer that they are under investigation for money laundering, as this constitutes "tipping off" (a federal crime). Instead, state: "Your account is currently under a routine administrative review."
2.  **Know Your Customer (KYC) Renewals:**
    *   Every 3 years, high-net-worth clients must re-verify their source of wealth and identity.
    *   *Missing KYC Data:* If a customer's account is locked due to missing KYC information, agents must instruct them to upload a copy of their unexpired passport and a recent utility bill to the secure document portal. We do not accept emailed documents.
3.  **Sanctions Screening:**
    *   If an accountholder's name matches a newly published OFAC (Office of Foreign Assets Control) sanctions list, the account is immediately frozen. Agents cannot unfreeze OFAC accounts under any circumstances and must route the caller directly to the Legal Department.

## Section 3: Visa/Mastercard Chargeback Reason Codes
When a customer disputes a transaction (not related to fraud), agents must properly classify the dispute using exact network reason codes to ensure we win the chargeback.
1.  **Services Not Provided / Merchandise Not Received (Code 13.1):**
    *   *Use Case:* The customer paid for an item but it never arrived, or a contractor took a deposit and vanished.
    *   *Requirement:* The customer must have attempted to resolve the issue with the merchant first. Ask the customer: "On what date did you contact the merchant, and what was their response?" If they haven't contacted the merchant, advise them to do so and call back in 48 hours.
2.  **Defective or Not as Described (Code 13.3):**
    *   *Use Case:* The customer ordered a blue shirt and received a red one, or the item arrived broken.
    *   *Requirement:* The customer must return the item or attempt to return it. We cannot file this dispute unless the customer provides the return tracking number showing they sent it back to the merchant.
3.  **Cancelled Recurring Subscription (Code 13.2):**
    *   *Use Case:* The customer cancelled a gym membership or software subscription, but was billed anyway.
    *   *Requirement:* Ask for the exact date of cancellation and the cancellation confirmation number or email. Without proof of cancellation, the merchant will win the dispute.
4.  **Credit Not Processed (Code 13.6):**
    *   *Use Case:* The customer returned an item and the merchant promised a refund, but 15 days have passed and no refund appeared.
    *   *Requirement:* The customer must provide the merchant's return receipt or email confirming the refund was approved.

## Section 4: Fee Waivers
Customers frequently request waivers for late fees or annual fees. Evaluate these requests strictly based on the following criteria:
1.  **Late Payment Fees:** 
    *   **First-time offense:** If the customer has not had a late fee waived in the past 12 months, you are authorized to waive it. (Trigger action: `waive_late_fee`).
        *   *Grace Period Execution:* The late fee waiver can only be executed if the customer agrees to make the minimum payment *while on the phone* with the agent, or if they set up Auto-Pay for future months.
    *   **Repeat offense:** If a fee was waived in the last 12 months, decline the request politely. Explain: "I see we waived a late fee recently. Our policy allows for one courtesy waiver per rolling 12-month period, so I am unable to waive this fee today."
        *   *System Hard-Stop:* The internal system will literally block the `waive_late_fee` command if the 12-month rule is violated. Agents should not attempt to override this or ask a supervisor for an override.
2.  **Annual Fees:** We do **not** waive annual fees under any circumstances. If a customer threatens to cancel their card over the annual fee, you may offer a retention bonus of 5,000 rewards points instead of a fee waiver. If they still want to cancel, transfer them to the Retention Department.
    *   *Downgrade Alternative:* If the retention bonus is rejected, agents may offer a "Product Change" to downgrade the customer to a no-annual-fee card (e.g., downgrading from Horizon Platinum to Horizon Basic). This preserves their credit history.

## Section 5: Servicemembers Civil Relief Act (SCRA) & MLA Compliance
Federal law provides strict financial protections for active-duty military personnel.
1.  **Interest Rate Caps (SCRA):**
    *   Under the SCRA, any credit card debt incurred *prior* to entering active duty must have its interest rate capped at 6% APR for the duration of their active service.
    *   *Application:* Customers must apply for SCRA benefits by submitting a copy of their active-duty military orders to the Military Services Desk.
2.  **Military Lending Act (MLA):**
    *   The MLA applies to accounts opened *while* the customer is already on active duty. It caps the Maximum Annual Percentage Rate (MAPR) at 36%, which includes interest, annual fees, and credit insurance premiums.
    *   *Annual Fee Waiver:* Because of the complex MAPR calculation, Horizon Bank proactively waives all annual fees for confirmed active-duty members to ensure strict compliance with the MLA.
3.  **Deployment Grace Periods:**
    *   If a servicemember is deployed to a combat zone (e.g., a designated imminent danger pay area), the bank automatically pauses all minimum payment requirements and late fees for the duration of the deployment.

## Section 6: Credit Limit Increases
Customers may request a higher credit limit. 
1.  **Eligibility:**
    *   The account must be open for at least 6 months.
    *   The account must be in good standing (no late payments in the last 6 months).
    *   *Income to Debt Ratio:* The customer's stated annual income divided by their total credit lines across all banks cannot exceed 40%. If it does, the CLI will be automatically declined.
2.  **Processing:**
    *   If they meet eligibility, instruct them that they must apply for the increase through their secure online banking portal or mobile app under "Account Services." We cannot process limit increases directly via chat.
        *   *Soft vs Hard Pull:* Remind the customer that requesting via the app performs a "Soft Pull" (no credit score impact). Requesting a manual override over the phone requires a "Hard Pull" (impacts credit score).
    *   If they do not meet eligibility, politely inform them they need 6 months of positive payment history before an increase can be considered.
        *   *Adverse Action Letter:* By law (ECOA), if an automated limit increase is denied, the customer will receive an "Adverse Action Letter" in the mail within 7-10 days explaining the specific credit bureau reasons (e.g., "Too many recent inquiries"). Agents cannot see these specific reasons on their screen.

## Section 7: Collections and Delinquency Routing
Delinquent accounts are routed to different internal teams based on how many days they are past due (DPD).
1.  **30 Days Past Due:**
    *   *Impact:* The late payment is officially reported to the credit bureaus.
    *   *Routing:* General support agents can still handle these calls. Focus on taking a payment over the phone to bring the account current.
2.  **60-90 Days Past Due:**
    *   *Impact:* The card is permanently revoked. Even if the customer pays in full, the account cannot be reopened.
    *   *Routing:* Transfer immediately to the "Pre-Collections Strategy" team. They are authorized to offer short-term payment plans.
3.  **120+ Days Past Due (Charge-Off):**
    *   *Impact:* The bank deems the debt uncollectible and "charges it off" as a loss. The debt is then sold to a third-party collection agency (e.g., Portfolio Recovery Associates).
    *   *Routing:* Do NOT attempt to take a payment. Inform the customer: "Your account has been placed with an external agency. You must contact them directly at 1-800-555-0199 to arrange payment."

## Section 8: Travel Notices
To prevent cards from being declined while traveling, customers should set travel notices.
1.  If a customer is traveling soon, ask for their destination(s) and the start/end dates of their trip.
    *   *Maximum Duration:* A single travel notice cannot exceed 90 days. If the customer is expatriating or studying abroad for 6 months, they must update their primary residential address rather than using a travel notice.
2.  Log the travel notice. (Trigger action: `set_travel_notice`).
    *   *Sanctioned Countries:* Travel notices cannot be set for OFAC-sanctioned countries (e.g., North Korea, Iran, Syria, Cuba). Inform the customer their Horizon card will not function in these territories under any circumstances.
3.  Advise the customer that while the notice is set, our fraud algorithms still monitor for highly anomalous behavior, so keeping their contact phone number updated is crucial.
    *   *Foreign Transaction Fees:* Remind the customer that standard cards incur a 3% Foreign Transaction Fee on all non-USD purchases. The "Horizon Elite Passport" card has 0% foreign transaction fees.

## Section 9: Estate Management (Deceased Account Holders)
Handling accounts of deceased customers requires empathy and strict legal compliance.
1.  **Notification of Death:**
    *   If a family member calls to report a cardholder has passed away, express condolences: "I am so sorry for your loss. Let me help you secure this account."
    *   *Action:* Immediately place a "Deceased Hold" on the account. This stops all automated late fees, interest charges, and marketing mailers.
2.  **Executor Verification:**
    *   We cannot discuss the account balance or debt forgiveness with anyone except the legally appointed Executor of the Estate.
    *   *Document Collection:* Instruct the caller to mail or fax a certified copy of the Death Certificate and the Letters Testamentary (court documents proving executor status) to the Estate Recovery Unit.
3.  **Debt Forgiveness vs. Estate Claim:**
    *   If there are no assets in the estate, Horizon Bank will typically forgive the remaining credit card debt. However, if the deceased had significant assets, the bank will file a formal claim against the estate in probate court to recover the balance. Agents should never promise debt forgiveness over the phone.

## Section 10: Card Replacement
1.  **Damaged Card:** If a card is physically damaged but not compromised, issue a replacement with the same card number. It is free.
    *   *Metal Cards:* If the customer has a premium metal card (e.g., Horizon Obsidian), they must return the damaged metal card using the provided prepaid envelope for secure destruction, as it cannot be shredded in a standard home shredder.
2.  **Lost/Stolen Card:** If a card is lost or stolen, it must be reported immediately. Follow the "Unauthorized Transactions" protocol to lock the card and issue a new one with a new number.
    *   *Recurring Charges Update:* When a new card number is issued, Horizon Bank utilizes "Visa Account Updater" to automatically send the new card number to participating merchants (like Netflix, AT&T). However, customers should still manually update small or local merchants to avoid service interruptions.

## Section 11: Escalation Protocol
Transfer to a Human Specialist immediately if:
*   The customer suspects identity theft (e.g., accounts opened in their name).
    *   *Action:* Transfer to the "Fraud Investigations Unit." Inform the customer they should also place a freeze on their credit files with Experian, Equifax, and TransUnion.
*   The customer is experiencing a severe hardship (e.g., natural disaster, medical emergency) and cannot make minimum payments.
    *   *Action:* Transfer to the "Financial Relief Department." This department can temporarily freeze interest rates, pause minimum payments for 3 months, and waive all late fees under the disaster relief protocol.
*   The customer requests account closure.
    *   *Action:* Transfer to the "Retention Department." Do not attempt to close the account yourself. The retention agent will review the account for closing procedures, balance transfers, and reward point forfeiture.






## Section 12: Fraud Investigation Deep Dive (Regulatory Frameworks)
When escalating a case to the Fraud Investigations Unit (FIU), front-line agents must gather precise documentation. The distinction between a billing error and true identity theft governs our regulatory response timelines.
1.  **Regulation Z vs. Regulation E Applicability:**
    *   *Credit Cards (Reg Z):* Credit cards are governed by the Truth in Lending Act (TILA) / Regulation Z. The maximum liability for unauthorized credit card use is historically capped at $50, but Horizon Bank policy waives this entirely (Zero Liability Policy) provided the fraud is reported within 60 days of the statement date.
    *   *Debit Cards (Reg E):* If the customer holds a debit card with Horizon Bank, remind them that Electronic Fund Transfer Act (EFTA) / Regulation E applies. Liability can jump to $500 if not reported within 2 business days, and unlimited if not reported within 60 days. Agents must never confuse these two regulatory timelines when advising customers.
2.  **Identity Theft Affidavits:**
    *   If a customer claims an entire account was opened fraudulently in their name (Application Fraud), a standard dispute form is insufficient.
    *   *FTC Report:* The customer MUST file a report at IdentityTheft.gov and provide the official FTC Identity Theft Report number to the bank. 
    *   *Notarization:* Horizon Bank requires a notarized Identity Theft Affidavit to be mailed to the FIU. We provide a prepaid FedEx label for this. Once received, the bank has 30 days to conclude the investigation.
3.  **Police Reports for Physical Theft:**
    *   If the physical card was stolen during a mugging, burglary, or out of a vehicle, ask if a police report was filed.
    *   *Filing Requirement:* A police report is NOT strictly required to initiate a fraud claim, but it vastly accelerates the provisional credit process. If the stolen amount exceeds $5,000, a police report becomes mandatory before the FIU will finalize the write-off.
4.  **Friendly Fraud and Family Disputes:**
    *   Often, a 'fraudulent' charge was made by a child (e.g., in-app purchases on a mobile game) or a spouse. 
    *   *Civil Matter:* If the customer admits a family member made the charge, the agent must immediately close the fraud claim. Explain clearly: "Because the card was accessed by someone in your household, this is considered a civil matter, not bank fraud. You must seek reimbursement directly from the family member or the merchant."
    *   *Prosecution Agreement:* If the customer insists it is fraud despite it being a family member, they must sign a "Willingness to Prosecute" form, indicating they are willing to press criminal charges against their family member. This usually deters false friendly-fraud claims.

## Section 13: Credit Bureau Reporting and Disputes (FCRA Compliance)
Under the Fair Credit Reporting Act (FCRA), Horizon Bank is legally obligated to furnish accurate information to the three major credit bureaus (Equifax, Experian, TransUnion).
1.  **Direct Disputes vs. Indirect Disputes:**
    *   *Indirect (e-OSCAR):* When a customer disputes a late mark directly with a credit bureau, the bureau sends us an automated ping via the e-OSCAR system (Automated Credit Dispute Verification - ACDV). We have exactly 30 days to respond. If we fail to respond, the bureau deletes the late mark.
    *   *Direct Disputes:* Customers can also mail a dispute directly to Horizon Bank. Agents must route these letters to the "Credit Bureau Dispute Resolution Team."
2.  **Tradeline Deletion Policy:**
    *   Customers frequently ask for "Goodwill Deletions"—removing an accurate late payment mark because they are trying to buy a house.
    *   *Strict Prohibition:* Horizon Bank policy strictly forbids goodwill deletions. If the payment was late, it must remain on the credit report for 7 years. Altering accurate data violates our furnisher agreement with the bureaus. Agents must state: "We are legally required to report accurate historical data, and cannot remove late marks that were genuinely incurred."
3.  **Bank Errors in Reporting:**
    *   If the late mark was due to a bank error (e.g., our auto-pay system crashed on the due date), we MUST delete the tradeline.
    *   *Agent Action:* (Trigger action: `initiate_bureau_correction`). The agent must submit an internal ticket detailing the system outage. The correction takes 30-45 days to reflect on the customer's end. Offer the customer a "Letter of Credit Correction" (a physical PDF letter) they can show to their mortgage underwriter in the meantime.
4.  **Authorized User Reporting:**
    *   Authorized users (AUs) inherit the credit history of the primary cardholder's account.
    *   *Removing an AU:* If an AU wants to be removed because the primary cardholder maxed out the card and ruined the AU's credit score, the AU can call in and request removal.
    *   *Bureau Update:* Once removed, the entire history of that card is wiped from the AU's credit report within 30 days. It does not stay on their report.

## Section 14: Specialized Account Handling (Legal and Hardship)
Agents will encounter accounts controlled by third parties or protected by federal bankruptcy courts. Adhering strictly to legal routing is paramount.
1.  **Power of Attorney (POA):**
    *   A customer may have an agent acting on their behalf via a Power of Attorney.
    *   *Verification:* We cannot speak to the POA until the physical POA document has been reviewed and approved by the Horizon Bank Legal Department. 
    *   *Durable vs. Springing:* The legal team must verify if the POA is "Durable" (active immediately) or "Springing" (only active if the primary customer is incapacitated, which requires a doctor's note). Agents must tell unverified callers: "I see a POA flag is pending review. Until legal approves it, I cannot discuss this account."
2.  **Conservatorships and Guardianships:**
    *   Similar to a POA, but court-ordered. If a customer has been deemed legally incompetent, the court appoints a Conservator.
    *   *Card Access:* The original customer's physical cards must be immediately deactivated, and a new card issued solely in the name of the Conservator. The original customer is permanently locked out of online banking.
3.  **Bankruptcy (Chapter 7 vs. Chapter 13):**
    *   The moment a customer says the word "Bankruptcy," the agent must STOP attempting to collect a debt. The Automatic Stay injunction is federally mandated.
    *   *Chapter 7 (Liquidation):* The debt is typically discharged entirely. We will close the account and write off the balance.
    *   *Chapter 13 (Reorganization):* The customer is put on a 3-5 year court-approved repayment plan. We may receive partial payments from the bankruptcy trustee.
    *   *Routing:* Ask for the customer's Bankruptcy Case Number and the specific Chapter filed, then immediately transfer the call to the "Bankruptcy Recovery Unit." Do not discuss balances, payments, or interest rates.
4.  **Cease and Desist (C&D) Letters:**
    *   Under the Fair Debt Collection Practices Act (FDCPA), if a customer verbally states "Stop calling me," or sends a written Cease and Desist letter, we must comply immediately.
    *   *System Flag:* (Trigger action: `apply_cease_and_desist_flag`). This stops all outbound auto-dialer calls.
    *   *Exceptions:* Even with a C&D active, we are legally allowed to contact the customer one final time to inform them we are taking specific legal action (e.g., filing a lawsuit to garnish wages).

## Section 15: Cross-Border Transactions and OFAC Holds
Global commerce requires strict monitoring of cross-border financial flows.
1.  **Dynamic Currency Conversion (DCC):**
    *   When traveling abroad, foreign merchants often ask customers if they want to pay in USD or the local currency. 
    *   *Agent Advice:* Always advise customers to pay in the LOCAL currency. If they choose USD, the merchant applies a heavily inflated exchange rate (DCC markup). Horizon Bank cannot dispute or refund the DCC markup, as the customer authorized it at the point of sale.
2.  **OFAC Sanctions and Wire Blocks:**
    *   If a customer attempts a balance transfer or wire to a bank in a heavily sanctioned jurisdiction (e.g., Russia, Iran, North Korea), the transaction is instantly blocked.
    *   *Routing:* Do not attempt to override the block. Transfer the customer to the "Global Trade Compliance Desk." 
3.  **Foreign Transaction Fees:**
    *   Unless the customer holds a premium travel card (e.g., Horizon World Elite), a 3% Foreign Transaction Fee (FTF) applies to all purchases processed outside the USA.
    *   *Online Purchases:* Customers are often confused when they are charged an FTF while sitting in their living room. Explain that the merchant's payment processor was physically located in another country (e.g., Spotify processing in Sweden), which triggers the fee regardless of the customer's physical location.

## Section 16: Co-Branded Retail Cards and Loyalty Integration
Horizon Bank issues co-branded credit cards for major retail partners (e.g., Skyways Airlines, OmniMart).
1.  **Loyalty Point Discrepancies:**
    *   Horizon Bank does not manage the retail partner's loyalty program. We only manage the credit line. 
    *   *Point Transfer Timing:* Points earned on the credit card are transferred to the partner's loyalty account once per month, exactly 3 days after the statement closing date. If a customer is angry that their miles haven't posted yet for a flight they want to book, explain this batch-transfer schedule. We cannot expedite point transfers.
2.  **Closed Loop vs. Open Loop Cards:**
    *   *Closed Loop:* Cards that can ONLY be used at the specific retailer (e.g., an OmniMart Store Card).
    *   *Open Loop:* Cards with a Visa/Mastercard logo that can be used anywhere.
    *   *Declines:* If a customer tries to use a Closed Loop card at a gas station and it declines, the agent must explain the network limitation.
3.  **Retailer Bankruptcy or Program Termination:**
    *   If the retail partner goes bankrupt, Horizon Bank will automatically convert the co-branded card into a standard Horizon Bank cash-back card. Agents must reassure callers that their credit line and account history remain perfectly intact, preserving their credit score.

## Section 17: Balance Transfer Promotional APRs and Payment Allocation
Balance transfers are highly sensitive due to complex interest rate calculations.
1.  **Promotional Periods:**
    *   If a customer accepts a "0% APR for 15 Months" balance transfer offer, they must make the transfer within the first 60 days of account opening.
    *   *Transfer Fees:* A 3% to 5% balance transfer fee applies immediately. Remind the customer that transferring $10,000 will result in a $300 fee added to the balance.
2.  **Payment Allocation Rules (CARD Act):**
    *   Customers often have multiple balances at different APRs on the same card (e.g., $5,000 balance transfer at 0%, and $1,000 in new purchases at 22%).
    *   *Minimum Payment:* Under the federal CARD Act, the Minimum Payment is always applied to the lowest APR balance first.
    *   *Excess Payment:* Any amount paid OVER the minimum payment must be applied to the HIGHEST APR balance first. 
    *   *Grace Period Loss:* Warn customers that if they carry a balance transfer, they lose the interest grace period on all new purchases unless they pay the ENTIRE statement balance (including the balance transfer amount) in full. This is a common point of friction, and agents must explain it clearly.
