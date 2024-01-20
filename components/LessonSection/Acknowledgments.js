import CollapsibleLessonSection from '../CollapsibleLessonSection';
import RichText from '../RichText';

let name;
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
            <h6 className='fw-bolder'>{role}</h6>
            <RichText className=' text-black-87' content={def} />
            {name && records.map(({ name, url, title, affiliation, location }) => (
              <ul key={name}>
                <li className='mt-3 fw-normal inline-block'>
                  <a
                    href={url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {name}&nbsp;
                  </a>
                  |&nbsp;{title}
                  {affiliation && <span className='pe-1'>, {affiliation} </span>}
                  <span className='d-inline-block'><i className="bi bi-geo-alt" /><em>{location}</em></span>
                </li>
              </ul>
            ))}
          </div>
        ))}
      </div>
    </CollapsibleLessonSection>
  );
};

export default Acknowledgments;