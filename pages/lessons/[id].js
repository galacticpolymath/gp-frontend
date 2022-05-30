import Image from 'next/image';
import { format } from 'date-fns';

import Layout from '../components/Layout';
import RichText from '../components/RichText';

import LessonSection from './LessonSection';

export const SECTIONS = {
  OVERVIEW: 'lesson-plan.overview',
  HEADING: 'lesson-plan.section-heading',
  TEXT_BLOCK: 'lesson-plan.text-block',
  PROCEDURE: 'lesson-plan.procedure',
  TEACHING_RESOURCES: 'teaching-resources.teaching-resources',
  LEARNING_CHART: 'lesson-plan.learning-chart',
  STANDARDS: 'lesson-plan.standards',
  ACKNOWLEDGMENTS: 'lesson-plan.acknowledgments',
  VERSIONS: 'lesson-plan.versions',
  COLLAPSIBLE_TEXT: 'lesson-plan.collapsible-text-section',
  PREVIEW: 'lesson-plan.lesson-preview',
};

const NUMBERED_SECTIONS = [
  SECTIONS.OVERVIEW,
  SECTIONS.HEADING,
  SECTIONS.TEACHING_RESOURCES,
  SECTIONS.PROCEDURE,
  SECTIONS.ACKNOWLEDGMENTS,
  SECTIONS.VERSIONS,
  SECTIONS.COLLAPSIBLE_TEXT,
  SECTIONS.PREVIEW,
];

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

const LessonDetails = ({ lesson }) => {
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
      <div className="bg-light-gray p-4">
        <div className="container">
          <p>
            Version {lastSubRelease.version}{' '}
            (Updated {format(new Date(lastSubRelease.date), 'MMM d, yyyy')})
          </p>
          <h1>{lesson.Title}</h1>
          <h4 className='fw-light'>{lesson.Subtitle}</h4>
          <Image
            src={lesson.CoverImage.url}
            alt={lesson.Subtitle}
            layout="responsive"
            // TODO: will these always be the same size?
            width={1500}
            height={450}
          />
          <div className='row mt-4'>
            <div className="col col-md-6 col-lg-9">
              <h5>Sponsored by:</h5>
              <RichText content={lesson.SponsoredBy} />
            </div>
            <div className="col col-md-6 col-lg-3">
              <Image
                src={lesson.SponsorImage.url}
                alt={lesson.Subtitle}
                layout="responsive"
                width={1}
                height={1}
              />
            </div>
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
    params: { id: `${lesson.id}` },
  }));

  return { paths, fallback: false };
};

export const getStaticProps = async ({ params: { id } }) => {
  const res = await fetch('https://catalog.galacticpolymath.com/index.json');
  const lessons = await res.json();
  const lesson = lessons.find((lesson) => `${lesson.id}` === `${id}`);
  
  return { props: { lesson } };
};

export default LessonDetails;