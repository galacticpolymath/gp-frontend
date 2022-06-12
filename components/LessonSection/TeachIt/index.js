import CollapsibleLessonSection from '../../CollapsibleLessonSection';

const TeachIt = ({
  index,
  SectionTitle,
  Data: {
    classroom,
    remote,
  },
}) => {
  <CollapsibleLessonSection
    index={index}
    SectionTitle={SectionTitle}
    initiallyExpanded
  >
    {/* TODO: blurb already in lesson data? */}
    <div className="container row mx-auto">
      <div className="w-1/2">
        <h3>Available Grade Bands</h3>
        TODO: inputs
      </div>
      <div className="w-1/2">
        <h3>Available Teaching Environments</h3>
        TODO: inputs
      </div>
    </div>
  </CollapsibleLessonSection>;
};

export default TeachIt;