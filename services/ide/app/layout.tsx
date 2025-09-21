import Providers from "./providers";

export const metadata = {
  title: "AI Platform",
  description: "Dark, colorful dashboard",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <style>{`
          :root {
            --bg: #000000;
            --panel: #0b0b0f;
            --muted: #9CA3AF;
            --text: #E5E7EB;
            --accent: #7C3AED;
            --accent2: #06B6D4;
            --accent3: #22C55E;
            --ring: rgba(124,58,237,0.4);
            --shadow: 0 10px 30px rgba(0,0,0,0.6);
          }
          * { box-sizing: border-box; }
          html, body { height: 100%; }
          body {
            margin: 0;
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
            background: var(--bg);
            color: var(--text);
          }
          a { color: var(--text); text-decoration: none; }
          .glow {
            background: radial-gradient(800px 400px at 0% 0%, rgba(124,58,237,0.15), transparent 60%),
                        radial-gradient(800px 400px at 100% 0%, rgba(6,182,212,0.15), transparent 60%);
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
          }
          .card {
            background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00));
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 16px;
            box-shadow: var(--shadow);
            position: relative;
            overflow: hidden;
          }
          .card:focus-within, .card:hover { outline: 2px solid var(--ring); outline-offset: 0; }
          .btn {
            appearance: none; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
            padding: 10px 14px; background: #0f0f14; color: var(--text); cursor: pointer;
          }
          .btn:hover { border-color: rgba(255,255,255,0.25); }
          .accent { color: var(--accent); }
        `}</style>
        <div className="glow" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
