import React, { Fragment, useEffect } from 'react';
import Layout from '../components/Layout';
// import { useParams } from "react-router-dom";
// import { renderMetaTags } from "utils/meta";

// import SiteHeader from "components/Header/Header.js";
// import HeaderLinks from "components/Header/HeaderLinks.js";

// import Section from "./Section/index";
import Header from './Header';
import { NUMBERED_SECTIONS } from './constants';

import './[id].module.scss';

// import NavigationDots from "./NavigationDots";
// import useScrollHandler from './NavigationDots/useScrollHandler'

const LessonPlan = ({ lesson }) => {
  // useScrollHandler()

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  //   document.body.scrollTop = 0;
  // });

  // const { lessonId } = useParams();

  // if (!lessons) return null;
  // const lesson = lessons.find(({ id }) => id.toString() === lessonId.toString()) // object of objs
  if (!lesson) {
    return null;
  }
  const sections = lesson.Section;

  let numberedElements = 0;

  // count the sections listed in numbered_sections. to send as index. 
  // function takes a section object with flat properties
  // returns a section component to render
  const renderSection = (section, i) => {
    if (NUMBERED_SECTIONS.indexOf(section.__component) !== -1) {
      numberedElements++;
    }
    // console.log(numberedElements, section);

    // return <Section key={i} index={numberedElements} section={section} />;
  };

  return (
    <Layout>
      <div className='LessonPlan'>
        {/* {renderMetaTags({
        title: lesson.Title,
        description: lesson.Subtitle,
        image: lesson.CoverImage.url,
        url: `https://galacticpolymath.com/lessons/${lessonId}`
      })} */}

        {/* <SiteHeader
        links={<HeaderLinks dropdownHoverColor="info" />}
        fixed
        color="dark"
      /> */}

        <Header {...lesson} />

        {sections &&
          Object.keys(sections).map((sectionkey, i) => renderSection(sections[sectionkey], i)
          )}

        {/* <NavigationDots sections={lesson.Section} /> */}
      </div>
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

export default LessonPlan;