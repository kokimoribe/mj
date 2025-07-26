"use client";

import Image from "next/image";

export default function QRCodePage() {
  const qrCodeUrl = "https://rtmjp.vercel.app/";
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">River Terrace Mahjong Parlor</h1>
          <p className="text-muted-foreground">
            Scan to view the leaderboard on your mobile device
          </p>
        </div>

        {/* QR Code Container */}
        <div className="inline-block rounded-2xl bg-white p-8 shadow-lg">
          <Image
            src="/qr_code.png"
            alt="QR Code for River Terrace Mahjong Parlor"
            width={384}
            height={384}
            className="h-96 w-96"
            priority
          />
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="text-muted-foreground space-y-2 text-sm">
            <p className="font-medium">How to use:</p>
            <ol className="inline-block space-y-1 text-left">
              <li>1. Open your phone&apos;s camera app</li>
              <li>2. Point it at the QR code above</li>
              <li>3. Tap the notification to open the site</li>
              <li>4. Add to home screen for quick access</li>
            </ol>
          </div>

          {/* Alternative Link */}
          <div className="border-t pt-4">
            <p className="text-muted-foreground mb-2 text-xs">
              Or visit directly:
            </p>
            <a
              href={qrCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-mono text-sm hover:underline"
            >
              {qrCodeUrl}
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = "/qr_code.png";
              link.download = "river-terrace-mahjong-qr.png";
              link.click();
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Download QR Code
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator
                  .share({
                    title: "River Terrace Mahjong Parlor",
                    text: "Check out the River Terrace Mahjong Parlor leaderboard!",
                    url: qrCodeUrl,
                  })
                  .catch(() => {
                    // User cancelled or share failed
                  });
              } else {
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(qrCodeUrl).then(() => {
                  alert("Link copied to clipboard!");
                });
              }
            }}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Share Website
          </button>
        </div>

        {/* Print-friendly message */}
        <p className="text-muted-foreground hidden text-xs print:block">
          Scan this QR code to access the River Terrace Mahjong Parlor
          leaderboard
        </p>
      </div>
    </div>
  );
}
