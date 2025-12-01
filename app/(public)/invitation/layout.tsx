/**
 * Invitation page layout - clean, standalone layout without header or footer
 * Requirements: 2.5 - Hide all navigation elements, headers, footers
 */
export default function InvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
