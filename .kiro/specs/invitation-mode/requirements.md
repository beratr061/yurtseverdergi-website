# Requirements Document

## Introduction

Bu özellik, site yayına alınmadan önce ziyaretçileri karşılayacak bir "Davet Modu" sistemi sağlar. Davet modu aktif olduğunda, site normal içerik yerine etkileyici bir davet/tanıtım sayfası gösterir. Bu sayfa, siteyi tanıtır, yakında gelecek içerikler hakkında heyecan yaratır ve ziyaretçilerin e-posta bırakarak haberdar olmalarını sağlar. Admin panelinden tek bir butonla davet modu açılıp kapatılabilir.

## Glossary

- **Davet Modu (Invitation Mode)**: Sitenin normal içerik yerine tanıtım/davet sayfası gösterdiği özel durum
- **Davet Sayfası (Invitation Page)**: Davet modu aktifken ziyaretçilere gösterilen özel tasarlanmış sayfa
- **E-posta Listesi (Email List)**: Siteyi takip etmek isteyen ziyaretçilerin bıraktığı e-posta adresleri
- **Geri Sayım (Countdown)**: Sitenin yayına alınacağı tarihe kadar kalan süreyi gösteren sayaç
- **Settings**: Site genelindeki ayarları tutan veritabanı modeli
- **Admin Panel**: Yöneticilerin site ayarlarını kontrol ettiği arayüz

## Requirements

### Requirement 1

**User Story:** As a site administrator, I want to toggle invitation mode on/off from the settings panel, so that I can control when the site shows invitation content versus regular content.

#### Acceptance Criteria

1. WHEN an administrator clicks the invitation mode toggle in settings THEN the Settings model SHALL update the invitationMode field to the new boolean value
2. WHEN invitation mode is enabled THEN the system SHALL display additional configuration options for invitation page content
3. WHEN invitation mode settings are saved THEN the system SHALL persist all invitation-related fields to the database immediately
4. IF the administrator attempts to save invalid invitation settings THEN the system SHALL display appropriate validation errors and prevent saving

### Requirement 2

**User Story:** As a site visitor, I want to see an attractive invitation page when the site is in invitation mode, so that I understand what the site is about and feel excited about its launch.

#### Acceptance Criteria

1. WHEN a visitor accesses any public page while invitation mode is active THEN the system SHALL display the invitation page without any redirects to admin or other pages
2. WHEN the invitation page loads THEN the system SHALL display the site title, description, and a visually appealing hero section
3. WHEN the invitation page loads THEN the system SHALL display the countdown timer if a launch date is configured
4. WHEN the invitation page loads THEN the system SHALL display social media links if configured
5. WHILE invitation mode is active THEN the system SHALL hide all navigation elements, headers, footers, and any links to other pages

### Requirement 3

**User Story:** As a site visitor, I want to subscribe with my email to be notified when the site launches, so that I don't miss the launch announcement.

#### Acceptance Criteria

1. WHEN a visitor enters a valid email and submits the subscription form THEN the system SHALL save the email to the InvitationEmail collection
2. WHEN a visitor attempts to subscribe with an already registered email THEN the system SHALL display a friendly message indicating the email is already subscribed
3. IF a visitor submits an invalid email format THEN the system SHALL display a validation error without saving
4. WHEN an email is successfully saved THEN the system SHALL display a success confirmation message to the visitor

### Requirement 4

**User Story:** As a site administrator, I want to customize the invitation page content, so that I can create an engaging first impression for visitors.

#### Acceptance Criteria

1. WHEN configuring invitation mode THEN the system SHALL allow setting a custom headline text
2. WHEN configuring invitation mode THEN the system SHALL allow setting a custom description/subtext
3. WHEN configuring invitation mode THEN the system SHALL allow setting a launch date for the countdown timer
4. WHEN configuring invitation mode THEN the system SHALL allow setting social media links (Twitter, Instagram, Facebook)
5. WHEN configuring invitation mode THEN the system SHALL allow uploading or selecting a background image

### Requirement 5

**User Story:** As a site administrator, I want to view and export the collected email addresses, so that I can notify subscribers when the site launches.

#### Acceptance Criteria

1. WHEN an administrator views the invitation settings THEN the system SHALL display the count of collected email addresses
2. WHEN an administrator clicks the view emails button THEN the system SHALL display a list of all collected emails with subscription dates
3. WHEN an administrator clicks the export button THEN the system SHALL generate and download a CSV file containing all email addresses
4. WHEN an administrator deletes an email from the list THEN the system SHALL remove that email from the InvitationEmail collection

### Requirement 6

**User Story:** As a site administrator, I want the admin panel to remain accessible during invitation mode, so that I can manage the site and prepare content.

#### Acceptance Criteria

1. WHILE invitation mode is active THEN the system SHALL allow authenticated administrators to access all admin panel routes via direct URL (/admin)
2. WHILE invitation mode is active THEN the system SHALL allow authenticated administrators to create, edit, and manage articles
3. WHILE invitation mode is active THEN the system SHALL hide all references to admin panel from the public-facing invitation page

### Requirement 7

**User Story:** As a site visitor, I want to experience a beautiful and immersive invitation page, so that I feel welcomed and excited about the upcoming site.

#### Acceptance Criteria

1. WHEN the invitation page loads THEN the system SHALL display an elegant full-screen design with smooth animations
2. WHEN the invitation page loads THEN the system SHALL display a prominent site logo or title with artistic typography
3. WHEN the invitation page loads THEN the system SHALL display an inspiring tagline or welcome message
4. WHEN the visitor scrolls or interacts THEN the system SHALL provide subtle visual feedback through animations
5. WHEN the invitation page loads THEN the system SHALL adapt the design responsively for mobile, tablet, and desktop devices

