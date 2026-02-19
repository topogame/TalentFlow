# App Store Review Readiness Prompt

Copy and paste this prompt into your AI assistant before submitting your app to Apple App Store review. The AI will perform a comprehensive check against Apple's App Review Guidelines to minimize rejection risk.

> **Note:** This prompt covers Apple App Store. For Google Play Store, the same AI can adapt most checks — just mention "Google Play" when running.

---

## PROMPT START

```
You are an App Store submission specialist. You know this app from the development process. Your task is to perform a final readiness check before I submit to Apple App Store review.

Apple rejects ~30-40% of first submissions. Your job is to catch every possible rejection reason BEFORE I submit.

> **IMPORTANT — Communication Style:** The product owner (Murat) is a non-technical entrepreneur. For every issue found, explain in plain Turkish: (1) what the problem is, (2) why Apple will reject for this, and (3) exactly what needs to be done to fix it. If the fix requires code changes, describe WHAT needs to change at a business level — Claude (the AI assistant) will handle the technical implementation.

===========================
APP INFORMATION
===========================
- App Name: [APP NAME]
- Bundle ID: [com.company.appname]
- Version: [1.0.0]
- Category: [e.g., Lifestyle, Travel, Productivity]
- Target iOS Version: [e.g., iOS 16+]
- Built with Xcode: [e.g., Xcode 16.2]
- Monetization: [Free / Freemium / Paid / Subscription]
- Uses In-App Purchases: [Yes / No]
- Uses Location Services: [Yes / No — if yes, WhenInUse or Always?]
- Uses Camera/Photos: [Yes / No]
- Uses Push Notifications: [Yes / No]
- Uses Sign in with Apple: [Yes / No]
- Uses 3rd Party Login: [Yes / No — if yes, which providers]
- Uses External AI Services: [Yes / No — if yes, which providers (OpenAI, Anthropic, etc.)]
- Has User-Generated Content: [Yes / No]
- Has Web-Based Features: [Yes / No]
- Backend URL: [API endpoint]
- Target Markets: [e.g., Turkey only, Global, US + EU]
- Primary Language: [e.g., Turkish, English]

Ask me for any missing information before starting.

===========================
ACCESS MODE
===========================
**Mode A — Full Access:** You have access to the codebase and can inspect files directly.
**Mode B — Guided:** You provide checks and I confirm or paste results.

Ask: "Do I have direct access to the codebase? (Mode A / Mode B)"

**Mode B command guidance:**
When in Mode B, for each check provide the EXACT commands or steps the user should run. Examples:
```
# Check Info.plist permissions:
$ plutil -p Info.plist | grep -i "Usage"

# Check for hardcoded secrets:
$ grep -r "api_key\|secret\|password\|token" --include="*.swift" --include="*.m" .

# Check for private API usage:
$ otool -L YourApp.app/YourApp | grep -i private

# Check ATS exceptions:
$ plutil -p Info.plist | grep -A5 "NSAppTransportSecurity"

# List all background modes:
$ plutil -p Info.plist | grep -A10 "UIBackgroundModes"

# Check SDK privacy manifests:
$ find Pods/ -name "PrivacyInfo.xcprivacy" -type f

# Verify build configuration is Release:
$ xcodebuild -showBuildSettings | grep "CONFIGURATION"
```

===========================
CHECK 1: APP REVIEW GUIDELINES COMPLIANCE
===========================
Go through each relevant section of Apple's App Review Guidelines and verify:

**1.1 — Safety**
- [ ] No objectionable content (hate speech, discrimination, violence)
- [ ] If user-generated content exists: content moderation + reporting mechanism in place
- [ ] If user-generated content exists: ability to block/mute abusive users
- [ ] If user-generated content exists: age-restriction mechanism implemented (Guideline 1.2.1 — required since late 2025)
- [ ] No realistic violence or harm encouragement
- [ ] Physical harm disclaimer present if app provides health/fitness/medical info
- [ ] **Age rating questionnaire completed** with the new 13+/16+/18+ structure (required by January 31, 2026 — old 4+/9+ structure is replaced)
- [ ] If app uses AI features: AI-generated content considered in age rating assessment

**1.2 — Performance**
- [ ] App is complete and functional (no "beta", "test", "demo" labels anywhere)
- [ ] No placeholder content (lorem ipsum, sample data, broken images)
- [ ] No broken links or dead-end screens
- [ ] App does not crash on launch (test on real device, not just simulator)
- [ ] App works in airplane mode or shows graceful offline message
- [ ] App works on all supported device sizes (iPhone SE → iPhone 16 Pro Max)
- [ ] App works on minimum supported iOS version
- [ ] No excessive battery drain or CPU usage
- [ ] App size is reasonable (<200MB for cellular download limit awareness)
- [ ] No hidden features or undocumented functionality
- [ ] **Backend services are live and stable during review** (Apple tests your API — if it's down, instant rejection)
- [ ] If backend has IP restrictions: Apple's IP range is whitelisted or unrestricted

**1.3 — Business**
- [ ] Subscription terms clearly displayed before purchase
- [ ] Free trial terms clear (duration, what happens after, how to cancel)
- [ ] Restore Purchases button is present and functional
- [ ] Price displayed matches what's configured in App Store Connect
- [ ] If subscription: auto-renewal terms shown per Apple's required language
- [ ] No references to pricing in hardcoded currency (StoreKit provides localized prices)

**In-App Purchase payment rules (regional):**
> - **Default (most storefronts):** All digital goods/services MUST use Apple IAP. No external payment links allowed.
> - **US storefront (since May 2025):** External payment links and calls to action are now permitted. External Link Account entitlement no longer required. "Scare screen" removed.
> - **EU storefront (DMA):** Alternative payment processing and external links permitted under Apple's DMA compliance terms.
> - **Your action:** Based on your Target Markets, determine which rules apply and verify compliance for EACH storefront you distribute to.

**1.4 — Design**
- [ ] App provides real value (not a simple website wrapper)
- [ ] UI follows iOS conventions (no Android-style back arrows, uses iOS navigation patterns)
- [ ] No misleading UI elements (fake close buttons, disguised ads)
- [ ] App icon is unique and does not mimic Apple or other apps' icons
- [ ] **App icon and name do not use another developer's brand, icon, or product name** (Guideline 4.1c — new November 2025)
- [ ] Launch screen matches the first screen of the app (not a splash ad)
- [ ] App responds to all device orientations it claims to support
- [ ] Dark mode supported or gracefully handled
- [ ] Dynamic Type / accessibility text sizes respected (if applicable)
- [ ] No UI elements obscured by notch, Dynamic Island, or home indicator
- [ ] Safe area insets respected on all screens (content not hidden behind system UI)

**1.5 — Legal**
- [ ] Privacy Policy URL is set in App Store Connect AND accessible from within the app
- [ ] Terms of Service accessible from within the app (if has accounts/subscriptions)
- [ ] EULA configured in App Store Connect (if needed beyond default Apple EULA)
- [ ] App does not use Apple trademarks improperly
- [ ] No copyrighted content used without permission
- [ ] Open source licenses respected and attributed

Show me: Compliance checklist with ✅/❌ per item. Flag all ❌ items as blockers.
For any ❌ item: explain the specific Apple guideline violated, the rejection risk level, and the exact fix needed.

===========================
CHECK 2: PRIVACY & DATA COLLECTION
===========================
This is the #1 reason for delays and rejections in 2025-2026.

**2.1 — Info.plist Privacy Keys**
Verify every permission has a clear, specific usage description:
```
NSLocationWhenInUseUsageDescription  → Must explain WHY (not just "needs location")
NSLocationAlwaysUsageDescription     → Only if truly needed (rare, triggers extra review)
NSCameraUsageDescription             → Specific reason
NSPhotoLibraryUsageDescription       → Specific reason
NSUserTrackingUsageDescription       → Required if using ATT
```
- [ ] Every requested permission has a human-readable, specific description
- [ ] No unnecessary permissions requested (Apple flags this)
- [ ] Location permission level is appropriate (WhenInUse vs Always)
- [ ] No background location unless absolutely necessary with clear justification

**2.2 — App Tracking Transparency (ATT)**
- [ ] If using any 3rd party analytics/ads that track: ATT prompt implemented
- [ ] ATT prompt shown BEFORE any tracking occurs
- [ ] App functions fully if user denies tracking
- [ ] If no tracking: confirm no tracking SDKs are included (Facebook SDK, Google Analytics with IDFA, etc.)

**2.3 — AI Data Transparency (Guideline 5.1.2(i) — enforced November 2025)**
- [ ] If app sends personal data to external AI services (OpenAI, Anthropic, Google AI, etc.): consent modal is shown BEFORE any data is sent
- [ ] Consent modal specifies: which AI provider, what data types are shared
- [ ] User can deny AI data sharing and app still functions (possibly with reduced features)
- [ ] AI data sharing is documented in Privacy Policy

**2.4 — App Privacy Nutrition Label**
This MUST match your actual data collection. Mismatches = rejection.
- [ ] Review every data type in App Store Connect privacy section
- [ ] Verify against actual code: what data do you actually collect?
- [ ] Contact Info declared if collecting: name, email, phone
- [ ] Location declared if collecting: precise location, coarse location
- [ ] Identifiers declared if collecting: user ID, device ID, advertising ID
- [ ] Usage Data declared if collecting: product interaction, advertising data
- [ ] Diagnostics declared if collecting: crash data, performance data (Sentry, Firebase Crashlytics)
- [ ] Financial Info declared if collecting: payment info, credit card
- [ ] "Data Linked to You" vs "Data Not Linked to You" correctly categorized
- [ ] "Data Used to Track You" section accurate (anything used for cross-app tracking)
- [ ] 3rd party SDK data collection accounted for (each SDK's PrivacyInfo.xcprivacy tells you what it collects)
- [ ] AI service data sharing declared (if sending user data to external AI providers)

**2.5 — Required Privacy Documents**
- [ ] Privacy Policy URL is valid, loads, and is current
- [ ] Privacy Policy covers ALL data collected (including 3rd party SDKs)
- [ ] Privacy Policy available in app's primary language
- [ ] If EU users: GDPR compliance mentioned
- [ ] If Turkish users: KVKK compliance mentioned
- [ ] Data deletion mechanism available (Apple requires this since 2022)
  - [ ] Account deletion option in app settings (if app has accounts)
  - [ ] Deletion actually removes data (not just deactivates)
  - [ ] Deletion process clearly explained to user

Show me: Privacy audit results, any mismatches between declared and actual data collection.
For any mismatch: specify exactly which data type needs to be added/removed in App Store Connect, and what code change is needed.

===========================
CHECK 3: AUTHENTICATION & SIGN IN
===========================

**3.1 — Sign in with Apple**
- [ ] If app offers ANY 3rd party social login (Google, Facebook, Twitter, GitHub, etc.), Sign in with Apple MUST also be offered
  - Note: Email/password-only login does NOT trigger this requirement. Only social/federated login providers do.
- [ ] Sign in with Apple button follows Apple's Human Interface Guidelines (correct size, style, placement — use Apple's official ASAuthorizationAppleIDButton)
- [ ] Sign in with Apple is on the same screen as other login options (not hidden behind "more options")
- [ ] Sign in with Apple works end-to-end (test the full flow on a real device)
- [ ] Handle "Hide My Email" relay addresses correctly (emails to @privaterelay.appleid.com must deliver)
- [ ] Handle users who don't share their name gracefully (show "User" or ask later)
- [ ] Server-to-server notification endpoint registered in Apple Developer portal (required for South Korea since Jan 2026, recommended globally)

**3.2 — Guest Access**
- [ ] If app can function without an account, allow guest/anonymous usage
- [ ] Don't force login before user can see what the app does
- [ ] If login is required: clearly explain WHY on the login screen

**3.3 — Account Deletion**
- [ ] Account deletion option is in the app (not just "email us to delete")
- [ ] Deletion flow clearly explains what will be deleted
- [ ] Deletion is permanent (or clearly states data retention period)
- [ ] Subscriptions: remind user to cancel subscription before deleting account

Show me: Auth flow assessment with pass/fail per item.
For any ❌ item: explain what's wrong and provide the specific fix (code change, config change, or UI change needed).

===========================
CHECK 4: IN-APP PURCHASES & SUBSCRIPTIONS
===========================
Skip if app is completely free with no IAP.

**4.1 — IAP Implementation**
- [ ] Digital goods/services use Apple IAP (StoreKit) per your storefront's rules (see Check 1.3 regional rules)
- [ ] Using StoreKit 2 recommended (StoreKit 1 still works but StoreKit 2 is simpler and Apple-preferred)
- [ ] Products configured in App Store Connect match what's shown in app (product IDs, types, prices)
- [ ] Purchase flow handles all states: success, failure, cancellation, pending (Ask to Buy for family accounts)
- [ ] Restore Purchases button exists and works (test: buy → delete app → reinstall → restore)
- [ ] Receipt validation implemented (server-side recommended for subscriptions)
- [ ] Products display in user's local currency (StoreKit handles this — never hardcode prices)
- [ ] If using StoreKit 2: Transaction.updates listener handles unfinished transactions on app launch

**4.2 — Subscription-Specific**
- [ ] Subscription terms shown on paywall:
  - Price per period
  - Duration of free trial (if any)
  - Auto-renewal statement
  - How to cancel
  - Link to Terms and Privacy Policy
- [ ] Apple's required subscription disclaimer text present (verify current wording from Apple's official documentation — text below is a reference, Apple may update it):
  > "Payment will be charged to your Apple ID account at the confirmation of purchase. Subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase."
- [ ] Trial period matches what's configured in App Store Connect
- [ ] Subscription works after expiry → graceful downgrade to free tier
- [ ] Handle subscription status changes (upgrade, downgrade, cancellation, refund)

**4.3 — Paywall Design**
- [ ] Paywall is not the first screen (user must see app value first)
- [ ] Close/dismiss button is visible and functional (not hidden or delayed)
- [ ] No dark patterns (pre-selected expensive option, confusing buttons)
- [ ] Free features clearly available without hitting paywall

Show me: IAP compliance checklist with pass/fail per item.
For any ❌ item: explain the fix needed. If Restore Purchases is missing, provide the exact StoreKit code to add it.

===========================
CHECK 5: APP STORE CONNECT METADATA
===========================

**5.1 — App Information**
- [ ] App name: ≤30 characters, no keyword stuffing, no generic terms
- [ ] Subtitle: ≤30 characters, descriptive, no repeating app name
- [ ] Description: Accurate, no competitor names, no pricing info
- [ ] Keywords: 100 characters max, comma-separated, no spaces after commas, no duplicates of app name
- [ ] Category and subcategory correctly chosen
- [ ] Content rating questionnaire completed accurately
- [ ] Copyright field filled (e.g., "© 2026 Your Name")
- [ ] Support URL is valid and loads
- [ ] Privacy Policy URL is valid and loads

**5.2 — Screenshots**
Required sizes (at minimum — check App Store Connect for current requirements):
- [ ] 6.9" display (iPhone 16 Pro Max): 1320 × 2868 px
- [ ] 6.7" display (iPhone 15 Pro Max): 1290 × 2796 px (can use 6.9" as fallback)
- [ ] 6.5" display (iPhone 14 Plus / 15 Plus): 1284 × 2778 px (can use 6.7" as fallback)
- [ ] 5.5" display (iPhone 8 Plus): 1242 × 2208 px (only if supporting iOS 15 or older devices)
- [ ] iPad Pro 12.9" 6th gen (if universal app): 2048 × 2732 px

Rules:
- [ ] Minimum 3 screenshots, maximum 10
- [ ] Screenshots show actual app UI (not just marketing graphics)
- [ ] No misleading screenshots (don't show features that don't exist)
- [ ] No iPhone hardware frames that show a different model than selected size
- [ ] Text in screenshots is in the primary language
- [ ] Screenshots match the current version of the app

**5.3 — App Preview Videos (optional but recommended)**
- [ ] 15-30 seconds duration
- [ ] Shows actual app usage (screen recording, not rendered animation)
- [ ] No inappropriate content in first frame (it's the poster frame)

**5.4 — Review Information**
- [ ] Demo account provided (if login required): username + password in review notes
- [ ] Review notes explain any special setup needed
- [ ] If location-dependent: provide a test location or instructions
- [ ] If hardware-dependent: explain how to test without hardware
- [ ] Contact info (phone + email) is accurate and monitored

Show me: Metadata checklist with ✅/❌ per item.
For any ❌ item: provide the corrected text, correct screenshot size, or missing review note content.

===========================
CHECK 6: TECHNICAL REQUIREMENTS
===========================

**6.1 — Build Requirements**
- [ ] Built with Xcode 16+ and iOS 18 SDK (current requirement since April 2025)
  - Note: Starting April 28, 2026, Xcode and iOS 26 SDK will be required. Plan accordingly but don't block on this before that date.
- [ ] Minimum deployment target is reasonable (iOS 16+ recommended for broadest compatibility)
- [ ] No private API usage (Apple scans binary for this — automatic rejection)
- [ ] No deprecated API usage that triggers warnings
- [ ] Binary size reasonable (check with App Thinning; 200MB is the cellular download limit)
- [ ] Supports arm64 architecture
- [ ] **If using React Native / Flutter / other cross-platform framework:**
  - [ ] Native modules are compiled correctly for arm64
  - [ ] No leftover Android resources or references in the iOS build
  - [ ] Framework-specific App Store requirements met (e.g., Flutter uses correct Runner scheme)

**6.2 — Networking**
- [ ] All network requests use HTTPS (no HTTP exceptions in ATS)
- [ ] If ATS exceptions exist: documented and justified in review notes
- [ ] API endpoints are production URLs (not localhost, staging, or dev)
- [ ] App handles network timeouts gracefully
- [ ] App handles API errors gracefully (server down, 500 errors)
- [ ] No hardcoded IP addresses

**6.3 — Background Modes**
- [ ] Only declared background modes that are actually used
- [ ] Background location: only if core functionality requires it
- [ ] Background audio: only if app plays audio
- [ ] Push notifications: only if implemented
- [ ] Each background mode is justified in review notes (Apple scrutinizes these)

**6.4 — Third-Party SDKs**
- [ ] All SDKs are from official sources (CocoaPods, SPM, or official downloads)
- [ ] No deprecated or abandoned SDKs
- [ ] **SDK privacy manifests (PrivacyInfo.xcprivacy) present for all 3rd party SDKs** (required since Spring 2024 — missing = rejection)
- [ ] **SDK code signatures verified** (required since Spring 2024)
- [ ] No SDK is using restricted APIs (Required Reasons APIs) without a valid reason declared in privacy manifest
- [ ] Audit each SDK for what data it collects — this must match your App Privacy nutrition label
- [ ] SDKs are up to date (outdated SDKs with known vulnerabilities trigger rejection)

Show me: Technical compliance checklist with pass/fail per item.
For any ❌ item: provide the exact fix (Xcode setting, plist change, SDK update command, or code change).

===========================
CHECK 7: COMMON REJECTION REASONS (TOP 18)
===========================
Cross-check against the most frequent rejection reasons:

| # | Rejection Reason | Status | Notes |
|---|-----------------|--------|-------|
| 1 | Bugs / crashes on launch | ✅/❌ | Test on real device, not simulator |
| 2 | Broken links or placeholder content | ✅/❌ | Check every screen |
| 3 | Missing privacy policy | ✅/❌ | URL must load, must be in-app too |
| 4 | Privacy nutrition label mismatch | ✅/❌ | Declared vs actual data collection |
| 5 | Missing Sign in with Apple | ✅/❌ | Required if any 3rd party login exists |
| 6 | IAP bypass (external payment links) | ✅/❌ | All digital goods via Apple IAP (US exception) |
| 7 | No Restore Purchases button | ✅/❌ | Must exist and work |
| 8 | Misleading screenshots/metadata | ✅/❌ | Must show real current app |
| 9 | Insufficient app functionality | ✅/❌ | Must provide native value, not just a web wrapper |
| 10 | Missing account deletion | ✅/❌ | Required since 2022 — must be in-app, not just email |
| 11 | Improper permission requests | ✅/❌ | Specific descriptions in Info.plist |
| 12 | Background mode abuse | ✅/❌ | Only declared if actually used |
| 13 | Missing subscription terms | ✅/❌ | Apple's exact required disclaimer text |
| 14 | No demo account for review | ✅/❌ | Provide in review notes with clear instructions |
| 15 | App is just a website wrapper | ✅/❌ | Must use native features and capabilities |
| 16 | Missing SDK privacy manifests | ✅/❌ | PrivacyInfo.xcprivacy required for all SDKs |
| 17 | AI data sent without user consent | ✅/❌ | Consent modal required before sharing data with AI providers |
| 18 | Backend down during review | ✅/❌ | Server must be live and accessible |

Show me: Status of each rejection reason.
For any ❌ item: this is a HIGH RISK rejection. Provide the exact fix with priority.

===========================
CHECK 8: DEVICE TESTING MATRIX
===========================
Verify the app works on these configurations:

| Device | iOS Version | Status | Notes |
|--------|------------|--------|-------|
| iPhone SE (3rd gen) | Minimum supported | ✅/❌ | Smallest screen |
| iPhone 14/15 | Latest iOS | ✅/❌ | Standard size |
| iPhone 15/16 Pro Max | Latest iOS | ✅/❌ | Largest screen |
| iPad (if universal) | Latest iPadOS | ✅/❌ | Tablet layout |

Additional tests:
- [ ] Low storage scenario (< 1GB free space)
- [ ] Low battery mode
- [ ] Poor network (3G simulation via Xcode Network Link Conditioner)
- [ ] No network (airplane mode) — app should not crash, show meaningful message
- [ ] Permission denied scenarios (location denied, notifications denied, camera denied)
- [ ] Interruptions (phone call during use, Siri activation, notification overlay)
- [ ] Backgrounding and foregrounding (state preserved correctly)
- [ ] Force quit and relaunch (no data loss, login persisted)
- [ ] Fresh install (no cached data, no migration from previous version)
- [ ] Memory pressure (test with Xcode Memory Debugger — no memory leaks)
- [ ] VoiceOver accessibility (can a blind user navigate the core flow?)

**Localization tests (if multi-language):**
- [ ] All user-facing strings translated (no leftover English in Turkish build, or vice versa)
- [ ] Date, time, number, currency formats adapt to locale
- [ ] Long text doesn't overflow UI elements (German text is ~30% longer than English)
- [ ] RTL layout correct if supporting Arabic/Hebrew

**Extensions (if applicable):**
- [ ] Widgets work correctly and show real data (not placeholder)
- [ ] App Clips (if any) are under 15MB and function independently
- [ ] Live Activities (if any) update correctly and respect design guidelines
- [ ] Watch app (if any) works independently and syncs with main app

Show me: Device test matrix results.
For any ❌ device or scenario: describe the failure, its severity, and whether it's a blocker for submission.

===========================
SUBMISSION CHECKLIST
===========================
After all checks pass, final submission steps:

**Pre-Submission:**
- [ ] All checks above are ✅
- [ ] Archive build created from Release configuration (not Debug)
- [ ] Build uploaded to App Store Connect via Xcode or Transporter
- [ ] Build processing complete (wait for email from Apple, usually 15-30 min)
- [ ] Export compliance (encryption) questionnaire answered in App Store Connect
  - If app uses HTTPS only (standard): answer "Yes" to "uses encryption" and "Yes" to "exempt" (standard encryption exemption)
  - If app uses custom encryption: may need to submit an ERN (Encryption Registration Number)

**App Store Connect Setup:**
- [ ] Version number and build number match the uploaded build
- [ ] All localizations completed (at minimum: primary language)
- [ ] **Age rating questionnaire completed with new structure** (13+/16+/18+ — required by Jan 31, 2026)
- [ ] Screenshots uploaded for all required sizes
- [ ] Preview video uploaded (if applicable)
- [ ] Review notes filled with demo account + special instructions
- [ ] **If app is location-dependent:** include test coordinates or city in review notes (e.g., "Test in Istanbul, Turkey — 41.0082, 28.9784")
- [ ] Release option selected: Manual / Automatic after approval
- [ ] Pricing and availability configured (correct countries, correct price tier)
- [ ] In-app purchases submitted for review (if applicable — must be submitted WITH the app, not after)
- [ ] App Privacy section completed and accurate

**Submit:**
- [ ] Click "Submit for Review"
- [ ] Expected review time: 24-48 hours (can be up to 7 days; holidays slower)
- [ ] Monitor email for reviewer feedback
- [ ] Be ready to respond quickly if Apple asks questions

**If Rejected:**
- [ ] Read the rejection reason carefully — Apple cites the specific guideline number
- [ ] Fix ONLY what was cited (don't make unrelated changes that could trigger new issues)
- [ ] Use the Resolution Center in App Store Connect to communicate with the reviewer
- [ ] If rejection seems wrong: reply in Resolution Center with explanation + evidence
- [ ] If needed: request an appeal via the App Review Board
- [ ] After fixing: resubmit (subsequent reviews are usually faster, 24 hours)
- [ ] **Keep a rejection log:** Document every rejection with date, reason, guideline number, and fix applied. This helps identify patterns and prevent repeat rejections.

===========================
AUDIT SUMMARY
===========================
After all checks, present:

```
============================================
APP STORE REVIEW READINESS
============================================
App: [name] v[version]

| Check | Status | Blockers | Warnings |
|-------|--------|----------|----------|
| 1. Guidelines Compliance | ✅/❌ | X | X |
| 2. Privacy & Data | ✅/❌ | X | X |
| 3. Authentication | ✅/❌ | X | X |
| 4. In-App Purchases | ✅/❌/⏭️ | X | X |
| 5. Metadata | ✅/❌ | X | X |
| 6. Technical | ✅/❌ | X | X |
| 7. Rejection Reasons (18) | ✅/❌ | X | X |
| 8. Device Testing | ✅/❌ | X | X |

🔴 Blockers (will cause rejection): [X]
🟡 Warnings (may cause rejection): [X]
🟢 Ready: [X]

Verdict: READY TO SUBMIT ✅ / FIX REQUIRED ❌
============================================
```

**If READY TO SUBMIT:** Provide the submission checklist above.
**If FIX REQUIRED:** List every blocker with specific fix instructions, then re-check after fixes.

===========================
BEGIN
===========================

First:
1. Confirm you know this app (summarize what it does)
2. Ask for App Information fields above
3. Determine access mode (A or B)
4. Start with Check 1

Let's begin.
```

## PROMPT END

---

## Usage Notes

- **When to use:** Right before submitting to App Store. Run this AFTER your Pre-Release Audit and AFTER development is complete.
- **Re-run after rejection:** If Apple rejects, paste the rejection reason and ask AI to focus on that specific issue, then re-run the full checklist.
- **Google Play adaptation:** Same prompt works for Google Play with minor adjustments. Tell the AI "adapt for Google Play" — the main differences are: no Sign in with Apple requirement, Google Play billing instead of StoreKit, different screenshot sizes, different metadata limits.
- **Review times:** Apple typically reviews within 24-48 hours. Expedited review is available for critical bug fixes.
- **Common tip:** The #1 thing you can do to speed up review is provide excellent review notes with a demo account and clear instructions for location-dependent features.
