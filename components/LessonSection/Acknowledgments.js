import CollapsibleLessonSection from '../CollapsibleLessonSection';

const Acknowledgments = ({
  index,
  SectionTitle,
  Data = [],  
}) => {
  return Data && (
    <CollapsibleLessonSection
      SectionTitle={`${index}. ${SectionTitle}`}
      initiallyExpanded
      accordionId={SectionTitle}
    >
      <div className='container mx-auto my-4'>
        {Data.map(({ role, def, records = [] }, i) => (
          <div className="role" key={i}>
            <h4>{role}</h4>
            <p>{def}</p>
            {records.map(({ name, url, title, affiliation, location }) => (
              <div className="record" key={name}>
                <h5 className='mt-3'>
                  <a
                    href={url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {name}
                  </a>
                </h5>
                <h6>{title}</h6>
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