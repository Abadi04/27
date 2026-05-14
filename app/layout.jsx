import "./globals.css";

export const metadata = {
  title: "Veil | Anonymous Messaging",
  description: "Anonymous messaging product UI prototype built from Refero-researched social and messaging patterns.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
