import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlightLab | Demo booking",
  description: "A compact, deterministic flight-booking demo for Opssemble.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a className="brand" href="/" aria-label="FlightLab search">
            <span aria-hidden="true">✦</span> FlightLab
          </a>
          <p className="demo-label">Demo booking environment</p>
        </header>
        <main>{children}</main>
        <footer>FlightLab · no real flights or payments</footer>
      </body>
    </html>
  );
}
