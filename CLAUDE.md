# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EpiCare Marketplace** is an insurance marketplace platform built with Next.js 14 that allows users to explore, compare, and purchase insurance plans. The platform integrates with insurance provider APIs (currently All State) to fetch real-time quotes and display personalized plan options.

## Development Commands

### Core Commands
```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Build & Production
npm run build        # Build for production (Next.js build)
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint (currently ignores errors during builds)
```

### Important Build Notes
- ESLint and TypeScript errors are **ignored during builds** (see `next.config.mjs`)
- Images are set to `unoptimized: true` for deployment flexibility
- Vercel build command is `npm run build` (configured in `vercel.json`)

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Shadcn/ui components
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Data Persistence**: localStorage + sessionStorage
- **External API**: All State Insurance API
- **Analytics**: Vercel Analytics
- **Font**: Geist Sans & Mono

### Key Architectural Patterns

#### 1. Multi-Step Form with SessionStorage Persistence
The `/explore` page implements a 6-step insurance questionnaire that:
- Validates user input at each step (ZIP code via API, dates, etc.)
- Stores form data in `sessionStorage` under key `insuranceFormData`
- Sends data to All State API via `/api/insurance/quote` on completion
- Stores fetched plans in `sessionStorage` under key `insurancePlans`
- **Critical**: Form data persists across page reloads but API may fail silently

#### 2. Cart System with Context & LocalStorage
Shopping cart functionality is implemented via:
- **Context**: `CartContext` (`contexts/cart-context.tsx`) provides global cart state
- **Persistence**: Cart items stored in `localStorage` under key `insuranceCart`
- **Provider**: `CartProvider` wraps entire app in `app/layout.tsx`
- **Components**:
  - `FloatingCartButton` - Fixed position cart button with badge
  - `CartDrawer` - Slide-out sidebar for cart management
  - `InsuranceCard` & `InsurancePlanModal` - Add plans to cart

#### 3. API Integration Pattern
All State API integration follows this pattern:
```
User Form → /api/insurance/quote (Next.js API Route) → All State API
                    ↓
        Maps response to InsurancePlan type
                    ↓
        Returns to frontend & saves to sessionStorage
```

**Key Files**:
- `app/api/insurance/quote/route.ts` - API proxy endpoint
- `lib/api/allstate.ts` - All State API client class
- `lib/types/insurance.ts` - TypeScript types for API data

**Environment Variables** (not in repo):
```bash
ALLSTATE_API_URL=https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans
ALLSTATE_AUTH_TOKEN=VGVzdFVzZXI6VGVzdDEyMzQ=
ALLSTATE_AGENT_ID=159208
```

### Application Flow

```
1. Landing Page (/)
   → User explores plans or clicks "Get Started"

2. Explore Page (/explore)
   → 6-step form: Account check → ZIP → DOB → Gender → Smoking → Coverage Date → Payment Frequency
   → On completion: POST to /api/insurance/quote
   → Saves form data & plans to sessionStorage
   → Redirects to /insurance-options

3. Insurance Options (/insurance-options)
   → Loads plans from sessionStorage (or falls back to static data)
   → Displays filterable/sortable plan grid
   → Shows FloatingCartButton
   → User can: View details, Add to cart, Edit form data

4. Cart Drawer (overlay)
   → View selected plans
   → Remove individual plans or clear all
   → See total price
   → Proceed to checkout

5. Checkout Page (/checkout)
   → Review all selected plans
   → See monthly/annual totals
   → Proceed to application

6. Application Success (/application-success)
   → Confetti animation
   → Reference number generated
   → Cart automatically cleared
   → Return to home or print confirmation
```

### Data Models

#### InsurancePlan (UI Model)
```typescript
{
  id: string
  name: string
  price: number              // Monthly rate
  coverage: string           // Benefit description
  productType: string        // e.g., "NHICSupplemental"
  benefits: string[]         // Array of benefit names
  allState: boolean          // True if from All State API
  planType: string           // e.g., "NICAFB"
  benefitDescription: string
  brochureUrl?: string
  carrierName?: string
}
```

#### InsuranceFormData
```typescript
{
  zipCode: string            // 5-digit ZIP
  dateOfBirth: string        // ISO date (YYYY-MM-DD)
  gender: "male" | "female" | "other"
  smokes: boolean
  lastTobaccoUse?: string    // ISO date, required if smokes=true
  coverageStartDate: string  // ISO date, must be today or future
  paymentFrequency: "monthly" | "quarterly" | "semi-annually" | "annually"
}
```

### Component Organization

```
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout with CartProvider
├── explore/page.tsx            # Multi-step form
├── insurance-options/page.tsx  # Plan listing with filters
├── checkout/page.tsx           # Cart checkout
├── application-success/page.tsx # Success confirmation
└── api/
    ├── insurance/quote/route.ts    # All State API proxy
    └── address/validate-zip/       # ZIP validation endpoints

components/
├── cart-drawer.tsx             # Cart overlay sidebar
├── floating-cart-button.tsx    # Fixed cart button
├── insurance-card.tsx          # Plan card component
├── insurance-plan-modal.tsx    # Plan details modal
├── insurance-filters-sidebar.tsx
├── edit-information-modal.tsx
└── [other UI components]

contexts/
└── cart-context.tsx            # Global cart state

lib/
├── api/allstate.ts             # All State API client
├── types/insurance.ts          # TypeScript definitions
└── utils.ts                    # Utility functions
```

## Working with the All State API

### Request Format
The API expects:
```json
{
  "PlansToRate": null,
  "ExcludeAvailablePlans": false,
  "agentId": "159208",
  "effectiveDate": "2025-10-15T00:00:00.000Z",
  "zipCode": "07008",
  "applicants": [{
    "birthDate": "1994-08-25T00:00:00.000Z",
    "gender": "Male",
    "relationshipType": "Primary",
    "isSmoker": false
  }],
  "paymentFrequency": "Monthly",
  "productTypes": ["NHICSupplemental"]
}
```

### Response Structure
The API returns an object with:
- `availablePlans[]` - Array of insurance plans (primary data source)
- `ratedPlans[]` - Alternative plans array
- `monthlyPaymentTotal` - Sum of all plan rates
- `enrollmentFeeTotal` - Total enrollment fees

**Note**: The current implementation handles both array responses and object responses with `availablePlans` or `ratedPlans` properties.

### Common Issues
1. **API may return 401**: Ensure `ALLSTATE_AUTH_TOKEN` is set
2. **Form data not persisting**: Check sessionStorage keys match
3. **Plans not loading**: API can fail silently - check browser console logs

## Important Implementation Details

### Cart System
- **Prevention of duplicates**: Cart checks `plan.id` before adding
- **Visual feedback**: Buttons show "Added to Cart" (green) when plan is in cart
- **Persistence**: Cart survives page reloads via localStorage
- **Auto-clear**: Cart clears after successful application submission

### Form Validation
- ZIP code validated via `/api/address/validate-zip/{zipCode}` endpoint
- Date of birth must result in age ≥ 18
- Coverage start date must be today or future
- Tobacco use date required only if `smokes=true`
- All validations show real-time feedback with icons

### SessionStorage Keys
```javascript
'insuranceFormData'  // User's form inputs
'insurancePlans'     // Fetched plans from API
```

### LocalStorage Keys
```javascript
'insuranceCart'      // Array of selected InsurancePlan objects
```

## Development Guidelines

### When Adding New Insurance Providers
1. Create new API client in `lib/api/{provider-name}.ts`
2. Define types in `lib/types/insurance.ts` (extend existing interfaces)
3. Create proxy route in `app/api/insurance/{provider}/route.ts`
4. Update form mapping to support provider-specific fields
5. Add provider filter to `/insurance-options` page

### When Modifying the Form
1. Update `app/explore/page.tsx` for UI changes
2. Update `InsuranceFormData` type in `lib/types/insurance.ts`
3. Update mapping in `lib/api/allstate.ts` → `mapFormDataToRequest()`
4. Update API route `app/api/insurance/quote/route.ts` if needed
5. Ensure sessionStorage compatibility

### When Working with the Cart
- Always use `useCart()` hook from `contexts/cart-context.tsx`
- Never manipulate localStorage directly - use context methods
- Check `isInCart(planId)` before adding to prevent duplicates
- Use `addItem()`, `removeItem()`, `clearCart()` methods

### Styling Conventions
- Global styles in `app/globals.css`
- Tailwind classes follow utility-first approach
- Custom button styles: `.btn-white`, `.btn-white-outline`, `.input-epicare`
- Primary color: Cyan (`#4ABADB` / `bg-primary`)
- Use Shadcn components for consistency

## Testing API Integration

### Manual Testing
1. Complete form at `/explore` with valid data
2. Check browser console for API request/response logs
3. Verify sessionStorage contains `insuranceFormData` and `insurancePlans`
4. Ensure `/insurance-options` loads plans correctly

### Debugging Tips
- All API calls log to console (search for "All State" in logs)
- Check Network tab for `/api/insurance/quote` endpoint
- Verify environment variables are loaded (not committed to repo)
- Use `/api/insurance/debug` route if available for testing

## Known Limitations
- TypeScript/ESLint errors ignored during builds (intentional for rapid iteration)
- API authentication uses Basic auth (credentials in env vars)
- No backend database - all data client-side (sessionStorage/localStorage)
- Cart system is client-only (not synced to server)
- Single user mode - no authentication implemented yet

## Future Considerations (from CONTEXT.MD)
- Supabase integration for database & auth (Phase 3)
- Magic Link authentication (Phase 3)
- Enrollment API integration for checkout (Phase 4)
- Multi-provider support beyond All State
- Server-side cart persistence
- Payment gateway integration
