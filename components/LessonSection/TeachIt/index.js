import { useState } from 'react';
import Accordion from '../../Accordion';
import CollapsibleLessonSection from '../../CollapsibleLessonSection';

const TeachIt = ({
  index,
  SectionTitle,
  Data,
}) => {
  const environments = Object.keys(Data);
  const gradeVariations = Object.values(Data)[0].resources;

  const [selectedGrade, setSelectedGrade] = useState(gradeVariations[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environments[0]);

  const selectedResources = Data[selectedEnvironment].resources
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
          <div className='bg-light-gray p-3'>
            <h6>TODO: time estimate</h6>
            <p className='mb-0'>TODO</p>
          </div>
        </div>
        
        <div className="container row mx-auto py-4">
          <div className="col w-1/2">
            <h5>Available Grade Bands</h5>
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
            <h5>Available Teaching Environments</h5>
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

        <div className='container mx-auto'>
          {selectedResources.links && (
            <a href={selectedResources.links.url} className='d-block mb-3'>
              [TODO: dl icon] {selectedResources.links.linkText}
            </a>
          )}

          {selectedResources.parts
            .map(part => (
              <Accordion
                buttonClassName='w-100 text-start'
                key={part.part}
                id={`teachit_env_${part.part}`}
                button={(
                  <div>
                    <h6>Part {part.part}: {part.title}</h6>
                    <div>{part.preface}</div>
                  </div>
                )}
              >
                <ol className='mt-3'>
                  {part.itemList.map(item => (
                    <li key={item.itemTitle} className='mb-2'>
                      <strong>{item.itemTitle}</strong>
                      <ul>
                        {item.links.map(link => (
                          <li key={link.url}>
                            <a href={link.url}>
                              {link.linkText}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </Accordion>
            ))
          }
        </div>
      </>
    </CollapsibleLessonSection>
  );
};

export default TeachIt;