import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { checkInvitationMode } from "@/lib/invitation-check";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check invitation mode to conditionally hide header/footer
    const { isInvitationMode, isAdmin } = await checkInvitationMode();
    
    // Hide header/footer when invitation mode is active and user is not admin
    const showHeaderFooter = !isInvitationMode || isAdmin;
    
    return (
        <>
            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="skip-link">
                Ana içeriğe geç
            </a>
            {showHeaderFooter && <Header />}
            <div id="main-content">
                {children}
            </div>
            {showHeaderFooter && <Footer />}
        </>
    );
}
