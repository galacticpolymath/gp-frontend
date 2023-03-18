import PropTypes from 'prop-types';
// accordion-header lessonsPgSec
// bg-primary-light w-100 text-left

const Heading = ({ index, SectionTitle }) => {
  return (
    <div className='lessonsStandardsSec text-left bg-primary-light'>
      <h2
        className="SectionHeading mb-0"
        id={SectionTitle.replace(/\s+/g, '_').toLowerCase()}
      >
        <div className='container mx-auto text-black d-flex justify-content-between align-items-center py-3'>
          {index && `${index}. `}{SectionTitle}
        </div>
      </h2>
    </div>
  );
};

Heading.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
};

export default Heading;