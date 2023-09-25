/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-console */
/* eslint-disable quotes */
import PropTypes from 'prop-types';
import { AiOutlineQuestionCircle } from "react-icons/ai";
import CollapsibleLessonSection from '../../CollapsibleLessonSection';
import LessonPart from './LessonPart';
import { ModalContext } from '../../../providers/ModalProvider';
import { useContext, useState, useRef } from 'react';
import useLessonElementInView from '../../../customHooks/useLessonElementInView';
import RichText from '../../RichText';

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
  const [numsOfLessonPartsThatAreExpanded, setNumsOfLessonPartsThatAreExpanded] = useState([])
  const environments = ['classroom', 'remote']
    .filter(setting => Object.prototype.hasOwnProperty.call(Data, setting));
  const gradeVariations = getIsValObj(Data[environments[0]].resources) ? getObjVals(Data[environments[0]].resources) : Data[environments[0]].resources;
  const [selectedGrade, setSelectedGrade] = useState(gradeVariations[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environments[0]);
  const allResources = getIsValObj(Data[selectedEnvironment].resources) ? getObjVals(Data[selectedEnvironment].resources) : Data[selectedEnvironment].resources;
  const [selectedGradeResources, setSelectedGradeResources] = useState(allResources?.[0]?.links);
  let resources = allResources.find(({ gradePrefix }) => gradePrefix === selectedGrade.gradePrefix);
  resources = getIsValObj(resources) ? [resources] : resources;
  // getting assessments part 
  const partsFieldName = ('parts' in Data.classroom.resources[0]) ? 'parts' : 'lessons';
  const dataPartsFieldName = ('parts' in Data) ? 'parts' : 'lesson'
  let { title, itemList } = Data.classroom.resources[0]?.[partsFieldName] ?? {};
  const assessmentPart = (title === 'Assessments') ? { chunks: itemList, partTitle: title } : null;
  let parts = assessmentPart ? [...Data?.[dataPartsFieldName], assessmentPart] : Data[dataPartsFieldName];
  parts = parts.map((part, index) => ({ ...part, partNum: index + 1 }))
  const ref = useRef();

  console.log('parts: ', parts)
  // console.log('resources hey there: ', resources);

  useLessonElementInView(_sectionDots, SectionTitle, ref);

  const handleIconClick = () => {
    setIsDownloadModalInfoOn(true);
  };

  const handleOnChange = selectedGrade => {
    setSelectedGradeResources(selectedGrade.links);
    setSelectedGrade(selectedGrade);
  };


  return (
    <CollapsibleLessonSection
      index={index}
      SectionTitle={SectionTitle}
      highlighted
      initiallyExpanded
      _sectionDots={_sectionDots}
    >
      <div ref={ref}>
        <div className='container-fluid mt-4'>
          {Data.lessonDur && (
            <div className='row'>
              <div className='row mx-auto pb-4 justify-content-center'>
                <div className='infobox rounded-3 p-2 p-sm-4 fs-5 my-4 p-3 fw-light w-auto'>
                  <h2 className='fw-light d-flex align-items-center'>
                    <i className="bi-alarm fs-4 me-2" />
                    {Data.lessonDur}
                  </h2>
                  {Data.lessonPreface && <RichText content={Data.lessonPreface} className='d-flex justify-content-center quickPrep' />}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="container row mx-auto py-4">
          <div className="col w-1/2">
            <h3 className='fs-5'>Available Grade Bands</h3>
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
            <h3 className='fs-5'>Available Teaching Environments</h3>
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
          <div className='d-flex container justify-content-center mb-5 mt-0 col-md-12 col-lg-11'>
            <div className="row flex-nowrap align-items-center justify-content-center col-md-8 position-relative">
              <a
                target='_blank'
                rel='noopener noreferrer'
                href={selectedGradeResources.url}
                className='btn btn-primary px-3 py-2 col-8 col-md-12'
              >
                <div className='d-flex flex-column flex-md-row align-items-md-center justify-content-center gap-2 '>
                  <div className='d-flex justify-content-center align-items-center'>
                    <i className="bi-cloud-arrow-down-fill fs-3 lh-1"></i>{' '}
                  </div>
                  <span style={{ lineHeight: "23px" }} className="d-none d-sm-inline">{selectedGradeResources.linkText}</span>
                  <span style={{ lineHeight: "17px", fontSize: "14px" }} className="d-inline d-sm-none">{selectedGradeResources.linkText}</span>
                </div>
              </a>
              <div style={{ width: "2rem" }} className='p-0 ms-1 mt-0 d-flex justify-content-center align-items-center'>
                <AiOutlineQuestionCircle
                  className="downloadTipIcon"
                  onClick={handleIconClick}
                />
              </div>
            </div>
          </div>
        )}

        <div className='container ps-0 pe-1 px-md-2  pb-4'>
          {parts.map((part, index) => {
            console.log('part yo there: ', part)
            // BUG: 
            // WHAT IS HAPPENING:
            // the object that is being retrieved does not have the lesson tile url
            // if the array that contains all of the objects is coming from an array that has that is the updated version of the lesson, then get the lessons from the updated version
            // if new lessons updated, then get the updated version of the lessons from resources
            
            // GOAL: check if the lessons sections are the updated version of the lessons
            let {
              lsnNum,
              partNum,
              lsnTitle,
              partTitle,
              lsnPreface,
              partPreface,
              chunks,
              learningObj,
              lessonTile
            } = part;

            if(partsFieldName === 'lessons'){
              const { title, tile } = resources[0][partsFieldName][index];
              lsnTitle = title;
              lessonTile = tile;
            }

            console.log('part: ', part)

            return (
              <LessonPart
                key={`${index}_part`}
                resources={resources}
                _numsOfLessonPartsThatAreExpanded={[numsOfLessonPartsThatAreExpanded, setNumsOfLessonPartsThatAreExpanded]}
                lsnNum={lsnNum ?? partNum}
                lsnTitle={lsnTitle ?? partTitle}
                lsnPreface={lsnPreface ?? partPreface}
                chunks={chunks}
                learningObj={learningObj}
                partsFieldName={partsFieldName}
                lessonTileUrl={lessonTile}
              />
            );
          })}
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