Below is the **full, structured question and trigger system** based on Henry’s exact logic, translated into **clear, developer-ready flow rules**.

This is how the Audit platform must decide:

- ❓ Who needs an audit  
- ❓ Which audit  
- ❓ How deep  
- ❓ When to stop  

Nothing here is arbitrary.  
It follows Henry’s “extent → threshold → trigger → cost control” model.

---

# AUDIT ENTRY & TRIGGER QUESTION SYSTEM  
## (HENRY FLOW MODEL)

---

# STAGE 1 — INITIAL SCREENING (ALL BUSINESSES)

Every business must answer these first.

These decide if **any audit is needed at all**.

---

## Q1. Excess Stock Awareness

**Question:**

> Do you believe your business currently has excess or slow-moving stock?

Options:
- Yes
- Not sure
- No

### Trigger Logic:

| Answer | Action |
|--------|---------|
| Yes | Go to Q2 (Measure Extent) |
| Not sure | Go to Q2 |
| No | Skip to Spare Capacity Section |

---

## Q2. Excess Stock Extent (Dial/Slider)

**Question:**

> What do you estimate is the extent of your excess or unsold stock?

Slider:
0% → 100%

With helper text:
> Include slow-moving, old, damaged, or unsold items.

---

### Trigger Rules (Henry’s Cut-Off)

| % Range | System Action |
|---------|---------------|
| 0–6% | No audit triggered |
| 7–15% | Light audit |
| 16–30% | Standard audit |
| 31%+ | Full audit + Alert |

---

## Q3. Stock Impact Check

(Only if Q2 ≥ 7%)

**Question:**

> Is this excess stock affecting your cash flow or storage space?

Options:
- Yes, seriously
- Yes, a little
- Not yet
- Not sure

---

### Trigger Logic

| Answer | Impact Level |
|--------|--------------|
| Yes, seriously | High priority |
| Yes, a little | Medium |
| Not yet | Low |
| Not sure | Medium |

---

# STAGE 2 — SPARE CAPACITY SCREENING

Now the system checks underutilization.

---

## Q4. Spare Capacity Awareness

**Question:**

> Do you believe your business has unused staff time, equipment, or space?

Options:
- Yes
- Not sure
- No

---

### Trigger Logic

| Answer | Action |
|--------|---------|
| Yes | Go to Q5 |
| Not sure | Go to Q5 |
| No | Skip to Stage 3 |

---

## Q5. Spare Capacity Extent (Dial)

**Question:**

> What percentage of your available capacity do you think is currently unused?

Slider:
0% → 100%

Helper:
> Include idle staff, empty space, unused machines, quiet periods.

---

### Trigger Rules

| % Range | System Action |
|---------|---------------|
| 0–6% | No audit |
| 7–15% | Light audit |
| 16–30% | Standard audit |
| 31%+ | Full audit + Alert |

---

## Q6. Capacity Impact Check

(Only if ≥ 7%)

**Question:**

> Is this unused capacity costing you money?

Options:
- Yes, clearly
- Possibly
- Not yet
- Not sure

---

### Trigger Logic

Same as stock impact.

---

# STAGE 3 — CONFIDENCE & VALIDATION (HENRY SAFETY NET)

Henry insisted on re-checking.

---

## Q7. Confidence Validation (Stock)

If Excess ≥ 15%

> How confident are you in your estimate of excess stock?

Options:
- Very confident
- Fairly confident
- Guessing
- Not sure

---

### Trigger

| Answer | Action |
|--------|---------|
| Guessing / Not sure | AI asks clarifying questions |

---

## Q8. Confidence Validation (Capacity)

Same structure.

---

# STAGE 4 — FINANCIAL CONTEXT (COST REALITY)

Before full audit, Henry wants money context.

---

## Q9. Staff Cost

> Approximately how much do you spend on staff per month?

Options:
- Under minimum wage
- Around minimum wage
- Above minimum wage
- Not sure

---

## Q10. Stock Value

> What is the approximate value of your current stock?

Ranges:
- Under £5k
- £5k–£20k
- £20k–£50k
- £50k+

---

## Q11. Revenue Level

> Average monthly turnover?

Ranges.

---

### Purpose:
Convert operational waste into money loss.

---

# STAGE 5 — DECISION ENGINE (AUTOMATED)

System now decides:

---

## A. NO AUDIT PATH

Triggered if:

- Stock < 7% AND
- Capacity < 7%

Result:

> “You currently do not need a full audit.”

Suggest:
- Monitoring tools
- Light guidance

---

## B. PARTIAL AUDIT PATH

Triggered if:

- One area ≥ 7%
- Other < 7%

Result:
- Only relevant audit unlocked

---

## C. FULL AUDIT PATH

Triggered if:

- Any area ≥ 16%
- OR impact = “serious”

Result:
- Full paid audit
- Priority flag

---

## D. CRITICAL PATH

Triggered if:

- ≥ 31%
- + serious impact
- + high costs

Result:
- Full audit
- Consultant alert
- Escalation

---

# STAGE 6 — RECOMMENDATION GATE

Before audit purchase:

---

## Q12. Readiness

> Are you prepared to act on the results of this audit?

Options:
- Yes
- Maybe
- Not yet

---

### Logic

| Answer | Action |
|--------|---------|
| Yes | Proceed |
| Maybe | Education |
| Not yet | Delay |

---

# COMPLETE FLOW SUMMARY (FOR DEVELOPERS)

```
START
 ↓
Q1–Q2 (Stock)
 ↓
Q4–Q5 (Capacity)
 ↓
Validation
 ↓
Financial Context
 ↓
Decision Engine
 ↓
Audit Unlock
```

---

# CORE HENRY PRINCIPLE IMPLEMENTED

This system ensures:

✔ No wasted audits  
✔ No unnecessary cost  
✔ Real impact first  
✔ Reality check  
✔ Proportional response  

As Henry said:

> “If there’s really very little… there’s no point doing the audit.”

---

If you want, next I can build:

✅ The **exact UI wireframe logic**  
✅ The **API decision tree**  
✅ The **admin configuration panel**

Tell me which one.

