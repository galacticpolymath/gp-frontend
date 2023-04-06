/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-console */
/* eslint-disable quotes */
import { useState } from 'react';
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
  const gradeVariations = getIsValObj(Data[environments[0]].resources) ? getObjVals(Data[environments[0]].resources) : Data[environments[0]].resources;
  const [selectedGrade, setSelectedGrade] = useState(gradeVariations[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environments[0]);
  const allResources = getIsValObj(Data[selectedEnvironment].resources) ? getObjVals(Data[selectedEnvironment].resources) : Data[selectedEnvironment].resources;
  const [selectedGradeResources, setSelectedGradeResources] = useState(allResources?.[0]?.links);
  let resources = allResources.find(({ gradePrefix }) => gradePrefix === selectedGrade.gradePrefix);
  resources = getIsValObj(resources) ? [resources] : resources;
  let assessmentPart = Data.classroom.resources[0].parts[Data?.classroom?.resources[0]?.parts?.length - 1];
  assessmentPart = (assessmentPart?.title === 'Assessments') ? { chunks: assessmentPart.itemList, partTitle: assessmentPart.title } : null;
  const parts = assessmentPart ? [...Data.parts, assessmentPart] : Data.parts;

  const handleIconClick = () => {
    setIsDownloadModalInfoOn(true);
  };

  const handleOnChange = selectedGrade => {
    setSelectedGradeResources(selectedGrade.links);
    setSelectedGrade(selectedGrade);
  };

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
          <div className='d-flex container justify-content-center mb-5 mt-0 col-11'>
            <div className=" row flex-nowrap  align-items-center col-md-8">

              <a
                target='_blank'
                rel='noopener noreferrer'
                href={selectedGradeResources.url}
                className='btn btn-primary px-3 py-2 '
              >
                <div className='d-flex flex-md-row align-items-md-center justify-content-center gap-2 '>
                  <i className="bi-cloud-arrow-down-fill fs-3 lh-1"></i>{' '}
                  <span style={{ lineHeight: "23px" }} className="d-none d-sm-inline">{selectedGradeResources.linkText}</span>
                  <span style={{ lineHeight: "17px", fontSize: "14px" }} className="d-inline d-sm-none">{selectedGradeResources.linkText}</span>
                </div>
              </a>
              <div className=' '>
                <AiOutlineQuestionCircle
                  className="downloadTipIcon position-absolute "
                  style={{ fontSize: "1.75rem" }}
                  onClick={handleIconClick}

                />
              </div>

            </div>
          </div>
        )}

        <div className='container pb-4'>
          {parts.map((part, index) => (
            <LessonPart
              key={`${index}_part`}
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