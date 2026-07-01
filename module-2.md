I think Module 2 is where Henry's vision becomes significantly different from a traditional online questionnaire.

One thing became very clear from all of Henry's meetings:

> **The Audit is not a form. It is a guided business diagnostic.**

The user should never feel like they are filling in a survey.

They should feel like they are progressing through a structured business review.

Another thing Henry repeatedly corrected was that the audit should explain **what it is assessing**, **why it is asking the questions**, and **what stage of the business it is currently reviewing**.

So Module 2 should be designed as a **Business Assessment Journey**, not simply a list of questions.

---

# MCOM AUDIT PLATFORM

# MODULE 2

# MAIN BUSINESS AUDIT

**(Short Audit & Long Audit Flow)**

---

# PURPOSE

The purpose of Module 2 is to conduct a structured business assessment based on:

* The business sector selected during MCOM Central onboarding.
* The audit type assigned during the Business Triage.
* The business profile already stored in MCOM Central.

At the end of Module 2, the platform should have gathered enough information to diagnose the business and generate tailored recommendations.

No recommendations are shown during the audit itself.

---

# ENTRY POINT

The user arrives from Module 1.

They are on the Audit Dashboard.

They see:

```text
Assigned Audit

Restaurant Long Audit

Ready to Start

Estimated Time

28 Minutes

START AUDIT
```

The sector label (Restaurant in this example) comes directly from MCOM Central. The user is not asked to select it again.

---

# USER CLICKS

## START AUDIT

The platform loads:

* Business Profile
* Business Sector
* Assigned Audit Type

The system automatically chooses the correct question bank.

Example logic:

```text
Sector

Restaurant

+

Assigned Audit

Long

↓

Restaurant Long Audit
```

Or

```text
Retail

+

Short Audit

↓

Retail Short Audit
```

There are no manual selections.

---

# AUDIT INTRODUCTION

Before the first question, present a brief orientation.

---

## Heading

**Business Audit**

---

## Introduction

This assessment will review different areas of your business.

Each stage focuses on a specific aspect of your operations.

Your answers help us identify opportunities, diagnose issues, and prepare the most appropriate recommendations for your business.

---

Display:

Estimated Time

Number of Stages

Approximate Number of Questions

---

Button

**Begin Assessment**

---

# AUDIT STRUCTURE

Henry wanted the audit organised into stages.

Not one long questionnaire.

Not pages of unrelated questions.

Each stage should focus on one business discipline.

---

# AUDIT HEADER

Visible throughout the audit.

```text
Restaurant Long Audit

Stage 2 of 10

Stock & Inventory

Question

6 of 18

Estimated Remaining

18 Minutes
```

---

The header should remain fixed while progressing.

---

# STAGE INTRODUCTION

Before every stage, briefly explain its purpose.

Example:

---

## Stage 3

### Customers & Loyalty

We are now reviewing how your business acquires, retains, and engages customers.

This helps identify opportunities to increase repeat business and customer value.

---

Button

Continue

---

Only then begin the questions.

This gives context and reduces fatigue.

---

# QUESTION PRESENTATION

Each screen should contain one primary question.

Avoid long pages with dozens of questions.

Each question includes:

* Question
* Optional guidance
* Answer controls
* Previous
* Next
* Save Progress

---

Example

### How would you describe your current stock levels?

Guidance:

Include slow-moving and excess inventory where applicable.

Answer:

* No excess stock
* Small amount
* Moderate amount
* Significant amount
* Unsure

---

Henry revised questions to ask for the **extent** of an issue rather than simple yes/no answers because the quality of recommendations depends on actionable information.

---

# QUESTION TYPES

The audit engine should support:

### Multiple Choice

Single selection.

---

### Multiple Selection

Where more than one answer applies.

---

### Rating Scale

Example:

Very Poor

Poor

Average

Good

Excellent

---

### Numeric Entry

Example:

Approximate monthly turnover.

---

### Percentage

Example:

Estimated percentage of excess stock.

---

### Currency

Example:

Monthly marketing budget.

---

### Date

Where appropriate.

---

### Short Text

Used sparingly.

---

### Long Text

For business owner comments.

---

# CONDITIONAL QUESTIONS

Questions should adapt to previous answers.

Example:

Question:

Do you currently have excess stock?

If:

No

↓

Skip stock detail questions.

If:

Yes

↓

Ask:

Estimated value.

Age of stock.

Storage impact.

Current disposal method.

Henry consistently emphasised that the audit should gather meaningful information, not unnecessary answers.

---

# SAVE PROGRESS

Businesses may not complete the audit in one session.

The platform should automatically save:

* Current stage
* Current question
* Answers already completed

If the user leaves:

Return to the same question.

---

# STAGE COMPLETION

At the end of every stage:

Display:

```text
Stage Complete

Customers & Loyalty

Completed Successfully

Next Stage

Marketing
```

Button:

Continue

---

# LIVE SCORING

During the audit the system continuously analyses answers.

The user does not see scores.

Internal scoring may include:

* Inventory
* Sales
* Marketing
* Customer Retention
* Technology
* Operations
* Staffing
* Financial Management
* Growth Readiness

Scores are used later by the recommendation engine.

---

# AUDIT REVIEW

Before submission:

Display:

## Review Your Responses

Show:

Stage 1 ✓

Stage 2 ✓

Stage 3 ✓

...

Allow:

Edit Stage

Edit Answers

---

No diagnosis yet.

Only confirmation.

---

# FINAL CONFIRMATION

Heading

Ready to Submit

Message

You have completed your Business Audit.

Your responses will now be analysed to produce a detailed business diagnosis and a tailored set of recommended solutions.

---

Button

Submit Audit

---

# PROCESSING SCREEN

After submission.

Display:

## Analysing Your Business

The platform is reviewing:

✓ Business Profile

✓ Business Sector

✓ Audit Responses

✓ Business Health Indicators

✓ Operational Risks

✓ Growth Opportunities

✓ Inventory Position

✓ Customer Performance

✓ Marketing Effectiveness

✓ Operational Efficiency

✓ Technology Readiness

Animation or progress indicator reinforces that the system is performing a comprehensive analysis.

---

# ANALYSIS ENGINE

This stage is not visible to the user but is critical to the platform.

The engine combines:

* MCOM Central business profile.
* Sector.
* Short or Long Audit responses.
* Internal business scoring.
* Rule-based recommendations.
* AI-assisted narrative generation where appropriate.

It classifies:

* Business strengths.
* Business weaknesses.
* Immediate risks.
* Medium-term opportunities.
* Long-term opportunities.
* Priority issues.
* Sector benchmarks (where available).

---

# AUDIT STATUS UPDATE

Once analysis completes:

The Audit Dashboard updates.

Instead of:

```text
Status

Ready to Start
```

It now shows:

```text
Status

Completed
```

A new section appears:

```text
Business Diagnosis

Ready
```

Primary button:

**View Business Diagnosis**

This becomes the entry point to Module 3.

---

# Module 2 End State

By the end of Module 2, the system has:

* Loaded the correct audit automatically based on the sector from MCOM Central and the audit type assigned by triage.
* Guided the user through a structured, stage-based business assessment rather than a generic questionnaire.
* Collected detailed, sector-specific business information.
* Used conditional logic to avoid irrelevant questions.
* Continuously scored the business internally without exposing incomplete results.
* Allowed users to save and resume progress at any point.
* Validated and submitted the completed audit.
* Analysed the responses and prepared the Business Diagnosis.

At this point, the business owner has **not yet received recommendations**. They have completed the assessment, and the platform is ready to present the Business Diagnosis, which is the focus of **Module 3**.