# Hoomy - Swiss Student Housing Platform Design Guidelines

## Design Approach
**Reference-Based:** Draw inspiration from Airbnb (property cards, detail pages), Booking.com (filters, search), and Linear (clean dashboards). Swiss aesthetic: clean, minimal, professional with subtle use of Swiss flag red (#FF0000) as accent color.

## Typography
- **Font Families:** 
  - Primary: Inter (via Google Fonts) for UI elements, navigation, buttons
  - Secondary: Lora or Merriweather for property descriptions (warmth and readability)
- **Scale:**
  - Hero headings: text-5xl md:text-6xl font-bold
  - Section headings: text-3xl md:text-4xl font-semibold
  - Card titles: text-xl font-semibold
  - Body text: text-base font-normal
  - Small text: text-sm

## Layout System
- **Spacing Units:** Consistently use Tailwind units: 4, 8, 12, 16, 24, 32
- **Container Widths:** 
  - Full-width hero sections with max-w-7xl inner content
  - Main content: max-w-6xl
  - Reading content: max-w-prose
- **Grid Patterns:**
  - Property cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
  - Dashboard sections: grid-cols-1 lg:grid-cols-3 (sidebar + main content)

## Core Components

### Navigation
Top navigation bar with logo left, search bar center (on listings page), and user menu right. Fixed position on scroll. Include: Home, Browse Properties, How It Works, Login/Signup (or Dashboard when authenticated).

### Property Cards
Card design with: Large image (aspect-ratio-4/3), location badge overlay (city, canton), price per month (bold, prominent), rooms/bathrooms/sqm icons, favorite heart icon (top-right), verified owner badge. Hover effect: subtle shadow elevation, no dramatic scaling.

### Property Detail Page
Large hero gallery (main image full-width with thumbnail strip below), two-column layout: left side (images, description, amenities, location map), right side (sticky booking card with price, contact owner CTA, availability calendar). Owner info card with verification status, response time, and message button.

### Dashboards
Student dashboard: Tabs for Favorites, Messages, Active Contracts, Profile Settings.
Owner dashboard: Tabs for My Properties (+ Add Property button), Contracts, Stripe Connect Status, Messages, Settings.
Each section uses cards with clear headings, action buttons, and status indicators.

### Messaging Interface
Split view: Conversation list (left sidebar, 1/3 width) with user avatars, last message preview, timestamp. Chat area (right, 2/3 width) with message bubbles (student messages align left in gray, owner messages align right in blue), input bar at bottom with send button.

### Contract Management
Contract cards showing: Property thumbnail, student/owner names, monthly rent, start/end dates, status badge (pending/active/completed), action buttons (Sign Contract, View Details, Download PDF). For creation: Multi-step form with property selection, date picker, rent amount, deposit amount, and Stripe Connect verification check.

### Authentication Flows
Clean centered forms (max-w-md) with: Large heading, email/password inputs with icons, primary CTA button, alternative actions below (register/login toggle, forgot password). Email verification: Enter 6-digit code with auto-focus between inputs.

## Images

### Hero Section (Landing Page)
**Large hero image:** Swiss Alps with modern student housing in foreground, or panoramic view of Lausanne/Geneva university district. Overlay with gradient (dark bottom to transparent top). Centered white text: "Find Your Perfect Student Home in Switzerland" + search bar (City, Budget, Move-in Date) + CTA button.

### Property Listings
User-uploaded photos served via `/api/image/:filename`. Placeholder images for properties without photos: Swiss landmark silhouettes or minimalist apartment icons.

### Trust Indicators
Swiss flag icon next to verified locations, checkmark badges for verified owners, small university logos for cities with "is_university_city" true.

### Dashboard Illustrations
Empty states: Clean line illustrations for "No messages yet", "No favorites", "Add your first property" - simple, not playful.

## Key Page Structures

**Landing Page:** Hero with search → Featured cities (6-card grid with images) → How It Works (3-step process) → Trust section (verified owners, secure payments, Swiss locations) → CTA section → Footer.

**Property Listings:** Sticky filter sidebar (left, 1/4 width) with city/canton dropdowns, price range slider, rooms selector, property type checkboxes → Main grid (right, 3/4 width) with sorting dropdown, property count, and card grid.

**Student Dashboard:** Top navigation tabs → Active section content (cards for favorites show property thumbnail + title + price + remove button, contracts show detailed status cards).

**Owner Dashboard:** Same tab structure → My Properties section has Add Property button (top-right) and grid of property cards with Edit/Delete actions → Stripe Connect onboarding banner if not complete.

## Forms & Inputs
Consistent input styling: Outlined borders (gray), focus state (blue ring), label above input, helper text below. Dropdowns for cantons/cities with search functionality. Date pickers for contract dates and availability. Multi-image upload with drag-and-drop zone and preview thumbnails.

## Stripe Integration
Stripe Connect onboarding: Modal or full-page flow with progress indicators → Contract checkout: Stripe Elements for card input, subscription preview with breakdown (monthly rent, Hoomy fee 2%, total), terms checkbox, submit button.

## Responsive Behavior
Mobile: Single column layouts, collapsible filters (drawer), bottom navigation for dashboards, simplified property cards with smaller images, stacked contract details.