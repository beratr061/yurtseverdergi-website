import { redirect } from 'next/navigation';
import { getSettings } from './db';
import { auth } from '@/auth';

/**
 * Invitation settings data returned when invitation mode is active
 */
export interface InvitationSettings {
  siteTitle: string;
  invitationMode: boolean;
  invitationHeadline?: string | null;
  invitationDescription?: string | null;
  invitationLaunchDate?: Date | null;
  invitationBackgroundImage?: string | null;
  invitationTwitterUrl?: string | null;
  invitationInstagramUrl?: string | null;
  invitationFacebookUrl?: string | null;
}

/**
 * Result of checking invitation mode
 */
export interface InvitationCheckResult {
  isInvitationMode: boolean;
  isAdmin: boolean;
  settings: InvitationSettings | null;
}

/**
 * Checks if invitation mode is enabled and returns relevant settings.
 * Admin users bypass invitation mode.
 * 
 * @returns InvitationCheckResult with mode status and settings data
 */
export async function checkInvitationMode(): Promise<InvitationCheckResult> {
  try {
    // Check session first - admin users bypass invitation mode
    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';
    
    const { data } = await getSettings();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = data as any;
    
    if (!settings) {
      return {
        isInvitationMode: false,
        isAdmin,
        settings: null,
      };
    }
    
    const isInvitationMode = settings.invitationMode === true;
    
    // Extract invitation-related settings
    const invitationSettings: InvitationSettings = {
      siteTitle: settings.siteTitle,
      invitationMode: settings.invitationMode ?? false,
      invitationHeadline: settings.invitationHeadline ?? null,
      invitationDescription: settings.invitationDescription ?? null,
      invitationLaunchDate: settings.invitationLaunchDate ?? null,
      invitationBackgroundImage: settings.invitationBackgroundImage ?? null,
      invitationTwitterUrl: settings.invitationTwitterUrl ?? null,
      invitationInstagramUrl: settings.invitationInstagramUrl ?? null,
      invitationFacebookUrl: settings.invitationFacebookUrl ?? null,
    };
    
    return {
      isInvitationMode,
      isAdmin,
      settings: invitationSettings,
    };
  } catch (error) {
    console.error('Invitation mode check error:', error);
    return {
      isInvitationMode: false,
      isAdmin: false,
      settings: null,
    };
  }
}

/**
 * Checks invitation mode and redirects non-admin users to invitation page if active.
 * Similar to checkMaintenanceMode but for invitation mode.
 * 
 * @returns InvitationSettings if invitation mode is active and user is admin, undefined otherwise
 */
export async function checkAndRedirectInvitationMode(): Promise<InvitationSettings | undefined> {
  let shouldRedirect = false;
  let invitationSettings: InvitationSettings | null = null;
  
  try {
    const result = await checkInvitationMode();
    
    // Admin users bypass invitation mode
    if (result.isAdmin) {
      return result.settings ?? undefined;
    }
    
    if (result.isInvitationMode) {
      shouldRedirect = true;
      invitationSettings = result.settings;
    }
  } catch (error) {
    console.error('Invitation redirect check error:', error);
  }
  
  // redirect must be called outside try-catch
  if (shouldRedirect) {
    redirect('/invitation');
  }
  
  return invitationSettings ?? undefined;
}

/**
 * Gets invitation settings without redirecting.
 * Useful for the invitation page itself to get display data.
 * 
 * @returns InvitationSettings or null if not available
 */
export async function getInvitationSettings(): Promise<InvitationSettings | null> {
  try {
    const { data } = await getSettings();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = data as any;
    
    if (!settings) {
      return null;
    }
    
    return {
      siteTitle: settings.siteTitle,
      invitationMode: settings.invitationMode ?? false,
      invitationHeadline: settings.invitationHeadline ?? null,
      invitationDescription: settings.invitationDescription ?? null,
      invitationLaunchDate: settings.invitationLaunchDate ?? null,
      invitationBackgroundImage: settings.invitationBackgroundImage ?? null,
      invitationTwitterUrl: settings.invitationTwitterUrl ?? null,
      invitationInstagramUrl: settings.invitationInstagramUrl ?? null,
      invitationFacebookUrl: settings.invitationFacebookUrl ?? null,
    };
  } catch (error) {
    console.error('Get invitation settings error:', error);
    return null;
  }
}
