import { useState } from 'react';
import PropTypes from 'prop-types';

import CollapsibleLessonSection from '../../CollapsibleLessonSection';
import LessonPart from './LessonPart';

const TeachIt = ({
  index,
  SectionTitle,
  Data,
}) => {
  const environments = [ 'classroom', 'remote']
    .filter(setting => Object.prototype.hasOwnProperty.call(Data, setting));
  const gradeVariations = Data[environments[0]].resources;

  const [selectedGrade, setSelectedGrade] = useState(gradeVariations[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environments[0]);

  const resources = Data[selectedEnvironment].resources
    .find(({ gradePrefix }) => gradePrefix === selectedGrade.gradePrefix);

  return (
    <CollapsibleLessonSection
      index={index}
      SectionTitle={SectionTitle}
      highlighted
      initiallyExpanded
    >
      <>
        <div className='container mx-auto mt-4'>
          <div className='bg-light-gray p-3 mx-5 d-flex flex-column gap-3 flex-md-row align-items-center w-75 mx-auto'>
            <div className='d-flex flex-column text-nowrap text-center fs-5'>
              <i className="bi-alarm fs-2"></i>{' '}
              {Data.lessonDur}
            </div>
            <p className='mb-0'>{Data.lessonPreface}</p>
          </div>
        </div>
        
        <div className="container row mx-auto py-4">
          <div className="col w-1/2">
            <h4>Available Grade Bands</h4>
            {gradeVariations.map((variation, i) => (
              <label 
                key={i}
                className='text-capitalize d-block mb-1'
              >
                <input
                  className='form-check-input me-2'
                  type="radio"
                  name="gradeVariation"
                  id={variation.grades}
                  value={variation.grades}
                  checked={variation.grades === selectedGrade.grades}
                  onChange={() => setSelectedGrade(variation)}
                />
                {variation.grades}
              </label>
            ))}
          </div>
          <div className="col w-1/2">
            <h4>Available Teaching Environments</h4>
            {environments.map(env => (
              <label
                className='text-capitalize d-block mb-1'
                key={env}
              >
                <input
                  className='form-check-input me-2'
                  type="radio"
                  name="environment"
                  id={env}
                  value={env}
                  checked={env === selectedEnvironment}
                  onChange={() => setSelectedEnvironment(env)}
                />
                {env}
              </label>
            ))}
          </div>
        </div>

        {resources.links && (
          <div className='text-center'>
            <a
              target='_blank'
              rel='noopener noreferrer'
              href={resources.links.url}
              className='btn btn-primary px-3 py-2 d-inline-block mb-3'
            >
              <div className='d-flex align-items-center gap-2'>
                <i className="bi-cloud-arrow-down-fill fs-3 lh-1"></i>{' '}
                {resources.links.linkText}
              </div>
            </a>
          </div>
        )}

        <div className='container pb-4'>
          {Data.parts.map(part => (
            <LessonPart
              key={part.partNum}
              resources={resources}
              {...part}
            />
          ))}
        </div>
      </>
    </CollapsibleLessonSection>
  );
};

TeachIt.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  Data: PropTypes.object,
};

export default TeachIt;