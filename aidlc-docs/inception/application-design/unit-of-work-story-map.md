# Unit of Work — Story Map

## Story-to-Unit Assignment

### Unit 1: data-and-seed
| Story | Title | Priority |
|-------|-------|----------|
| US-01 | Database Initialization | Must |
| US-02 | Browse Transactions | Must |
| US-22 | Role Picker | Must |

---

### Unit 2: rule-engine
| Story | Title | Priority |
|-------|-------|----------|
| US-03 | View Rule Library | Must |
| US-04 | Create a New Rule | Must |
| US-05 | Edit/Deactivate a Rule | Should |
| US-06 | Run the Analyzer | Must |
| US-17 | Auto-Create Cases on Analyzer Run | Must |
| US-19 | View Dashboard | Must |

---

### Unit 3: alert-review
| Story | Title | Priority |
|-------|-------|----------|
| US-07 | View Open Alerts Queue | Must |
| US-08 | Review Alert Detail | Must |
| US-09 | Approve an Alert | Must |
| US-10 | Disapprove an Alert | Must |
| US-11 | Dismiss an Alert | Must |
| US-12 | View Suspicious Transactions | Must |
| US-16 | View Cases | Must |
| US-18 | Manage Cases Manually | Should |

---

### Unit 4: str-register
| Story | Title | Priority |
|-------|-------|----------|
| US-13 | Tag Alert as STR | Must |
| US-14 | View STR Register | Must |
| US-15 | Export STR Register as CSV | Must |
| US-20 | View Audit Log | Should |
| US-21 | Dark Mode Toggle | Could |
| US-23 | Production-Feel UI Polish | Could |

---

## Coverage Verification

| Story | Assigned to Unit | Verified |
|-------|-----------------|----------|
| US-01 | Unit 1 | Yes |
| US-02 | Unit 1 | Yes |
| US-03 | Unit 2 | Yes |
| US-04 | Unit 2 | Yes |
| US-05 | Unit 2 | Yes |
| US-06 | Unit 2 | Yes |
| US-07 | Unit 3 | Yes |
| US-08 | Unit 3 | Yes |
| US-09 | Unit 3 | Yes |
| US-10 | Unit 3 | Yes |
| US-11 | Unit 3 | Yes |
| US-12 | Unit 3 | Yes |
| US-13 | Unit 4 | Yes |
| US-14 | Unit 4 | Yes |
| US-15 | Unit 4 | Yes |
| US-16 | Unit 3 | Yes |
| US-17 | Unit 2 | Yes |
| US-18 | Unit 3 | Yes |
| US-19 | Unit 2 | Yes |
| US-20 | Unit 4 | Yes |
| US-21 | Unit 4 | Yes |
| US-22 | Unit 1 | Yes |
| US-23 | Unit 4 | Yes |

**All 23 stories assigned. No gaps.**

## MoSCoW by Unit

| Unit | Must | Should | Could |
|------|------|--------|-------|
| 1: data-and-seed | 3 | 0 | 0 |
| 2: rule-engine | 5 | 1 | 0 |
| 3: alert-review | 7 | 1 | 0 |
| 4: str-register | 3 | 1 | 2 |
| **Total** | **18** | **3** | **2** |
