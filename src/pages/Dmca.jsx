import LegalPage, { Section } from '../components/LegalPage.jsx';
import { SITE_NAME, SUPPORT_EMAIL, LEGAL_UPDATED } from '../lib/siteInfo.js';

export default function Dmca() {
  return (
    <LegalPage title="DMCA and Copyright" updated={LEGAL_UPDATED}>
      <Section heading="Our approach">
        <p>
          {SITE_NAME} respects copyright. We do not host or stream movie or TV video files. Posters and descriptions
          come from TMDB, and trailers are embedded from YouTube or Vimeo.
        </p>
      </Section>

      <Section heading="Reporting a problem">
        <p>
          If you are a copyright owner, or act for one, and believe something on our site infringes your rights, email{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-violet-bright">{SUPPORT_EMAIL}</a> and include:
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>A description of the work you say was copied.</li>
          <li>The exact page address (URL) on our site where it appears.</li>
          <li>Your name, email address and phone number.</li>
          <li>A statement that you believe in good faith that the use isn't authorised by the owner or the law.</li>
          <li>
            A statement that the information in your notice is accurate, and that you are the owner or authorised to
            act for the owner.
          </li>
          <li>Your signature (typing your full name is fine).</li>
        </ol>
      </Section>

      <Section heading="What we do">
        <p>
          We review each complete notice and remove or disable access to material that infringes, usually within a few
          days. Please send only genuine claims, because knowingly false claims can have legal consequences.
        </p>
      </Section>
    </LegalPage>
  );
}
