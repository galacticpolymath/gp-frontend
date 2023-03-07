import { format } from 'date-fns';

import Layout from '../../../components/Layout';
import RichText from '../../../components/RichText';
import LessonSection, { NUMBERED_SECTIONS } from '../../../components/LessonSection';
import LocDropdown from '../../../components/LocDropdown';

const getLatestSubRelease = (sections) => {
  const versionSection = sections.versions;
  if (!versionSection) {
    return null;
  }
  
  const lastRelease =
    versionSection.Data[versionSection.Data.length - 1].sub_releases;
  const lastSubRelease = lastRelease[lastRelease.length - 1];
  return lastSubRelease;
};

const LessonDetails = ({ lesson, availLocs }) => {
  const lastSubRelease = getLatestSubRelease(lesson.Section);

  // Number the sections included in NUMBERED_SECTIONS.
  let numberedElements = 0;
  const renderSection = (section, i) => {
    if (NUMBERED_SECTIONS.includes(section.__component)) {
      numberedElements++;
    }
    return (
      <LessonSection
        key={i}
        index={numberedElements}
        section={section}
      />
    );
  };

  return (
    <Layout>
      <div className="container p-4">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {lastSubRelease && (
            <p>
              Version {lastSubRelease.version}{' '}
              (Updated {format(new Date(lastSubRelease.date), 'MMM d, yyyy')})
            </p>
          )}
          <LocDropdown
            availLocs={availLocs}
            loc={lesson.locale}
            id={lesson.id}
          />
        </div>
        <h1>{lesson.Title}</h1>
        <h4 className='fw-light'>{lesson.Subtitle}</h4>
        {lesson.CoverImage && lesson.CoverImage.url && (
          <img
            src={lesson.CoverImage.url}
            alt={lesson.Subtitle}
          />
        )}
        <div className='row mt-4'>
          <div className="col col-md-6 col-lg-9">
            <h5>Sponsored by:</h5>
            <RichText content={lesson.SponsoredBy} />
          </div>
          <div className="col col-md-6 col-lg-3 position-relative">
            {lesson.SponsorImage && lesson.SponsorImage.url && (
              <img
                src={Array.isArray(lesson.SponsorImage.url) ? lesson.SponsorImage.url[0] : lesson.SponsorImage.url}
                alt={lesson.Subtitle}
              />
            )}
          </div>
        </div>
      </div>

      {Object.values(lesson.Section).map(renderSection)}
    </Layout>
  );
};

export const getStaticPaths = async () => {
  const res = await fetch('https://catalog.galacticpolymath.com/index.json');
  const lessons = await res.json();
  const paths = lessons.map(lesson => ({
    params: { id: `${lesson.id}`, loc: `${lesson.locale}` },
  }));

  return { paths, fallback: false };
};

export const getStaticProps = async ({ params: { id, loc } }) => {
  const res = await fetch('https://catalog.galacticpolymath.com/index.json');
  const lessons = await res.json();
  const lesson = lessons.find((lesson) => `${lesson.id}` === `${id}` && `${lesson.locale}` === loc);
  const availLocs = lessons.filter((lesson) => `${lesson.id}` === `${id}`).map((lesson)=>lesson.locale);

  // TODO: revisit when/if Matt combines these sections in the JSON
  lesson.Section['teaching-materials'].Data = {
    ...lesson.Section.procedure.Data,
    ...lesson.Section['teaching-materials'].Data,
  };
  
  return { props: { lesson, availLocs } };
};

export default LessonDetails;