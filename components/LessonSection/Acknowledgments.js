import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';

const Acknowledgments = ({
  SectionTitle,
  Data = [],
  _sectionDots,  
  isAvailLocsMoreThan1,
}) => {
  return Data && (
    <CollapsibleLessonSection
      SectionTitle={`${SectionTitle}`}
      initiallyExpanded
      accordionId={SectionTitle}
      _sectionDots={_sectionDots}
      isAvailLocsMoreThan1={isAvailLocsMoreThan1}
    >
      <div className='container mx-auto my-4'>
        {Data.map(({ role, def, records = [] }, i) => (
          <div key={i} className='mb-3'>
            <h4>{role}</h4>
            <RichText content={def} />
            {records.map(({ name, url, title, affiliation, location }) => (
              <div key={name}>
                <h5 className='mt-3 fw-normal fs-5'>
                  <a
                    href={url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {name}
                  </a>
                </h5>
                <h6 className='fs-6'>{title}</h6>
                {affiliation && <div>{affiliation}</div>}
                <div>{location}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </CollapsibleLessonSection>
  );
};

export default Acknowledgments;