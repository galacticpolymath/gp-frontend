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
        {Data.map(({ role, def = '', records = [] }, i) => (
          <div key={i} className='mb-3'>
            <h6 className='fw-bolder ack-role-testing'>{role}</h6>
            <RichText className='text-black-87' content={def} />
            {!!records.length && records.map(({ name, url, title, affiliation, location }) =>
              name && (
                <ul key={name}>
                  <li className='mt-1 fw-normal inline-block'>
                    <a
                      href={url}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="ack-name-testing"
                    >
                      {name}&nbsp;
                    </a>
                    |&nbsp;{title}
                    {affiliation && <span className='pe-1 ack-affiliation-testing'>, {affiliation} </span>}
                    <span className='d-inline-block'><i className="bi bi-geo-alt" /><span className='ack-location-testing'><em>{location}</em></span></span>
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