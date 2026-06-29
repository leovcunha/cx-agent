import os

appendix = """
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
"""

path = os.path.join('policy_documents', 'creditcard_sop.md')
with open(path, 'a', encoding='utf-8') as f:
    f.write("\n\n" + appendix)
print('Successfully appended 3 deep sections.')
