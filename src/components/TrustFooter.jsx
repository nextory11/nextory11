import { TRUST_LINKS } from "../data/trustContent.js";

export default function TrustFooter({ compact = false }) {
  return (
    <footer className={`trustFooter${compact ? " trustFooter--compact" : ""}`}>
      <nav className="trustFooter__nav" aria-label="法務・サポート">
        {TRUST_LINKS.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
      </nav>
      <p>© 2026 NEXTORY11 / Super Hiros. All rights reserved.</p>
    </footer>
  );
}

