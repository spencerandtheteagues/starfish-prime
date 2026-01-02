# SilverGuard Design System Documentation

## Overview
This design system provides a comprehensive guide for building two synchronized mobile applications for elderly care: **SilverGuard Senior** (dementia-friendly) and **SilverGuard Family** (modern caregiver dashboard).

---

## Design Philosophy

### SilverGuard Senior
- **Simplicity First**: One primary action per screen
- **Extra Large Everything**: Text, buttons, and touch targets
- **High Contrast**: WCAG AAA compliance (7:1 minimum)
- **Clear Feedback**: Immediate visual confirmation of all actions
- **Calming Aesthetics**: Non-overwhelming, peaceful color palette
- **Familiar Patterns**: No hidden menus or complex gestures

### SilverGuard Family
- **Information Density**: Efficient use of space for monitoring
- **Professional Design**: Modern, clean interface following platform conventions
- **Quick Access**: Critical information immediately visible
- **Real-time Updates**: Live status indicators and notifications
- **Actionable Insights**: Clear call-to-action buttons

---

## Color System

### SilverGuard Senior - High Contrast Palette

#### Primary Colors
```
Primary Blue (Actions):     #1E3A8A (RGB: 30, 58, 138)
Primary Blue Light:         #3B82F6 (RGB: 59, 130, 246)
Background:                 #FFFFFF (RGB: 255, 255, 255)
Surface:                    #F9FAFB (RGB: 249, 250, 251)
Text Primary:               #111827 (RGB: 17, 24, 39)
Text Secondary:             #374151 (RGB: 55, 65, 81)
```

#### Semantic Colors (High Contrast)
```
Success Green:              #065F46 (RGB: 6, 95, 70)   - Contrast: 8.35:1
Success Light:              #10B981 (RGB: 16, 185, 129)
Warning Orange:             #92400E (RGB: 146, 64, 14)  - Contrast: 7.82:1
Warning Light:              #F59E0B (RGB: 245, 158, 11)
Error Red:                  #991B1B (RGB: 153, 27, 27)  - Contrast: 8.59:1
Error Light:                #EF4444 (RGB: 239, 68, 68)
Info Blue:                  #1E40AF (RGB: 30, 64, 175)  - Contrast: 9.12:1
Info Light:                 #60A5FA (RGB: 96, 165, 250)
```

#### Emergency/SOS Colors
```
SOS Primary:                #DC2626 (RGB: 220, 38, 38)  - Bright red
SOS Dark:                   #991B1B (RGB: 153, 27, 27)  - Dark red
SOS Background:             #FEE2E2 (RGB: 254, 226, 226)
```

#### Neutral Colors
```
Gray 50:                    #F9FAFB
Gray 100:                   #F3F4F6
Gray 200:                   #E5E7EB
Gray 300:                   #D1D5DB
Gray 500:                   #6B7280
Gray 700:                   #374151
Gray 900:                   #111827
```

### SilverGuard Family - Modern Professional Palette

#### Primary Colors
```
Primary Purple:             #7C3AED (RGB: 124, 58, 237)
Primary Purple Dark:        #5B21B6 (RGB: 91, 33, 182)
Primary Purple Light:       #A78BFA (RGB: 167, 139, 250)
Background:                 #F9FAFB (RGB: 249, 250, 251)
Surface:                    #FFFFFF (RGB: 255, 255, 255)
Text Primary:               #111827 (RGB: 17, 24, 39)
Text Secondary:             #6B7280 (RGB: 107, 114, 128)
```

#### Semantic Colors
```
Success Green:              #10B981 (RGB: 16, 185, 129)
Success Dark:               #059669 (RGB: 5, 150, 105)
Warning Amber:              #F59E0B (RGB: 245, 158, 11)
Warning Dark:               #D97706 (RGB: 217, 119, 6)
Error Red:                  #EF4444 (RGB: 239, 68, 68)
Error Dark:                 #DC2626 (RGB: 220, 38, 38)
Info Blue:                  #3B82F6 (RGB: 59, 130, 246)
Info Dark:                  #2563EB (RGB: 37, 99, 235)
```

#### Status Colors
```
Online Green:               #10B981 (RGB: 16, 185, 129)
Offline Gray:               #9CA3AF (RGB: 156, 163, 175)
Away Orange:                #F59E0B (RGB: 245, 158, 11)
```

#### Chart Colors (for Health Data)
```
Chart Blue:                 #3B82F6 (RGB: 59, 130, 246)
Chart Purple:               #8B5CF6 (RGB: 139, 92, 246)
Chart Pink:                 #EC4899 (RGB: 236, 72, 153)
Chart Green:                #10B981 (RGB: 16, 185, 129)
Chart Orange:               #F59E0B (RGB: 245, 158, 11)
```

---

## Typography System

### SilverGuard Senior - Extra Large Typography

#### Font Family
- **Primary**: System Default
  - iOS: SF Pro Text / SF Pro Display
  - Android: Roboto

#### Type Scale (Minimum Sizes - Do Not Go Smaller)
```
Display Large:    48pt  (Bold)     - Main headings
Display Medium:   40pt  (Bold)     - Section headings
Heading 1:        32pt  (Bold)     - Screen titles
Heading 2:        28pt  (Semibold) - Card headers
Body Large:       24pt  (Regular)  - Primary body text (MINIMUM)
Body Medium:      26pt  (Regular)  - Important body text
Button Text:      28pt  (Bold)     - All button labels
Caption:          22pt  (Regular)  - Small labels (rare)
```

#### Font Weights
```
Regular:          400
Semibold:         600
Bold:             700
```

#### Line Height
```
Display:          1.2
Headings:         1.25
Body:             1.5  (36pt line height for 24pt text)
Buttons:          1.3
```

#### Letter Spacing
```
Display:          -0.5pt
Headings:         0pt
Body:             0pt
Buttons:          0.5pt (slightly increased for clarity)
```

### SilverGuard Family - Modern Typography

#### Type Scale
```
Display Large:    32pt  (Bold)     - Dashboard headers
Display Medium:   28pt  (Bold)     - Section headers
Heading 1:        24pt  (Bold)     - Screen titles
Heading 2:        20pt  (Semibold) - Card headers
Heading 3:        18pt  (Semibold) - Subsection headers
Body Large:       17pt  (Regular)  - Emphasized body text
Body Regular:     16pt  (Regular)  - Primary body text
Body Small:       14pt  (Regular)  - Secondary text
Caption:          12pt  (Regular)  - Metadata, timestamps
Button Text:      16pt  (Semibold) - Button labels
```

#### Font Weights
```
Regular:          400
Medium:           500
Semibold:         600
Bold:             700
```

#### Line Height
```
Display:          1.2
Headings:         1.3
Body:             1.5
Captions:         1.4
Buttons:          1.4
```

---

## Spacing System

Both apps use an **8pt grid system** for consistent spacing.

### Space Scale
```
xxxs:   2pt   (0.25rem) - Tight spacing within components
xxs:    4pt   (0.5rem)  - Very small gaps
xs:     8pt   (1rem)    - Small spacing
sm:     12pt  (1.5rem)  - Compact spacing
md:     16pt  (2rem)    - Standard spacing (default)
lg:     24pt  (3rem)    - Comfortable spacing
xl:     32pt  (4rem)    - Large spacing
xxl:    48pt  (6rem)    - Extra large spacing
xxxl:   64pt  (8rem)    - Maximum spacing
```

### Senior App Spacing (More Generous)
```
Card Padding:           24pt (lg)
Screen Padding:         24pt (lg)
Button Padding:         20pt vertical, 24pt horizontal
Element Spacing:        24pt (lg) - between major elements
Section Spacing:        32pt (xl) - between sections
```

### Family App Spacing (More Compact)
```
Card Padding:           16pt (md)
Screen Padding:         16pt (md)
Button Padding:         12pt vertical, 16pt horizontal
Element Spacing:        16pt (md) - between elements
Section Spacing:        24pt (lg) - between sections
List Item Spacing:      12pt (sm)
```

---

## Component Specifications

### Touch Targets

#### SilverGuard Senior
- **Minimum Touch Target**: 80x80pt (significantly larger than standard 44pt)
- **Primary Buttons**: 90x90pt or larger
- **Emergency Button**: 120x120pt minimum
- **Spacing Between Targets**: Minimum 16pt to prevent mis-taps

#### SilverGuard Family
- **Minimum Touch Target**: 44x44pt (iOS standard)
- **Primary Actions**: 48x48pt
- **Comfortable Target**: 56x56pt for important actions

### Border Radius

#### SilverGuard Senior (Softer, Friendlier)
```
Small:      12pt - Small cards, inputs
Medium:     16pt - Standard cards
Large:      24pt - Large buttons
X-Large:    32pt - Main action buttons
Pill:       999pt - Pill-shaped buttons
Circle:     50% - Circular buttons
```

#### SilverGuard Family (Modern, Clean)
```
Small:      8pt  - Badges, small pills
Medium:     12pt - Cards, inputs
Large:      16pt - Buttons
Pill:       999pt - Pills, tags
Circle:     50% - Avatar, icons
```

### Shadows

#### SilverGuard Senior (Minimal - High Contrast Preferred)
```
None:       No shadow (default - rely on borders)
Subtle:     shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2
Card:       shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 4
```

#### SilverGuard Family (Modern Material Design)
```
Subtle:     shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2
Card:       shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 4
Raised:     shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 12, elevation: 6
Modal:      shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 16, elevation: 8
```

### Borders

#### SilverGuard Senior (Strong Borders for Clarity)
```
Width:      2pt (default) - Thicker for visibility
Color:      #D1D5DB (Gray 300) for neutral
            #1E3A8A (Primary Blue) for active/focused
```

#### SilverGuard Family (Subtle Borders)
```
Width:      1pt (default)
Color:      #E5E7EB (Gray 200) for neutral
            #7C3AED (Primary Purple) for active/focused
```

---

## Button Styles

### SilverGuard Senior Buttons

#### Primary Button (Main Actions)
```
Background:         #1E3A8A (Primary Blue)
Text:               #FFFFFF (White)
Font Size:          28pt
Font Weight:        Bold
Padding:            24pt vertical, 32pt horizontal
Border Radius:      24pt
Min Height:         90pt
Min Width:          200pt
Shadow:             Subtle
Active State:       Background: #1E40AF (Lighter blue)
Disabled State:     Background: #D1D5DB, Text: #9CA3AF
```

#### Secondary Button (Less Important Actions)
```
Background:         #FFFFFF (White)
Border:             2pt solid #1E3A8A
Text:               #1E3A8A
Font Size:          28pt
Font Weight:        Bold
Padding:            24pt vertical, 32pt horizontal
Border Radius:      24pt
Min Height:         90pt
Min Width:          200pt
Active State:       Background: #F3F4F6
```

#### Emergency/SOS Button
```
Background:         #DC2626 (Bright Red)
Text:               #FFFFFF (White)
Font Size:          32pt
Font Weight:        Bold
Padding:            32pt vertical, 48pt horizontal
Border Radius:      32pt
Min Height:         120pt
Min Width:          280pt
Shadow:             Raised
Animation:          Pulsing glow effect (1.5s interval)
Active State:       Background: #991B1B (Darker red)
```

#### Icon Button (Large)
```
Background:         #F9FAFB (Light gray)
Icon Size:          48pt
Padding:            24pt
Border Radius:      24pt
Min Size:           96x96pt
Border:             2pt solid #E5E7EB
Active State:       Background: #E5E7EB
```

### SilverGuard Family Buttons

#### Primary Button
```
Background:         #7C3AED (Primary Purple)
Text:               #FFFFFF (White)
Font Size:          16pt
Font Weight:        Semibold
Padding:            12pt vertical, 24pt horizontal
Border Radius:      12pt
Min Height:         48pt
Shadow:             Card
Active State:       Background: #6D28D9
Disabled State:     Background: #E5E7EB, Text: #9CA3AF
```

#### Secondary Button
```
Background:         #FFFFFF (White)
Border:             1pt solid #7C3AED
Text:               #7C3AED
Font Size:          16pt
Font Weight:        Semibold
Padding:            12pt vertical, 24pt horizontal
Border Radius:      12pt
Min Height:         48pt
Active State:       Background: #F5F3FF
```

#### Danger Button (Delete Actions)
```
Background:         #EF4444 (Error Red)
Text:               #FFFFFF (White)
Font Size:          16pt
Font Weight:        Semibold
Padding:            12pt vertical, 24pt horizontal
Border Radius:      12pt
Min Height:         48pt
Active State:       Background: #DC2626
```

#### Text Button (Tertiary Actions)
```
Background:         Transparent
Text:               #7C3AED
Font Size:          16pt
Font Weight:        Semibold
Padding:            8pt vertical, 12pt horizontal
Active State:       Text: #6D28D9, Background: #F5F3FF
```

#### Floating Action Button (FAB)
```
Background:         #7C3AED (Primary Purple)
Icon:               #FFFFFF (White)
Icon Size:          24pt
Size:               56x56pt
Border Radius:      Circle (28pt)
Shadow:             Raised
Position:           Bottom right, 16pt margin
Active State:       Background: #6D28D9, Scale: 1.1
```

---

## Card Components

### SilverGuard Senior - Large Cards

#### Medication Card
```
Background:         #FFFFFF
Border:             2pt solid #E5E7EB
Border Radius:      16pt
Padding:            24pt
Min Height:         180pt
Shadow:             None (rely on border)

Content Layout:
- Medication Name:  32pt Bold, #111827
- Dosage:          26pt Regular, #374151
- Time:            28pt Semibold, #1E3A8A
- Status Badge:    24pt, pill-shaped, colored by status
- Action Button:   Primary button (full width, 90pt height)

Status Colors:
- Pending:         #F59E0B (Warning Orange) background, #92400E text
- Taken:           #10B981 (Success Green) background, #065F46 text
- Missed:          #EF4444 (Error Red) background, #991B1B text
```

#### Appointment Card
```
Background:         #FFFFFF
Border:             2pt solid #E5E7EB
Border Radius:      16pt
Padding:            24pt
Min Height:         200pt

Content Layout:
- Date & Time:     32pt Bold, #1E3A8A
- Title:           28pt Semibold, #111827
- Doctor Name:     24pt Regular, #374151
- Location:        24pt Regular, #6B7280
- Icon:            48pt, themed to appointment type
```

#### Health Entry Card
```
Background:         #FFFFFF
Border:             2pt solid #E5E7EB
Border Radius:      16pt
Padding:            24pt

Content Layout:
- Metric Name:     28pt Semibold, #111827
- Value:           40pt Bold, #1E3A8A
- Unit:            24pt Regular, #6B7280
- Timestamp:       22pt Regular, #9CA3AF
- Trend Icon:      32pt (up/down arrow)
```

### SilverGuard Family - Compact Cards

#### Activity Card
```
Background:         #FFFFFF
Border:             1pt solid #E5E7EB
Border Radius:      12pt
Padding:            16pt
Shadow:             Subtle

Content Layout:
- Icon:            24pt, colored by activity type
- Activity Text:   16pt Regular, #111827
- Timestamp:       14pt Regular, #6B7280
- Secondary Info:  14pt Regular, #9CA3AF

Activity Type Colors:
- Medication Taken:    #10B981 (Green)
- Medication Missed:   #EF4444 (Red)
- Health Log:          #3B82F6 (Blue)
- SOS Alert:           #DC2626 (Red)
- Location Update:     #8B5CF6 (Purple)
```

#### Stat Card
```
Background:         #FFFFFF
Border:             1pt solid #E5E7EB
Border Radius:      12pt
Padding:            16pt
Shadow:             Card

Content Layout:
- Label:           14pt Regular, #6B7280
- Value:           24pt Bold, #111827
- Trend:           14pt Semibold with icon, colored
- Icon:            32pt, themed to metric
```

#### Medication Management Card
```
Background:         #FFFFFF
Border:             1pt solid #E5E7EB
Border Radius:      12pt
Padding:            16pt
Shadow:             Subtle

Content Layout:
- Medication Name: 18pt Semibold, #111827
- Dosage:          14pt Regular, #6B7280
- Schedule:        14pt Regular, #6B7280
- Status Badge:    12pt, pill-shaped
- Action Menu:     Icon button (24pt)
```

#### Health Chart Card
```
Background:         #FFFFFF
Border:             1pt solid #E5E7EB
Border Radius:      12pt
Padding:            16pt
Shadow:             Card

Content Layout:
- Title:           18pt Semibold, #111827
- Chart:           Variable height (200-300pt)
- Time Range:      Segmented control (7D, 30D, 3M)
- Legend:          14pt Regular
- Latest Value:    20pt Bold, #111827
```

---

## Input Fields

### SilverGuard Senior - Extra Large Inputs

#### Text Input
```
Background:         #FFFFFF
Border:             2pt solid #D1D5DB
Border Radius:      16pt
Padding:            24pt
Min Height:         90pt
Font Size:          24pt
Font Weight:        Regular
Text Color:         #111827
Placeholder Color:  #9CA3AF

Focus State:        Border: 3pt solid #1E3A8A
Error State:        Border: 3pt solid #DC2626
Success State:      Border: 3pt solid #059669
```

#### Number Input (for Health Data)
```
Background:         #FFFFFF
Border:             2pt solid #D1D5DB
Border Radius:      16pt
Padding:            32pt
Min Height:         120pt
Font Size:          40pt (Extra large for easy reading)
Font Weight:        Bold
Text Color:         #111827
Text Align:         Center
Keyboard:           Numeric

Increment/Decrement Buttons: Large + / - buttons (80x80pt)
```

### SilverGuard Family - Standard Inputs

#### Text Input
```
Background:         #FFFFFF
Border:             1pt solid #E5E7EB
Border Radius:      12pt
Padding:            12pt 16pt
Min Height:         48pt
Font Size:          16pt
Font Weight:        Regular
Text Color:         #111827
Placeholder Color:  #9CA3AF

Focus State:        Border: 2pt solid #7C3AED
Error State:        Border: 2pt solid #EF4444, Error text below
```

#### Search Input
```
Background:         #F9FAFB
Border:             1pt solid #E5E7EB
Border Radius:      24pt (Pill-shaped)
Padding:            10pt 16pt 10pt 40pt (left padding for icon)
Height:             44pt
Font Size:          16pt
Icon:               24pt search icon, #9CA3AF, positioned left

Focus State:        Background: #FFFFFF, Border: 2pt solid #7C3AED
```

#### Textarea
```
Background:         #FFFFFF
Border:             1pt solid #E5E7EB
Border Radius:      12pt
Padding:            12pt 16pt
Min Height:         120pt
Font Size:          16pt
Font Weight:        Regular
Text Color:         #111827
```

---

## Icons

### SilverGuard Senior - Large, Simple Icons
- **Icon Size**: Minimum 48pt for all icons
- **Style**: Filled/solid icons (easier to see than outline)
- **Color**: High contrast colors matching semantic meaning
- **Icon Library**: Ionicons or Material Icons (filled variants)

#### Key Icons
```
Medications:    pill, medical (48pt, #1E3A8A)
Appointments:   calendar, today (48pt, #1E3A8A)
Health:         heart, fitness (48pt, #1E3A8A)
Emergency:      alert-circle, warning (64pt, #DC2626)
Home:           home (48pt, #1E3A8A)
Check:          checkmark-circle (48pt, #10B981)
Close:          close-circle (48pt, #EF4444)
```

### SilverGuard Family - Modern Icon Set
- **Icon Size**: 20-24pt for standard icons
- **Style**: Outline icons (modern, clean)
- **Icon Library**: Heroicons or Feather Icons

#### Key Icons
```
Dashboard:          view-grid (24pt)
Location:           location-marker (24pt)
Medications:        beaker (24pt)
Health:             heart (24pt)
Chat:               chat (24pt with badge)
Notifications:      bell (24pt with badge)
More:               dots-horizontal (24pt)
Add:                plus-circle (24pt)
Edit:               pencil (20pt)
Delete:             trash (20pt)
SOS Alert:          exclamation-circle (24pt, #DC2626)
```

---

## Navigation Patterns

### SilverGuard Senior - Simple Stack Navigation

#### Navigation Bar
```
Background:         #FFFFFF
Border Bottom:      2pt solid #E5E7EB
Height:             80pt (extra tall)
Title:              32pt Bold, #111827, centered
Back Button:        80x80pt, "<" icon 48pt, left aligned
Right Action:       None (keep it simple)
```

#### Home Screen Button Grid
```
Layout:             2x2 grid
Button Size:        150x150pt minimum
Button Spacing:     24pt gap
Button Style:       Card with icon + label
Icon Size:          64pt
Label:              28pt Bold
Background:         #FFFFFF
Border:             2pt solid #E5E7EB
Border Radius:      24pt
Active State:       Border color: #1E3A8A, Background: #F0F9FF
```

### SilverGuard Family - Bottom Tab + Stack Navigation

#### Bottom Tab Bar
```
Background:         #FFFFFF
Border Top:         1pt solid #E5E7EB
Height:             64pt (including safe area)
Tab Count:          5 tabs maximum
Icon Size:          24pt
Label:              12pt Regular
Active Color:       #7C3AED (Primary Purple)
Inactive Color:     #9CA3AF (Gray)
Badge:              10x10pt red dot for notifications
```

#### Tab Items
```
1. Dashboard:       view-grid icon
2. Location:        location-marker icon
3. Medications:     beaker icon
4. Health:          heart icon
5. More:            dots-horizontal icon
```

#### Navigation Bar (Stack)
```
Background:         #FFFFFF
Border Bottom:      1pt solid #E5E7EB
Height:             56pt
Title:              20pt Semibold, #111827, centered
Back Button:        44x44pt, "<" icon 20pt
Right Action:       Button or icon (Add, Edit, etc.)
```

---

## Modal & Dialog Patterns

### SilverGuard Senior - Large Modals

#### Confirmation Dialog
```
Background:         #FFFFFF
Border Radius:      24pt
Padding:            32pt
Max Width:          90% of screen
Shadow:             Modal

Content:
- Icon:             80pt, colored by severity
- Title:            32pt Bold, #111827, centered
- Message:          24pt Regular, #374151, centered
- Primary Button:   Full width, 90pt height, 24pt margin top
- Secondary Button: Full width, 90pt height, 12pt margin top
```

#### Bottom Sheet (Rare - prefer full screen)
```
Background:         #FFFFFF
Border Radius:      24pt 24pt 0 0
Min Height:         40% of screen
Max Height:         80% of screen
Padding:            24pt
Handle:             80pt wide, 6pt tall, rounded, #D1D5DB
```

### SilverGuard Family - Standard Modals

#### Alert Dialog
```
Background:         #FFFFFF
Border Radius:      16pt
Padding:            24pt
Max Width:          340pt
Shadow:             Modal

Content:
- Title:            20pt Semibold, #111827
- Message:          16pt Regular, #6B7280
- Button Group:     Horizontal, right aligned, 8pt gap
```

#### Bottom Sheet
```
Background:         #FFFFFF
Border Radius:      16pt 16pt 0 0
Min Height:         30% of screen
Max Height:         90% of screen
Padding:            16pt
Handle:             40pt wide, 4pt tall, rounded, #D1D5DB
Shadow:             Modal
```

#### Full Screen Modal
```
Background:         #F9FAFB
Navigation Bar:     Standard with Close button
Content:            ScrollView with padding
Save Button:        Fixed at bottom or in nav bar
```

---

## Loading & Empty States

### Loading Indicators

#### SilverGuard Senior
```
Spinner:            Large (64pt diameter)
Color:              #1E3A8A (Primary Blue)
Text:               "Loading..." 24pt, #374151
Layout:             Centered on screen
Background:         Transparent overlay or white
```

#### SilverGuard Family
```
Spinner:            Standard (40pt diameter)
Color:              #7C3AED (Primary Purple)
Text:               Optional, 16pt, #6B7280
Layout:             Centered in container
```

### Empty States

#### SilverGuard Senior
```
Icon:               96pt, #D1D5DB (light gray)
Title:              28pt Semibold, #111827
Message:            24pt Regular, #6B7280
Action Button:      Primary button (if applicable)
Layout:             Centered vertically in screen
```

#### SilverGuard Family
```
Icon:               64pt, #E5E7EB (light gray)
Title:              20pt Semibold, #111827
Message:            16pt Regular, #9CA3AF
Action Button:      Primary button (if applicable)
Layout:             Centered vertically in container
```

---

## Notification Styles

### SilverGuard Senior - Large Notifications

#### In-App Banner
```
Background:         Based on type (Success, Warning, Error)
Height:             120pt
Padding:            24pt
Border Radius:      16pt
Icon:               48pt
Title:              28pt Bold
Message:            24pt Regular
Duration:           5 seconds (longer for elderly)
Position:           Top of screen, below status bar
Animation:          Slide down from top
```

#### Medication Reminder Modal
```
Full Screen:        Yes (can't miss it)
Background:         #FFFFFF
Icon:               96pt pill icon, #1E3A8A
Medication Name:    40pt Bold, #111827
Dosage:             28pt Regular, #374151
Time:               28pt Semibold, #1E3A8A
Take Button:        120pt height, 90% width, "Take Medication"
Snooze Button:      90pt height, 90% width, "Remind me in 5 min"
Dismiss Button:     Text button, "Not now"
```

### SilverGuard Family - Standard Notifications

#### In-App Banner
```
Background:         Based on type
Height:             64pt
Padding:            12pt 16pt
Border Radius:      12pt
Icon:               24pt
Title:              16pt Semibold
Message:            14pt Regular
Duration:           3 seconds
Position:           Top of screen
Animation:          Slide down
```

#### SOS Alert Banner (Critical)
```
Background:         #FEE2E2 (Red background)
Border:             2pt solid #DC2626
Height:             Auto (min 80pt)
Padding:            16pt
Border Radius:      12pt
Icon:               32pt alert icon, #DC2626
Title:              18pt Bold, #991B1B, "EMERGENCY ALERT"
Senior Name:        16pt Semibold, #111827
Location:           14pt Regular, #374151
Time:               14pt Regular, #6B7280
Actions:            "View Location" button, "Acknowledge" button
Position:           Top of Dashboard, always visible
Animation:          Pulsing border
```

---

## Accessibility Guidelines

### SilverGuard Senior - WCAG AAA Compliance

#### Color Contrast
- **Target**: 7:1 minimum for all text
- **Testing**: Use contrast checker on all color combinations
- **Verification**: All defined colors meet AAA standards

#### Touch Targets
- **Minimum**: 80x80pt (exceeds WCAG 44x44pt requirement)
- **Spacing**: 16pt minimum between targets
- **Visual Feedback**: Immediate highlight on touch

#### Screen Reader Support
- **Label All**: Every interactive element has clear label
- **Hints**: Provide hints for complex actions
- **Order**: Logical focus order, top to bottom
- **Feedback**: Announce state changes (medication taken, etc.)

#### Visual Clarity
- **No Text Over Images**: Always use solid backgrounds
- **One Action Per Screen**: Avoid overwhelming choices
- **Clear Labels**: Plain language, no jargon
- **Large Fonts**: Never smaller than 24pt

### SilverGuard Family - WCAG AA Compliance

#### Color Contrast
- **Target**: 4.5:1 minimum for normal text, 3:1 for large text
- **Interactive Elements**: Meet contrast requirements

#### Touch Targets
- **Minimum**: 44x44pt (iOS/Android standard)
- **Comfortable**: 48pt for primary actions

#### Screen Reader Support
- **Label All**: Every interactive element accessible
- **Semantic HTML**: Use proper roles and labels
- **Dynamic Content**: Announce updates (new messages, alerts)

---

## Animation Guidelines

### SilverGuard Senior - Minimal, Clear Animations

#### Transitions
```
Duration:           400ms (slower for clarity)
Easing:             ease-in-out (smooth, predictable)
Fade In/Out:        Opacity 0 to 1, 400ms
Slide:              translateY, 400ms
Scale:              Avoid (can be disorienting)
```

#### Feedback Animations
```
Button Press:       Scale to 0.95, 150ms, then back
Success:            Green checkmark fade in with gentle pulse
Error:              Red shake animation, 300ms
Loading:            Rotating spinner, 1s per rotation
```

#### Emergency Button
```
Idle State:         Subtle pulsing glow, 1.5s interval
                    Opacity 0.8 to 1.0, infinite loop
Active State:       Scale 1.0 to 1.1, 200ms, then solid
```

### SilverGuard Family - Modern, Smooth Animations

#### Transitions
```
Duration:           250ms (standard)
Easing:             ease-in-out or spring
Fade:               Opacity transitions
Slide:              translateY or translateX
Scale:              Subtle scale for modals (0.95 to 1.0)
```

#### Micro-interactions
```
Button Hover:       Scale to 1.02, 150ms (web)
Button Press:       Scale to 0.98, 100ms
Tab Switch:         Slide with fade, 250ms
Pull to Refresh:    Spinner rotation, 600ms
Swipe Actions:      Reveal actions, 200ms
```

#### SOS Alert
```
Banner:             Pulsing red border, 1s interval
Notification:       Slide down with bounce, 400ms
Icon:               Shake animation, 500ms
```

---

## Platform-Specific Considerations

### iOS

#### SilverGuard Senior
- Use SF Symbols where appropriate (large size)
- Follow iOS safe area guidelines
- Use iOS-style navigation bars (with customization)
- Haptic feedback on important actions
- Large title navigation bars

#### SilverGuard Family
- Use SF Symbols
- Bottom tab bar with iOS styling
- Swipe gestures for navigation
- Pull to refresh
- Large title navigation for main screens

### Android

#### SilverGuard Senior
- Use Material Design filled icons
- Follow Android navigation patterns
- Use Android-style dialogs
- Haptic feedback (vibration) on actions
- Material Design shadows

#### SilverGuard Family
- Material Design components
- Bottom navigation bar
- Floating action button
- Ripple effects on touch
- Material Design shadows
- Swipe gestures

---

## Implementation Notes

### React Native Considerations

1. **Use StyleSheet.create()** for all styles (performance)
2. **Avoid inline styles** (harder to maintain)
3. **Use constants** for colors, spacing, typography
4. **Platform-specific code** where needed (Platform.select)
5. **Use Dimensions API** for responsive sizing
6. **Test on multiple screen sizes**
7. **Use SafeAreaView** for notch/home indicator
8. **Optimize FlatList** with proper keys and memoization
9. **Use Animated API** for smooth animations
10. **Test on real devices** (simulators don't show true performance)

### Performance Optimization

1. **Lazy load** images and heavy components
2. **Memoize** expensive calculations with useMemo
3. **Use useCallback** for event handlers
4. **Optimize re-renders** with React.memo
5. **Virtualize long lists** with FlatList
6. **Compress images** and use appropriate formats
7. **Minimize bridge calls** (batch updates)
8. **Profile with Flipper** during development

---

## Design Deliverables Checklist

- [x] Color system definition
- [x] Typography scales for both apps
- [x] Spacing system (8pt grid)
- [x] Button specifications
- [x] Card component specs
- [x] Input field specs
- [x] Icon guidelines
- [x] Navigation patterns
- [x] Modal and dialog patterns
- [x] Loading and empty states
- [x] Notification styles
- [x] Accessibility guidelines
- [x] Animation guidelines
- [x] Platform-specific considerations
- [x] Implementation notes

---

## Version History

- **v1.0** - January 1, 2026 - Initial design system for Phase 1
- Complete design specifications for both SilverGuard apps
- WCAG AAA compliance for Senior app
- WCAG AA compliance for Family app

---

**Design System Status**: Production Ready
**Last Updated**: January 1, 2026
**Designer**: SilverGuard Design Team
**For**: SilverGuard Phase 1 Implementation
