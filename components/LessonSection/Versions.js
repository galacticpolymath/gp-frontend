import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';

const Versions = ({
  SectionTitle,
  Data = [],
  _sectionDots,
  isAvailLocsMoreThan1,
}) => {
  return Data && (
    <CollapsibleLessonSection
      accordionId={SectionTitle}
      SectionTitle={SectionTitle}
      _sectionDots={_sectionDots}
      isAvailLocsMoreThan1={isAvailLocsMoreThan1}
    >
      <div id='versions' className='container mx-auto my-4'>
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