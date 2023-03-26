/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
import { format } from 'date-fns';

import Layout from '../../../components/Layout';
import RichText from '../../../components/RichText';
import LessonSection, { NUMBERED_SECTIONS } from '../../../components/LessonSection';
import LocDropdown from '../../../components/LocDropdown';
import { useEffect, useState } from 'react';

const getLatestSubRelease = (sections) => {
  const versionSection = sections.versions;
  if (!versionSection) {
    return null;
  }

  const lastRelease = versionSection.Data[versionSection.Data.length - 1].sub_releases;
  const lastSubRelease = lastRelease[lastRelease.length - 1];
  return lastSubRelease;
};

const LessonDetails = ({ lesson, availLocs }) => {
  const lastSubRelease = getLatestSubRelease(lesson.Section);
  const _sections = Object.values(lesson.Section)
  const [sections, setSections] = useState([{ sectionId: 'title', isInView: true }, ..._sections.slice(1, _sections.length)])

  useEffect(() => {
    console.log("sections: ", sections)
  })

  // BRAIN DUMP:
  // if the section is view, then have the section's specific dot turn blue 
  // create an array of all of the dots that represents each section
  // if the user is at a specific section, then have its corresponding dot turn blue 
  // create an array, for each value of the array it will be an object. The object will have the following fields:
  // 1. the section's name
  // 2. isVisible: boolean

  // map this array onto the dom, if the user clicks on a dot, then scroll to the corresponding section

  // GOAL #1: have the dots be clickable, when clicked, scroll to the corresponding section
  // GOAL #2: have the dot turn blue when the user is at the corresponding section when scrolling down the page
  // GOAL #3: display the dots onto the ui 
  // GOAL #4: get all of the sections that are viewable placed them into the sections array state

  // Number the sections included in NUMBERED_SECTIONS.
  let numberedElements = 0;
  const renderSection = (section, index) => {
    if (NUMBERED_SECTIONS.includes(section.__component)) {
      numberedElements++;
    }

    return (
      <LessonSection
        key={index}
        index={numberedElements}
        section={section}
      />
    );
  };

  console.log("lesson.Section: ", lesson.Section)

  // if the user is on a lessons page where current locale only has one option, then don't show the dropdown menu for locale

  /* p-4 */
  return (
    <Layout>
      {/* selectedLessonPg */}
      <div className="container d-flex justify-content-center pt-4 pb-4">
        <div className="col-11 col-sm-12 col-md-10 col-lg-8">
          <div style={{ display: 'flex', justifyContent: 'space-between' }} className="flex-column flex-sm-row">
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
          <h1 className="mt-4">{lesson.Title}</h1>
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
      </div>
      <div className="container d-flex justify-content-center selectedLessonPg pt-4 pb-4">
        <div className="col-12 col-sm-12 col-md-10 col-lg-8 p-0">
          {_sections.map(renderSection)}
        </div>
      </div>
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
  const availLocs = lessons.filter((lesson) => `${lesson.id}` === `${id}`).map((lesson) => lesson.locale);

  lesson.Section['teaching-materials'].Data = {
    ...lesson.Section.procedure.Data,
    ...lesson.Section['teaching-materials'].Data,
  };

  return { props: { lesson, availLocs } };
};

export default LessonDetails;