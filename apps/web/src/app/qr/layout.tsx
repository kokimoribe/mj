import { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code | River Terrace Mahjong Parlor",
  description:
    "Scan this QR code to quickly access River Terrace Mahjong Parlor leaderboard on your mobile device",
  openGraph: {
    title: "QR Code | River Terrace Mahjong Parlor",
    description: "Quick access to the mahjong leaderboard",
    type: "website",
  },
};

export default function QRLayout({ children }: { children: React.ReactNode }) {
  return children;
}
