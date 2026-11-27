import { Link } from 'react-router-dom';
import LegalPage, { Section } from '../components/LegalPage.jsx';
import { SITE_NAME, SUPPORT_EMAIL, LEGAL_UPDATED } from '../lib/siteInfo.js';

export default function HowItWorks() {
  return (
    <LegalPage title="How it works" updated={LEGAL_UPDATED}>
      <Section heading="What we do">
        <p>
          {SITE_NAME} helps you decide what to watch. We pick movies and TV shows, show their details, trailers, cast
          and critic scores, and tell you where you can legally watch them.
        </p>
      </Section>

      <Section heading="Where the information comes from">
        <p>
          Titles, posters, cast and streaming availability come from TMDB. Streaming data is provided by JustWatch.
          IMDb, Rotten Tomatoes and Metacritic scores come from OMDb. Trailers are embedded from YouTube or Vimeo.
        </p>
      </Section>

      <Section heading="How we choose recommendations">
        <p>
          Recommendations are picked by people, not paid for. A title is never placed higher because someone paid us.
        </p>
      </Section>

      <Section heading="No videos here">
        <p>
          We do not host, stream or sell movie files. The Where to Watch box links you to the official services that
          carry a title in your country.
        </p>
      </Section>

      <Section heading="Ads and links">
        <p>
          If we ever show ads or use affiliate links (links that pay us a small commission), we will label them clearly.
          They will never change what we recommend.
        </p>
      </Section>

      <Section heading="Questions or suggestions">
        <p>
          Email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-violet-bright">{SUPPORT_EMAIL}</a>, use the{' '}
          <Link to="/contact" className="text-violet-bright">contact page</Link>, or{' '}
          <Link to="/recommend" className="text-violet-bright">recommend a movie</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
