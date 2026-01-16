# SilverGuard App Icon Specifications

## Icon Design Concept

The SilverGuard app icon represents protection, care, and AI innovation.

### Design Elements
1. **Shield Shape**: Symbolizes protection and safety
2. **Abstract Person/Heart**: Represents the senior being cared for
3. **Gradient Colors**: Purple (#7C3AED) to deep purple (#5B21B6) - our brand colors
4. **Subtle Glow**: Represents Sunny AI's presence
5. **Modern, Clean Lines**: Conveys trust and technology

### Design Guidelines
- No text in the icon (app name shown below)
- Simple, recognizable at small sizes
- No photographs
- Works in light and dark mode
- No transparency effects needed for iOS

## Required Sizes

### iOS App Store
| Purpose | Size (pixels) | Scale |
|---------|--------------|-------|
| App Store | 1024 x 1024 | 1x |
| iPhone App (60pt) | 180 x 180 | 3x |
| iPhone App (60pt) | 120 x 120 | 2x |
| iPad App (76pt) | 152 x 152 | 2x |
| iPad Pro App (83.5pt) | 167 x 167 | 2x |
| iPhone Spotlight (40pt) | 120 x 120 | 3x |
| iPhone Spotlight (40pt) | 80 x 80 | 2x |
| iPad Spotlight (40pt) | 80 x 80 | 2x |
| iPhone Settings (29pt) | 87 x 87 | 3x |
| iPhone Settings (29pt) | 58 x 58 | 2x |
| iPad Settings (29pt) | 58 x 58 | 2x |
| iPhone Notification (20pt) | 60 x 60 | 3x |
| iPhone Notification (20pt) | 40 x 40 | 2x |
| iPad Notification (20pt) | 40 x 40 | 2x |

### App Store Asset
| Purpose | Size (pixels) |
|---------|--------------|
| App Icon (App Store Connect) | 1024 x 1024 |

## Color Palette

```css
/* Primary Brand Colors */
--purple-600: #7C3AED;
--purple-700: #6D28D9;
--purple-800: #5B21B6;
--purple-900: #4C1D95;

/* Accent Colors */
--gold-400: #FCD34D;
--white: #FFFFFF;

/* Gradient */
background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
```

## Visual Reference Description

### Option A: Shield with Heart
- Rounded shield shape filling the icon
- Purple gradient background (top-left lighter)
- Centered heart shape in lighter purple/white
- Small AI sparkle/star element near heart
- Modern, flat design with subtle depth

### Option B: Abstract Guardian
- Circular icon base with purple gradient
- Abstract figure representing protection
- Shield element integrated into design
- Warm glow effect around edges
- Clean, modern aesthetic

### Option C: Connected Care
- Two overlapping shapes (representing senior and caregiver)
- Shield outline containing both
- Purple gradient with gold accent
- Minimalist, app-store optimized

## Technical Requirements

### Format
- **File Format**: PNG (no alpha/transparency for iOS)
- **Color Space**: sRGB
- **Resolution**: Each size at correct pixel dimensions
- **Corners**: iOS will automatically round corners (don't pre-round)

### Xcode Asset Catalog
Place icons in: `ios/ElderCare/Images.xcassets/AppIcon.appiconset/`

Contents.json structure:
```json
{
  "images": [
    {
      "size": "20x20",
      "idiom": "iphone",
      "filename": "Icon-20@2x.png",
      "scale": "2x"
    },
    {
      "size": "20x20",
      "idiom": "iphone",
      "filename": "Icon-20@3x.png",
      "scale": "3x"
    },
    // ... additional sizes
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}
```

## Icon Generation Script

Use the 1024x1024 master icon to generate all sizes:

```bash
#!/bin/bash
# Generate all iOS app icon sizes from 1024x1024 source

SOURCE="AppIcon-1024.png"
OUTPUT_DIR="ios/ElderCare/Images.xcassets/AppIcon.appiconset"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# iPhone icons
sips -z 180 180 "$SOURCE" --out "$OUTPUT_DIR/Icon-60@3x.png"
sips -z 120 120 "$SOURCE" --out "$OUTPUT_DIR/Icon-60@2x.png"
sips -z 120 120 "$SOURCE" --out "$OUTPUT_DIR/Icon-40@3x.png"
sips -z 80 80 "$SOURCE" --out "$OUTPUT_DIR/Icon-40@2x.png"
sips -z 87 87 "$SOURCE" --out "$OUTPUT_DIR/Icon-29@3x.png"
sips -z 58 58 "$SOURCE" --out "$OUTPUT_DIR/Icon-29@2x.png"
sips -z 60 60 "$SOURCE" --out "$OUTPUT_DIR/Icon-20@3x.png"
sips -z 40 40 "$SOURCE" --out "$OUTPUT_DIR/Icon-20@2x.png"

# iPad icons
sips -z 167 167 "$SOURCE" --out "$OUTPUT_DIR/Icon-83.5@2x.png"
sips -z 152 152 "$SOURCE" --out "$OUTPUT_DIR/Icon-76@2x.png"

# App Store
sips -z 1024 1024 "$SOURCE" --out "$OUTPUT_DIR/Icon-1024.png"

echo "Icons generated successfully!"
```

## Review Checklist

- [ ] Icon is clearly visible at 29pt (Settings)
- [ ] Icon works without text/labels
- [ ] No Apple symbols or similar marks
- [ ] Design is unique and distinguishable
- [ ] Colors remain vibrant at all sizes
- [ ] No offensive or controversial imagery
- [ ] Icon represents the app's purpose
- [ ] Tested on light and dark home screens
