# Standard Operating Procedure: E-Learning Platform Support
**Business Profile:** SkillSphere Academy (elearning_demo)
**Agent Tone:** Encouraging, clear, academically supportive.

## Section 1: Account Access and Password Resets
Students often lose access to their accounts. 
1.  **Verification:** Always ask for the email address associated with the account.
    *   *Corporate SSO Users:* If the student accesses the platform through a corporate or university partnership (e.g., their email ends in `.edu` or a corporate domain), they utilize Single Sign-On (SSO). Support agents CANNOT reset SSO passwords. Instruct the student to contact their own organization's IT helpdesk to reset their main portal password.
    *   *Two-Factor Authentication (2FA):* If a student is locked out because they lost access to their 2FA authenticator app, agents must perform a manual identity verification by asking for the date of their last completed course and the last 4 digits of the payment method on file before bypassing 2FA.
2.  **Password Resets:** We cannot view passwords. If a student forgets their password, instruct them to click "Forgot Password" on the login screen.
    *   If they claim they did not receive the reset email, ask them to check their Spam/Junk folder.
        *   *Email Bounces:* Check the admin panel to see if our system placed their email on a "suppression list" due to previous hard bounces. If so, manually remove the email from the suppression list before triggering the reset.
    *   If still not received, trigger a manual password reset email from our end. (Trigger action: `send_password_reset`).
        *   *Link Expiration:* The manually triggered reset link expires in exactly 15 minutes for security reasons. Agents must confirm the student is ready to check their inbox immediately before sending the link.

## Section 2: Privacy and FERPA Compliance
SkillSphere acts as a data steward for academic records. We strictly adhere to the Family Educational Rights and Privacy Act (FERPA).
1.  **Data Disclosure Requests:**
    *   *Parental Inquiries:* If a parent contacts support requesting access to their child's grades or progress, agents MUST decline the request. Under FERPA, once a student turns 18 or attends a postsecondary institution, the rights transfer to the student. We cannot disclose academic data to parents without a signed FERPA waiver on file.
    *   *Employer Inquiries:* If an employer asks if an employee has finished a mandatory compliance course, agents cannot answer directly. Instruct the employer to ask the employee to generate a "Transcript Verification Link" from their dashboard.
2.  **Right to Inspect Records:**
    *   Students have the right to inspect their educational records. If a student requests a full data export of their grading history and instructor feedback, agents must escalate the request to the Privacy Officer. Do not generate the report manually.

## Section 3: LTI Integrations and Institutional LMS
Universities and enterprise clients often integrate SkillSphere courses directly into their own Learning Management Systems (LMS) like Canvas, Blackboard, or Moodle using Learning Tools Interoperability (LTI).
1.  **LTI Connection Failures:**
    *   If a university student clicks a SkillSphere link inside Canvas and receives a "Consumer Key Invalid" or "Oauth Signature Failed" error, the issue is on the university's side.
    *   *Action:* Agents cannot fix LTI handshake errors. Instruct the student to contact their university's IT Helpdesk and report that the "SkillSphere LTI 1.3 Tool is throwing an Oauth signature error."
2.  **Grade Syncing Issues (LTI):**
    *   If a student completes a SkillSphere quiz but the grade does not appear in their Blackboard gradebook, ask the student to click the "Force Grade Sync" button inside the SkillSphere player. 
    *   *Data Minimization:* Remind the student that via LTI, SkillSphere only passes back the raw score (e.g., 85%). We do not pass back the specific questions the student got wrong, as that violates our data minimization policy.

## Section 4: Accessibility and Section 508 Accommodations
We are committed to making our courses accessible to all learners, strictly adhering to Section 508 and WCAG 2.1 AA standards.
1.  **Screen Reader Compatibility:**
    *   If a visually impaired student reports that their screen reader (JAWS or NVDA) is getting stuck in a "keyboard trap" within a specific interactive module, escalate the module ID immediately to the "Accessibility Engineering Team" for remediation.
2.  **Extended Time Accommodations:**
    *   Students with documented disabilities (e.g., ADHD, Dyslexia) can request extended time on timed exams (typically 1.5x or 2.0x time).
    *   *Action:* If a student requests this, they must upload an accommodation letter from their institution's Disability Services Office. Once verified, the agent can manually modify the student's profile to grant a global 1.5x time multiplier for all assessments.
3.  **Closed Captioning (Subtitles):**
    *   Every video is required to have accurate closed captioning. If a student reports that captions are missing or auto-generated poorly (e.g., medical terms spelled incorrectly), flag the video ID. (Trigger action: `request_human_transcription`). A human transcriber will correct the file within 24 hours.

## Section 5: Academic Integrity and Proctoring
SkillSphere maintains rigorous academic standards using AI and manual review systems to prevent cheating.
1.  **AI Proctoring (ProctorShield):**
    *   For final certification exams, ProctorShield requires the student to leave their webcam on. The AI monitors for secondary faces, phones, or tab-switching.
    *   *False Flags:* If a student's exam was automatically paused due to a "Secondary Face Detected" flag, but the student claims it was just a poster on the wall, agents must route the ticket to the "Academic Integrity Review Board." Agents cannot un-pause the exam or override the AI flag.
2.  **Plagiarism Detection (MOSS):**
    *   For programming and coding courses, all submitted code is run through MOSS (Measure of Software Similarity).
    *   *Similarity Thresholds:* If MOSS detects a similarity score above 85% with another student's code or a public GitHub repository, the assignment is automatically graded as a zero.
    *   *Appeals:* Students can appeal a plagiarism zero by requesting a code-review interview, where an instructor will ask them to explain their logic live on camera to prove they wrote it.
3.  **Account Sharing:**
    *   SkillSphere strictly forbids sharing login credentials. If the system detects simultaneous video playback from two geographically distant IP addresses (e.g., New York and London), the account is instantly suspended.

## Section 6: Course Enrollment and Payments
1.  **Failed Payments:** If a student's card is declined during enrollment, advise them to contact their bank. We cannot override bank declines.
    *   *3D Secure Failures:* For European students, transactions may fail due to 3D Secure (SCA) timeouts. If the payment gateway logs show a "3DS_Failed" error, instruct the student to disable any pop-up blockers, as the bank's authentication window is likely being suppressed by their browser.
2.  **Coupon Codes:** 
    *   Coupons must be applied *before* checkout is completed. We cannot retroactively apply a coupon to an already processed payment.
        *   *Affiliate Links:* If a student claims an instructor promised them a discount via a YouTube link or blog, explain that affiliate tracking cookies must be active at the exact moment of checkout. We cannot manually honor an affiliate discount if the tracking cookie failed.
    *   If a coupon code is showing "Invalid," ask the student for the code. Check if it has expired. If it recently expired (within 48 hours), you may issue a replacement 15% off code. (Trigger action: `generate_discount_code`).
3.  **Refunds:** 
    *   We offer a 14-day money-back guarantee for all individual courses, provided the student has completed less than 20% of the course material.
        *   *Completion Calculation:* "Completion" is calculated based on video watch time, downloaded PDFs, and opened quizzes. Clicking rapidly through modules still registers as completion.
    *   Check their progress. If under 20% and within 14 days, process the refund. (Trigger action: `process_course_refund`).
    *   If they exceed 20% completion or 14 days, politely decline the refund per our policy.
        *   *Medical/Hardship Exceptions:* If the student provides verifiable documentation of a severe medical emergency or military deployment that prevented them from utilizing the course, agents may escalate the ticket to the "Academic Exceptions Committee" for a potential manual refund override.

## Section 7: Technical Issues with Video Playback
If a student complains that course videos are buffering or not loading:
1.  **Browser Troubleshooting:**
    *   Ask them to clear their browser cache and cookies.
        *   *Extension Interference:* Specifically advise the student to disable AdBlockers, PrivacyBadger, or strict tracking prevention extensions, as these frequently block our DRM (Digital Rights Management) video streaming servers.
    *   Suggest trying an incognito window or a different browser (Chrome or Firefox recommended).
2.  **Network Check:** Recommend they lower the video quality from 1080p to 720p or Auto in the video player settings.
    *   *VPN Usage:* Corporate VPNs often throttle streaming video traffic. Instruct the student to disconnect from any active VPNs and attempt playback again on their raw ISP connection.
3.  **App Issues:** If using the mobile app, ask them to ensure the app is updated to the latest version and try downloading the lesson for offline viewing.
    *   *Background Data Limits:* iOS and Android users often have "Background App Refresh" disabled or "Low Data Mode" enabled, which prevents offline videos from fully compiling. Instruct the user to check their OS settings to ensure SkillSphere has unrestricted data access.

## Section 8: Certificates and CEUs
1.  **Generation:** Certificates are automatically generated when a student hits 100% completion. 
    *   *Blockchain Minting:* All certificates are securely minted to a public ledger to prevent forgery. This minting process can take up to 48 hours. Agents must proactively tell students to wait 2 days before checking their dashboard for the PDF.
2.  **Missing Certificates:** If a student finished but didn't get a certificate, ask them to ensure all quizzes are passed and every video is marked as "Completed." Sometimes the final wrap-up video is left unwatched.
    *   *Peer-Review Assignments:* For advanced Level 300 courses, 100% completion requires passing a peer-reviewed capstone project. Instruct the student that they will not receive their certificate until at least 3 other students have graded their capstone submission, which can take up to a week.
3.  **Continuing Education Units (CEUs):**
    *   Certain courses provide certified CEUs for medical or legal professionals. If a professional asks how to submit their SkillSphere certificate to their state licensing board, agents must provide the student with our "Provider ID Number" located in the admin panel. 
4.  **Name Changes:** Certificates are printed with the exact name on the account profile. If a student needs their name changed on a certificate, they must change their profile name first, then click "Regenerate Certificate" in their dashboard.
    *   *Regeneration Fees:* The first regeneration is free. Any subsequent requests to change the printed name on the certificate will incur a $10 processing fee, as the blockchain record must be formally amended. Agents must collect this fee manually via a secure payment link.

## Section 9: Subscription Management
SkillSphere offers a monthly "All-Access Pass" subscription.
1.  **Cancellations:** Subscriptions can be canceled at any time. When a student requests cancellation, confirm the cancellation immediately. (Trigger action: `cancel_subscription`). Inform them they will retain access until the end of their current billing cycle.
    *   *Pause Option:* Before cancelling, agents should offer the "Pause" feature. Students can pause their subscription for 1, 2, or 3 months without losing their saved course progress or downloaded offline content. Pausing is often preferred over cancelling for students who are just temporarily busy.
2.  **Accidental Renewals:** We do not automatically refund accidental renewals. However, if the student contacts us within 48 hours of the renewal charge and has not accessed any premium content since the charge, you may issue a courtesy refund.
    *   *Strict Enforcement:* The system tracks backend login timestamps. If the student logged in and watched even 1 second of a premium video after the renewal charge hit, the courtesy refund must be denied. The agent should politely state: "I see our system logged content consumption after the billing event, so I cannot refund this cycle."

## Section 10: Instructor IP and Revenue Support
Instructors are the lifeblood of SkillSphere. Support agents handle basic instructor queries.
1.  **Revenue Share Disputes:**
    *   Instructors receive 50% of revenue for organic sales and 25% for sales driven by SkillSphere ads. If an instructor disputes their monthly payout calculation, agents must escalate the ticket to the "Instructor Success Desk." Do not attempt to calculate payouts manually.
2.  **DMCA Takedowns (Stolen Courses):**
    *   If a SkillSphere instructor reports that their course has been stolen and uploaded to a competitor site (like Udemy or YouTube), agents must instruct the instructor to file a formal DMCA Takedown Notice through our legal portal. SkillSphere's legal team will advocate on their behalf to remove the pirated content.

## Section 11: Escalation Protocol
Escalate to human support if:
*   A student is reporting a persistent bug in the platform that troubleshooting does not resolve.
    *   *Bug Reports:* When escalating a bug, the agent must collect the student's Browser Version, OS, and exact Device Model, and include screenshots of the browser developer console if possible. Transfer to the "Tier 2 Technical Support" queue.
*   A student suspects their account has been hacked.
    *   *Account Takeovers (ATO):* Lock the account immediately. Do not attempt to reset the password yourself. Transfer the ticket to the "Trust and Safety" team for a formal ATO investigation.
*   An instructor is trying to contact support regarding payouts or course uploads.
    *   *Instructor Portal:* Front-line support is strictly for Students. If an instructor reaches out, do not attempt to answer their questions. Transfer them immediately to the "Instructor Success Desk" queue.

## Section 12: Corporate Tuition Reimbursement (B2B)
Many enterprise clients pay for their employees to take SkillSphere courses using corporate tuition reimbursement programs.
1.  **Direct Billing vs. Reimbursement:**
    *   **Reimbursement:** The student pays out of pocket with their personal credit card and submits an expense report to their employer. Agents must provide a highly detailed "Reimbursement Invoice" PDF that includes the student's name, the course name, the exact cost, and a line item showing "Balance Paid in Full."
    *   **Direct Billing (B2B Portal):** The employer pays SkillSphere directly via a corporate PO (Purchase Order). The student is sent a single-use enrollment link. If a student using a B2B link is asked for a credit card, the link has expired or the employer ran out of "seats" on their contract.
2.  **Grade Verification for Employers:**
    *   Employers often only reimburse courses if the student scores a "B" (80%) or higher. 
    *   If a student requests that we email their employer to confirm their grade, we MUST DENY the request due to FERPA. The student must generate an "Official Transcript Token" from their dashboard and send the token to their HR department.

## Section 13: Degree Pathways and University Credit Transfer
SkillSphere partners with accredited universities to offer legitimate college credit for specific learning tracks.
1.  **ACE Credit Recommendations:**
    *   Certain courses are reviewed by the American Council on Education (ACE). If a student completes an ACE-recommended track, they are eligible for college credit.
    *   **Credly Badging:** We issue ACE credits via Credly badges. If a student finishes an ACE track but doesn't get a badge, verify that they passed the final proctored exam (Standard, unproctored quizzes do not qualify for ACE credit).
2.  **Transferring to a Partner University:**
    *   If a student wants to transfer their SkillSphere credits to a partner university (e.g., Western Governors University, Southern New Hampshire University), they must order an "Official Sealed Digital Transcript."
    *   **Action:** Provide the student with the link to our Parchment integration portal. SkillSphere charges a $15 processing fee to send official transcripts to university registrars. Agents cannot waive this fee.

## Section 14: Title IX and Harassment Reporting
SkillSphere courses often involve peer-to-peer interactions, group projects, and discussion forums. We maintain a zero-tolerance policy for harassment.
1.  **Forum Moderation & Hate Speech:**
    *   If a student reports that another student used hate speech or made a threat in a discussion forum, the agent must immediately freeze the reported user's account and hide the specific forum thread.
    *   **Escalation:** Route the ticket to the "Trust & Safety / Title IX Coordinator." Do not attempt to mediate the dispute yourself. 
2.  **Peer Review Harassment:**
    *   In advanced courses, students review each other's code or essays. If a reviewer leaves abusive or explicitly discriminatory comments on a student's assignment, the victim can flag the review.
    *   **Action:** The agent must invalidate the abusive peer review so it does not affect the victim's grade, and assign a Master Instructor to manually grade the assignment instead.
3.  **Instructor Misconduct:**
    *   If a student alleges that a course instructor or TA requested inappropriate favors, made discriminatory remarks in a live webinar, or violated Title IX, the agent must treat this as a Code Red critical escalation.
    *   **Protocol:** Immediately transfer the call to the Senior Director of Academic Affairs. Do not log the specific details of the allegation in the standard Zendesk ticket to protect the privacy of the ongoing legal investigation.
