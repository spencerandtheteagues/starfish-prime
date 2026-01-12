# DATA_MODEL — Firestore Collections (Authoritative, No Placeholders)

## Collections
### caregivers/{caregiverId}
- role: "caregiver"
- linkedSeniorIds: string[]
- notificationPrefs: { push: true, sms: false, email: false }

### seniors/{seniorId}
- displayName: string
- preferredAddress: string (e.g., "Joe")
- timeZone: string (IANA)
- cognitiveBand: "A" | "B" | "C" | "D"
- sharedRoomMode: boolean
- quietHours: [{ start: "21:00", end: "07:00" }]
- subscriptionMode: "BASIC" | "BUDDY_PLUS"

### seniors/{seniorId}/medications/{medId}
- name: string
- dosageText: string
- appearanceNotes: string
- scheduleTimes: string[]  # ["11:45", "18:00"]
- critical: boolean

### seniors/{seniorId}/appointments/{apptId}
- title: string
- datetime: ISO string
- location: string
- notes: string

### seniors/{seniorId}/reminders/{remId}
- title
- schedule
- critical
- enabled

### seniors/{seniorId}/avoidanceRules/{ruleId}
- triggerTerms: string[]
- severity: "low" | "medium" | "high"
- redirectionTargets: string[]
- active: boolean

### seniors/{seniorId}/memory/{memoryId}
- type: "preference" | "routine" | "emotional" | "care"
- summary: string
- createdAt: ISO
- expiresAt: ISO|null

### seniors/{seniorId}/logs/{logId}
- timestamp: ISO
- category: string
- severity: 1..5
- summary: string
- structured: object

### seniors/{seniorId}/alerts/{alertId}
- timestamp: ISO
- category: "SAFETY_EXPLICIT" | "ADHERENCE" | "SYSTEM"
- severity: 1..5
- summary: string
- recommendedAction: string
- acknowledged: boolean

### seniors/{seniorId}/reports/{reportId}
- type: "daily" | "weekly" | "monthly"
- periodStart: ISO
- periodEnd: ISO
- sections: object[]
- highlights: string[]
- concerns: string[]
- createdAt: ISO

## Index Recommendations
- reports by type + periodStart
- logs by timestamp desc
- alerts by timestamp desc + acknowledged
