/* eslint-disable no-console */
/* eslint-disable quotes */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AiOutlineQuestionCircle } from "react-icons/ai";
import CollapsibleLessonSection from '../../CollapsibleLessonSection';
import LessonPart from './LessonPart';
import { ModalContext } from '../../../providers/ModalProvider';
import { useContext } from 'react';

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
  const [isDownloadModalInfoOn, setIsDownloadModalInfoOn] = _isDownloadModalInfoOn;
  const environments = ['classroom', 'remote']
    .filter(setting => Object.prototype.hasOwnProperty.call(Data, setting));
  const gradeVariations = getIsValObj(Data[environments[0]].resources) ? getObjVals(Data[environments[0]].resources) : Data[environments[0]].resources;
  const [selectedGrade, setSelectedGrade] = useState(gradeVariations[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environments[0]);
  const allResources = getIsValObj(Data[selectedEnvironment].resources) ? getObjVals(Data[selectedEnvironment].resources) : Data[selectedEnvironment].resources;
  let resources = allResources.find(({ gradePrefix }) => gradePrefix === selectedGrade.gradePrefix);

  resources = getIsValObj(resources) ? [resources] : resources;
  
  const handleIconClick = () => {
    console.log("clicked");
    setIsDownloadModalInfoOn(true);
    console.log("isDownloadModalInfoOn: ", isDownloadModalInfoOn);
  };

  useEffect(() => {
    console.log("Data.parts: ", Data.parts);
  });

  return (
    <CollapsibleLessonSection
      index={index}
      SectionTitle={SectionTitle}
      highlighted
      initiallyExpanded
      _sectionDots={_sectionDots}
    >
      <>
        <div className='container row mx-auto mt-4'>
          <div className='col-12 col-xl-8 offset-xl-2 bg-light-gray p-3 row align-items-center gap-3 gap-lg-0'>
            <div className='fs-5 mb-2'>
              <i className="bi-alarm fs-4 me-2"></i>
              {Data.lessonDur}
            </div>
            <p className='mb-0'>{Data.lessonPreface}</p>
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
                  onChange={() => setSelectedGrade(variation)}
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

        {resources.links && (
          <div className='text-center d-flex'>
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
            <AiOutlineQuestionCircle
              className="ms-2 downloadTipIcon"
              style={{ fontSize: "20px" }}
              onClick={handleIconClick}
            />
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