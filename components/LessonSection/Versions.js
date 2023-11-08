import { useState } from 'react';
import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';

const Versions = ({
  SectionTitle,
  Data = [],
  _sectionDots,
  isAvailLocsMoreThan1,
  isInitiallyExpanded = true
}) => {
  
  return Data && (
    <CollapsibleLessonSection
      accordionId="versions"
      SectionTitle={SectionTitle}
      _sectionDots={_sectionDots}
      isAvailLocsMoreThan1={isAvailLocsMoreThan1}
      initiallyExpanded={isInitiallyExpanded}
      scrollToTranslateVal='translateY(-90px)'
    >
      <div id='versions-container' className='container mx-auto my-4'>
        {Data.map(({ major_release, sub_releases = [] }, i) => (
          <div key={i}>
            <h4>Major Release {major_release}</h4>
            {sub_releases.map(
              ({ version, date, summary, notes, acknowledgments }) => (
                <div key={version}>
                  <h6>{version} {summary}</h6>
                  <p className="text-muted">{date}</p>
                  {notes && <RichText content={notes} />}
                  {acknowledgments && (
                    <div>
                      <h6>Acknowledgments</h6>
                      <RichText content={acknowledgments} />
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </CollapsibleLessonSection>
  );
};

export default Versions;