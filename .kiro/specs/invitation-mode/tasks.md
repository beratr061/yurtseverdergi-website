# Implementation Plan

- [x] 1. Extend database schema for invitation mode





  - [x] 1.1 Add invitation fields to Settings model in Prisma schema


    - Add invitationMode, invitationHeadline, invitationDescription, invitationLaunchDate
    - Add invitationBackgroundImage, invitationTwitterUrl, invitationInstagramUrl, invitationFacebookUrl
    - _Requirements: 1.1, 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 1.2 Create InvitationEmail model in Prisma schema


    - Add id, email (unique), subscribedAt fields
    - Add appropriate indexes
    - _Requirements: 3.1_
  - [x] 1.3 Run Prisma generate to update client


    - _Requirements: 1.1_

- [x] 2. Create invitation mode check utility






  - [x] 2.1 Create lib/invitation-check.ts utility function


    - Check if invitationMode is enabled in settings
    - Return settings data for invitation page
    - Admin users should bypass invitation mode
    - _Requirements: 2.1, 6.1_

  - [x] 2.2 Write property test for invitation mode routing


    - **Property 3: Invitation Mode Routing**
    - **Validates: Requirements 2.1**

- [x] 3. Create email subscription API







  - [x] 3.1 Create POST /api/invitation/subscribe endpoint


    - Validate email format
    - Check for duplicate emails
    - Save to InvitationEmail collection
    - Return appropriate success/error messages
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 3.2 Write property test for valid email subscription


    - **Property 4: Valid Email Subscription**
    - **Validates: Requirements 3.1**
  - [x] 3.3 Write property test for invalid email rejection




    - **Property 5: Invalid Email Rejection**
    - **Validates: Requirements 3.3**

- [x] 4. Create email management APIs (admin)





  - [x] 4.1 Create GET /api/invitation/emails endpoint


    - Return list of all subscribed emails with dates
    - Include total count
    - Require admin authentication
    - _Requirements: 5.1, 5.2_
  - [x] 4.2 Create GET /api/invitation/emails/export endpoint


    - Generate CSV file with all emails
    - Set proper Content-Type headers
    - Require admin authentication
    - _Requirements: 5.3_
  - [x] 4.3 Write property test for CSV export completeness


    - **Property 6: CSV Export Completeness**
    - **Validates: Requirements 5.3**
  - [x] 4.4 Create DELETE /api/invitation/emails/[id] endpoint


    - Remove email from collection
    - Require admin authentication
    - _Requirements: 5.4_

- [x] 5. Extend Settings API for invitation fields





  - [x] 5.1 Update PUT /api/settings to handle invitation fields


    - Add validation for URL formats
    - Add validation for date (must be future)
    - Add validation for text lengths
    - _Requirements: 1.3, 1.4_
  - [x] 5.2 Write property test for settings persistence


    - **Property 1: Settings Persistence Round-Trip**
    - **Validates: Requirements 1.1, 1.3**
  - [x] 5.3 Write property test for invalid settings rejection


    - **Property 2: Invalid Settings Rejection**
    - **Validates: Requirements 1.4**

- [x] 6. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create InvitationPage component






  - [x] 7.1 Create components/InvitationPage.tsx

    - Full-screen elegant design with animations
    - Display site title/logo with artistic typography
    - Display headline and description
    - Responsive design for mobile, tablet, desktop
    - No header, footer, or navigation elements
    - _Requirements: 2.2, 2.5, 7.1, 7.2, 7.3, 7.5_

  - [x] 7.2 Create components/InvitationCountdown.tsx






    - Display days, hours, minutes, seconds
    - Auto-update every second

    - Hide if no launch date configured
    - _Requirements: 2.3_

  - [x] 7.3 Create components/EmailSubscriptionForm.tsx


    - Email input with validation
    - Submit button with loading state
    - Success/error message display
    - _Requirements: 3.1, 3.3, 3.4_
  - [x] 7.4 Add social media links section to InvitationPage










    - Display Twitter, Instagram, Facebook icons
    - Only show configured links
    - _Requirements: 2.4_

- [x] 8. Create invitation page route





  - [x] 8.1 Create app/(public)/invitation/page.tsx


    - Fetch settings from database
    - Render InvitationPage component
    - _Requirements: 2.1, 2.2_

  - [x] 8.2 Create app/(public)/invitation/layout.tsx

    - No header or footer
    - Clean, standalone layout
    - _Requirements: 2.5_

- [x] 9. Integrate invitation mode check into public pages





  - [x] 9.1 Update lib/invitation-check.ts to redirect to invitation page


    - Check invitationMode in settings
    - Redirect non-admin users to /invitation
    - _Requirements: 2.1_
  - [x] 9.2 Update app/(public)/page.tsx to check invitation mode


    - Call checkInvitationMode at start
    - _Requirements: 2.1_
  - [x] 9.3 Update app/(public)/layout.tsx to conditionally render header/footer


    - Hide header/footer when in invitation mode
    - _Requirements: 2.5_

- [x] 10. Create admin invitation settings UI





  - [x] 10.1 Update components/admin/SettingsForm.tsx


    - Add invitation mode toggle
    - Add headline and description inputs
    - Add launch date picker
    - Add social media URL inputs
    - Add background image picker (use existing MediaPicker)
    - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 10.2 Create email list section in SettingsForm

    - Display email count
    - Button to view full list (modal)
    - Button to export CSV
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 10.3 Create EmailListModal component

    - Display all emails with dates
    - Delete button for each email
    - Pagination if needed
    - _Requirements: 5.2, 5.4_

- [x] 11. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Write property test for admin access during invitation mode





  - **Property 7: Admin Access During Invitation Mode**
  - **Validates: Requirements 6.1**

- [x] 13. Final integration and polish





  - [x] 13.1 Add smooth animations to InvitationPage


    - Fade-in effects on load
    - Subtle hover animations
    - _Requirements: 7.1, 7.4_
  - [x] 13.2 Test responsive design across devices


    - Mobile (320px - 768px)
    - Tablet (768px - 1024px)
    - Desktop (1024px+)
    - _Requirements: 7.5_
  - [x] 13.3 Update default settings in API to include invitation defaults


    - _Requirements: 1.1_

- [x] 14. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
