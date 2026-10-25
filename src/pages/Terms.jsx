import LegalPage, { Section } from '../components/LegalPage.jsx';
import { Link } from 'react-router-dom';
import { SITE_NAME, SUPPORT_EMAIL, LEGAL_UPDATED } from '../lib/siteInfo.js';

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated={LEGAL_UPDATED}>
      <Section heading="Using the site">
        <p>By using {SITE_NAME}, you agree to these terms. If you don't agree, please don't use the site.</p>
      </Section>

      <Section heading="What we are">
        <p>
          {SITE_NAME} is a movie and TV recommendation and information site. We do not host, stream or sell movies or
          episodes. Information may be incomplete or out of date, and where a title can be watched can change.
        </p>
      </Section>

      <Section heading="Content and ownership">
        <p>
          Titles, posters, images and trailers belong to their owners. Movie and TV data comes from TMDB. This website
          uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB. Our own text,
          design and logo belong to {SITE_NAME}, so please don't copy them without permission.
        </p>
      </Section>

      <Section heading="What you send us">
        <p>
          If you submit a recommendation, you allow us to show it on the site. Please don't send anything unlawful,
          offensive or misleading, spam, links, or other people's personal information. We may edit or remove any
          submission at any time.
        </p>
      </Section>

      <Section heading="Acceptable use">
        <p>
          Don't try to break into the site, overload it, or use automated tools to spam it or copy it in ways that
          harm it.
        </p>
      </Section>

      <Section heading="Third-party links and services">
        <p>
          The site may link to or embed other services, such as trailers on YouTube. We don't control them and aren't
          responsible for their content or policies.
        </p>
      </Section>

      <Section heading="No guarantees">
        <p>
          The site is provided "as is". We don't promise it will always be available or error-free, and to the extent
          the law allows, we aren't liable for losses from using it.
        </p>
      </Section>

      <Section heading="Copyright complaints">
        <p>
          If you believe something on the site infringes your copyright, see our{' '}
          <Link to="/dmca" className="text-violet-bright">DMCA page</Link>.
        </p>
      </Section>

      <Section heading="Changes and contact">
        <p>
          We may update these terms, and the date at the top shows the latest change. Questions? Email{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-violet-bright">{SUPPORT_EMAIL}</a>.
        </p>
      </Section>
    </LegalPage>
  );
}
