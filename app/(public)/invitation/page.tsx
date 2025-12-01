import { InvitationPage } from '@/components/InvitationPage';
import { getInvitationSettings } from '@/lib/invitation-check';
import { notFound } from 'next/navigation';

/**
 * Invitation page route
 * Requirements: 2.1, 2.2 - Display invitation page with site title, description, and hero section
 */
export default async function InvitationPageRoute() {
  const settings = await getInvitationSettings();

  // If no settings available, show 404
  if (!settings) {
    notFound();
  }

  return (
    <InvitationPage
      settings={{
        siteTitle: settings.siteTitle,
        contactEmail: settings.contactEmail,
        invitationHeadline: settings.invitationHeadline,
        invitationDescription: settings.invitationDescription,
        invitationLaunchDate: settings.invitationLaunchDate,
        invitationBackgroundImage: settings.invitationBackgroundImage,
        invitationTwitterUrl: settings.invitationTwitterUrl,
        invitationInstagramUrl: settings.invitationInstagramUrl,
        invitationFacebookUrl: settings.invitationFacebookUrl,
      }}
    />
  );
}
