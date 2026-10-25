import LegalPage, { Section } from '../components/LegalPage.jsx';
import { SITE_NAME, SUPPORT_EMAIL, LEGAL_UPDATED } from '../lib/siteInfo.js';

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated={LEGAL_UPDATED}>
      <Section heading="Who we are">
        <p>
          {SITE_NAME} is a movie and TV recommendation website. You can reach us at{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-violet-bright">{SUPPORT_EMAIL}</a>.
        </p>
      </Section>

      <Section heading="What we collect">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Recommendations you send.</strong> If you submit a recommendation, we store the name you enter
            (optional) and your message. It only appears on the site after we approve it, so please don't include
            personal details.
          </li>
          <li>
            <strong>Messages to us.</strong> If you contact us by email, WhatsApp or our contact form (once it is
            available), we keep your message and contact details only to reply to you.
          </li>
          <li>
            <strong>Technical logs.</strong> Our hosting and database providers may record your IP address, browser
            type and the pages you request as part of normal operation and security.
          </li>
        </ul>
        <p>We don't ask visitors to create accounts, and we never collect payment details.</p>
      </Section>

      <Section heading="Third-party services">
        <ul className="list-disc pl-5 space-y-1">
          <li>Our website is hosted by Vercel, and our database and image storage are provided by Supabase.</li>
          <li>
            Movie information, posters and cast photos come from TMDB. Your browser loads these images directly from
            TMDB's servers, so TMDB can see your IP address and device information.
          </li>
          <li>
            Trailers are played through YouTube or Vimeo. When you press play, those services may set their own cookies.
          </li>
        </ul>
        <p>These providers have their own privacy policies.</p>
      </Section>

      <Section heading="Cookies and local storage">
        <p>
          We don't use cookies to track visitors. The admin area, which is for the site owner only, saves a login
          session in the browser. The third-party services above may set their own cookies.
        </p>
      </Section>

      <Section heading="Ads and analytics">
        <p>
          We do not currently show advertising or run analytics tools. If that changes, we will update this page first
          and ask for your consent where the law requires it.
        </p>
      </Section>

      <Section heading="How long we keep information">
        <p>
          Approved recommendations stay on the site until we remove them. Messages are kept only as long as needed to
          reply. You can ask us to delete anything you sent us.
        </p>
      </Section>

      <Section heading="Children">
        <p>
          {SITE_NAME} is not aimed at children under 13, and we do not knowingly collect personal information from them.
        </p>
      </Section>

      <Section heading="Your choices">
        <p>
          To see, correct or delete information you sent us, email{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-violet-bright">{SUPPORT_EMAIL}</a>.
        </p>
      </Section>

      <Section heading="Changes to this policy">
        <p>We may update this policy as the site grows. The date at the top shows when it last changed.</p>
      </Section>
    </LegalPage>
  );
}
