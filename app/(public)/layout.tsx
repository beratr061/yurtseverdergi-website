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
            {showHeaderFooter && <Header />}
            {children}
            {showHeaderFooter && <Footer />}
        </>
    );
}
