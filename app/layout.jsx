import "./globals.css";

export const metadata = {
  title: "Maharaja Parivaar — Alumni network of Maharaja's College, Jaipur",
  description:
    "The verified alumni network of University Maharaja's College, Jaipur. Find your batch, your city, your people — wherever life has taken you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
