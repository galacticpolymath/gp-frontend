/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-console */
/* eslint-disable quotes */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AiOutlineQuestionCircle } from "react-icons/ai";
import CollapsibleLessonSection from '../../CollapsibleLessonSection';
import LessonPart from './LessonPart';
import { ModalContext } from '../../../providers/ModalProvider';
import { useContext } from 'react';
// import useLessonElementInView from '../../../customHooks/useLessonElementInView';

const getIsValObj = val => (typeof val === 'object') && !Array.isArray(val) && (val !== null);
const getObjVals = obj => {
  const keys = Object.keys(obj);
  let vals = [];

  keys.forEach(key => {
    const val = obj[key];
    vals.push(val);
  });

  return vals;
};

const TeachIt = ({
  index,
  SectionTitle,
  Data,
  _sectionDots,
}) => {
  const { _isDownloadModalInfoOn } = useContext(ModalContext);
  const [, setIsDownloadModalInfoOn] = _isDownloadModalInfoOn;
  const environments = ['classroom', 'remote']
    .filter(setting => Object.prototype.hasOwnProperty.call(Data, setting));
  console.log("Data[environments[0]]: ", Data[environments[0]]);
  const gradeVariations = getIsValObj(Data[environments[0]].resources) ? getObjVals(Data[environments[0]].resources) : Data[environments[0]].resources;
  const [selectedGrade, setSelectedGrade] = useState(gradeVariations[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environments[0]);
  const allResources = getIsValObj(Data[selectedEnvironment].resources) ? getObjVals(Data[selectedEnvironment].resources) : Data[selectedEnvironment].resources;
  // GOAL #1: on the first render, show the text for the first grade variation
  // create state called selectedGrade. This state will hold the first object in allResources as its defatul value.
  const [selectedGradeResources, setSelectedGradeResources] = useState(allResources?.[0]?.links);

  // GOAL #2: when the user clicks on a different grade variation, show the text for that grade variation
  let resources = allResources.find(({ gradePrefix }) => gradePrefix === selectedGrade.gradePrefix);
  resources = getIsValObj(resources) ? [resources] : resources;

  const handleIconClick = () => {
    setIsDownloadModalInfoOn(true);
  };

  const handleOnChange = selectedGrade => {
    setSelectedGradeResources(selectedGrade.links);
    setSelectedGrade(selectedGrade);
  };

  useEffect(() => {
    console.log('allResources: ', allResources);
    console.log('allResources: ', allResources);
  });

  /* col-12 col-xl-8 offset-xl-2 */
  return (
    <CollapsibleLessonSection
      index={index}
      SectionTitle={SectionTitle}
      highlighted
      initiallyExpanded
      _sectionDots={_sectionDots}
    >
      <div>
        <div className='container-fluid mt-4'>
          <div className='row'>
            <div className='col-12 bg-light-gray py-3 p-3 align-items-center'>
              <div className='fs-5 mb-2'>
                <i className="bi-alarm fs-4 me-2"></i>
                {Data.lessonDur}
              </div>
              <p className='mb-0'>{Data.lessonPreface}</p>
            </div>
          </div>
        </div>
        <div className="container row mx-auto py-4">
          <div className="col w-1/2">
            <h3>Available Grade Bands</h3>
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
                  onChange={() => handleOnChange(variation)}
                />
                {variation.grades}
              </label>
            ))}
          </div>
          <div className="col w-1/2">
            <h3>Available Teaching Environments</h3>
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

        {selectedGradeResources && (
          <div style={{ height: 'fit-content' }} className='d-flex justify-content-center align-items-center mt-3 mb-3'>
            <div className='position-relative'>
              <a
                target='_blank'
                rel='noopener noreferrer'
                href={selectedGradeResources.url}
                className='btn btn-primary px-3 py-2 d-inline-block mb-3'
              >
                <div className='d-flex align-items-center gap-2'>
                  <i className="bi-cloud-arrow-down-fill fs-3 lh-1"></i>{' '}
                  {selectedGradeResources.linkText}
                </div>
              </a>
              <AiOutlineQuestionCircle
                className="downloadTipIcon position-absolute"
                style={{ fontSize: "20px", width: 'fit-content', top: -10 }}
                onClick={handleIconClick}
              />
            </div>
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
      </div>
    </CollapsibleLessonSection>
  );
};

TeachIt.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  Data: PropTypes.object,
};

export default TeachIt;