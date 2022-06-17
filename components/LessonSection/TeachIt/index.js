import CollapsibleLessonSection from '../../CollapsibleLessonSection';

const TeachIt = ({
  index,
  SectionTitle,
  Data: {
    classroom,
    remote,
  },
}) => {
  return (
    <CollapsibleLessonSection
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded
    >
      <div className='container mx-auto mt-4'>
        <div className='bg-light-gray p-3'>
          <h6>TODO: time estimate</h6>
          <p className='mb-0'>TODO: lesson desc</p>
        </div>
      </div>
      <div className="container row mx-auto py-4">
        <div className="col w-1/2">
          <h4>Available Grade Bands</h4>
          TODO: inputs
        </div>
        <div className="col w-1/2">
          <h4>Available Teaching Environments</h4>
          TODO: inputs
        </div>
      </div>
    </CollapsibleLessonSection>
  );
};

export default TeachIt;