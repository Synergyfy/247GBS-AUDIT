I actually think this is the right place to stop and separate the project into modules, because **Henry's Audit** naturally breaks into independent user journeys.

I would document them as:

1. **Audit Entry & Triage** (Landing Page → Login → Triage → Audit Dashboard)
2. **Main Audit** (Short & Long Audit)
3. **Audit Results & Business Diagnosis**
4. **Recommended Solutions & Implementation Roadmap**
5. **Account Manager Workflow**
6. **Admin Workflow**

For now, we'll only build **Module 1**, exactly as you requested.

---

# MCOM AUDIT PLATFORM

# MODULE 1

# AUDIT ENTRY, TRIAGE & AUDIT DASHBOARD

---

# PURPOSE

The purpose of Module 1 is **not** to audit the business.

Its purpose is to:

* Welcome the business owner.
* Authenticate the user through MCOM Central.
* Explain why the assessment is important.
* Complete the Free Business Triage.
* Analyse the responses.
* Determine whether the business requires a Short Audit or Long Audit.
* Prepare the business owner for the main audit.

At the end of this module, **no recommendations are shown**. The only outcome is the assignment of the correct audit path.

---

# USER ENTRY FLOW

A business owner may arrive at the Audit Platform from several places:

* MCOM Central Dashboard
* MCOM Mall
* MCOM Rewards & Loyalty
* 247GBS Website
* Agent or Account Manager invitation
* QR Code
* Email invitation
* Direct Audit URL

Regardless of where they come from, they all arrive at the same Audit landing page.

---

# PAGE 1

# Audit Landing Page

This is the public landing page for the Audit Platform.

The objective is to explain the value of the audit before asking the user to sign in.

---

## Hero Section

### Heading

**Discover Hidden Opportunities Inside Your Business**

### Sub-heading

Our Business Audit helps identify operational challenges, growth opportunities, excess stock, spare capacity, customer retention issues, marketing gaps, and other factors affecting business performance.

Complete a free Business Triage to determine the most appropriate audit for your business.

---

### Benefits Section

The page explains that the audit helps businesses:

* Identify hidden profit opportunities.
* Discover excess stock.
* Identify spare capacity.
* Improve customer retention.
* Increase visibility.
* Improve operational efficiency.
* Build a structured growth plan.

---

### Call-to-Action

Primary button:

**Get Started**

Secondary link:

**Learn More**

---

# USER CLICKS "GET STARTED"

The Audit Platform checks authentication.

---

## Decision Logic

### User already authenticated through MCOM Central

↓

Automatically log into the Audit Platform using Single Sign-On.

Proceed directly to the Welcome screen.

---

### User not authenticated

Display:

**Sign In**

Email

Password

Buttons:

* Sign In

* Create Account

---

## Create Account

Selecting **Create Account** does **not** create an account inside the Audit Platform.

Instead, the user is redirected to the MCOM Central registration page because Henry has consistently stated that there must be a single onboarding process for the entire ecosystem.

After successful registration, the user is returned to the Audit Platform and automatically signed in.

---

# PAGE 2

# Welcome Screen

This is the first page a newly authenticated user sees.

---

## Heading

**Welcome, {Business Name}**

---

## Introduction

Your business profile has already been created through MCOM Central.

The next step is to complete a free Business Triage.

This short assessment helps us understand your business and determine which audit is most appropriate for you.

Estimated completion time:

**Approximately 5 minutes**

---

### Information Box

The Business Triage:

* is free
* is not the full audit
* does not require preparation
* helps determine the appropriate audit
* forms the starting point for your business assessment

---

### Button

**Start Free Business Triage**

---

# TRIAGE PROCESS

Henry repeatedly referred to this as:

* Free Survey
* Pre-Audit
* Triage

It is intentionally short and straightforward.

The interface should feel conversational and easy to complete.

---

# TRIAGE STRUCTURE

Instead of presenting a long scrolling questionnaire, divide the triage into stages.

Henry specifically requested stage-based progress rather than relying only on percentages. 

---

## Stage 1 of 5

### Business Performance

Purpose:

Understand the overall condition of the business.

Example questions:

* How would you describe your business performance today?
* Are sales increasing, stable, or declining?
* Are you currently profitable?
* Do you regularly measure business performance?

---

## Stage 2 of 5

### Operations

Purpose:

Identify operational inefficiencies.

Example questions:

* Do you currently have excess stock?
* Do you have unused capacity?
* Are there operational challenges affecting profitability?
* Are there processes you believe could be improved?

---

## Stage 3 of 5

### Customers & Marketing

Purpose:

Understand customer acquisition and retention.

Example questions:

* Do you currently have a loyalty programme?
* Are you actively marketing your business?
* Do you know how new customers find your business?
* Do you experience repeat customers?

---

## Stage 4 of 5

### Growth & Technology

Purpose:

Understand growth readiness.

Example questions:

* Do you currently sell online?
* Do you use business software?
* Are you planning to grow within the next 12 months?
* Are you looking for new customers?

---

## Stage 5 of 5

### Business Priorities

Purpose:

Identify the business owner's immediate concerns.

Example questions:

* What is your biggest business challenge today?
* Which area would you most like to improve first?
* What outcome would make the biggest difference to your business?

---

# TRIAGE PROGRESS

At the top of every page display:

```text
Business Triage

Stage 3 of 5

Questions 8 of 15

Estimated Time Remaining
2 minutes
```

This provides clear orientation throughout the process.

---

# TRIAGE COMPLETION

After the final question:

Display a processing screen.

---

## Processing Screen

Heading:

**Analysing Your Business Assessment**

Message:

Please wait while we analyse your responses and determine the most appropriate audit for your business.

This usually takes only a few moments.

A progress animation can reinforce that the system is performing an assessment rather than instantly displaying a result.

---

# TRIAGE ANALYSIS

The system evaluates the responses against predefined business rules.

It determines:

* overall business complexity
* severity of identified issues
* breadth of operational challenges
* whether a Short Audit or Long Audit is required

The user is **not** asked to choose.

This decision is made automatically by the platform.

---

# PAGE

# TRIAGE RESULT

Heading:

**Business Triage Complete**

---

## Summary

Thank you for completing your Business Triage.

Based on your responses, we have identified the most appropriate audit for your business.

---

## Assigned Audit

Display one of:

### Short Business Audit

or

### Long Business Audit

Include:

* Estimated completion time.
* Number of stages.
* Approximate number of questions.

Example:

**Recommended Audit**

Long Business Audit

Estimated Time:

30 minutes

Stages:

10

Approximate Questions:

60

---

## Explanation

Provide a brief explanation of why this audit has been assigned, without exposing internal scoring logic.

Example:

Your responses indicate that your business would benefit from a more comprehensive assessment covering multiple operational areas.

---

## Call-to-Action

**Continue to My Audit Dashboard**

---

# PAGE

# AUDIT DASHBOARD

This is the user's first dashboard within the Audit Platform.

It is intentionally simple because the user has not yet completed the main audit.

---

## Header

Business Name

Audit Status

Last Updated

---

## Main Audit Card

Display:

**Assigned Audit**

Short Business Audit

or

Long Business Audit

Status:

Ready to Start

Estimated Time

Number of Stages

Questions

---

## Progress

Since no audit has started:

```
Progress

0%

Not Started
```

---

## Primary Action

**Start Audit**

---

## Secondary Information

Below the audit card include a short note explaining that the assigned audit has been selected automatically based on the Business Triage and is tailored to the business profile already created in MCOM Central, including the sector chosen during onboarding.

---

## Module 1 End State

At this point, the business owner has:

* Completed onboarding in MCOM Central.
* Authenticated into the Audit Platform.
* Read the purpose of the assessment.
* Completed the Free Business Triage.
* Had the system determine the correct audit path.
* Been assigned either a Short Business Audit or Long Business Audit.
* Arrived at their Audit Dashboard with their assigned audit ready to begin.

The **Start Audit** button becomes the entry point into Module 2, where the sector-specific Short or Long Audit begins automatically based on the business sector stored in MCOM Central.