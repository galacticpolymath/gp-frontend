/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable no-console */
/* eslint-disable quotes */
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { ModalContext } from '../../../providers/ModalProvider';
import { useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import CollapsibleLessonSection from '../../CollapsibleLessonSection';
import LessonPart from './LessonPart';
import useLessonElementInView from '../../../customHooks/useLessonElementInView';
import RichText from '../../RichText';
import Image from "next/image";
import Pill from "../../Pill";

// 'solid 2px #C0BFC1'
// d-none d-lg-block position-relative me-4
// d-flex my-3 my-lg-0 d-lg-none position-relative
const LessonTile = ({ 
  lessonTileUrl, 
  imgContainerClassNameStr, 
  imgStyle = { objectFit: 'contain' },
  imgContainerStyle = { width: 150, height: 150 },
  Pill = null,
}) => {
  return (
    <div style={imgContainerStyle} className={imgContainerClassNameStr}>
      {Pill}
      <Image
        src={lessonTileUrl}
        alt="lesson_tile"
        fill
        style={imgStyle}
        sizes="130px"
        className="img-optimize rounded w-100 h-100"
      />
    </div>
  );
};

const getLessonTile = (lessonPart, imgContainerClassNameStr, lessonTileUrl) => {
  if((lessonPart && (typeof lessonPart !== "object")) || !lessonPart || "PublicationStatus" in lessonPart){
    return null;
  }

  if(lessonPart.PublicationStatus !== "Beta"){
    return( 
      <LessonTile 
        imgStyle={{ objectFit: 'contain' }} 
        lessonTileUrl={lessonTileUrl} 
        imgContainerClassNameStr={imgContainerClassNameStr}
        Pill={<Pill zIndex={10} />} 
      />
    );
  }

  return( 
    <LessonTile 
      imgStyle={{ objectFit: 'contain', border: 'solid 2px #C0BFC1' }} 
      lessonTileUrl={lessonTileUrl} 
      imgContainerClassNameStr={imgContainerClassNameStr} 
    />
  );
};

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
  ForGrades,
}) => {
  const { _isDownloadModalInfoOn } = useContext(ModalContext);
  const [, setIsDownloadModalInfoOn] = _isDownloadModalInfoOn;
  const [numsOfLessonPartsThatAreExpanded, setNumsOfLessonPartsThatAreExpanded] = useState([]);
  const environments = ['classroom', 'remote']
    .filter(setting => Object.prototype.hasOwnProperty.call(Data, setting));
  const gradeVariations = Data[environments[0]]?.resources ? (getIsValObj(Data[environments[0]].resources) ? getObjVals(Data[environments[0]].resources) : Data[environments[0]].resources) : [];
  const [selectedGrade, setSelectedGrade] = useState(gradeVariations?.length ? gradeVariations[0] : {});
  const [selectedEnvironment, setSelectedEnvironment] = useState(environments[0]);
  const allResources = Data?.[selectedEnvironment]?.resources ? (getIsValObj(Data[selectedEnvironment].resources) ? getObjVals(Data[selectedEnvironment].resources) : Data[selectedEnvironment].resources) : [];
  const [selectedGradeResources, setSelectedGradeResources] = useState(allResources?.[0]?.links ?? []);
  let resources = allResources?.length ? allResources.find(({ gradePrefix }) => gradePrefix === selectedGrade.gradePrefix) : [];
  resources = getIsValObj(resources) ? [resources] : resources;
  const isPartsObjPresent = Data?.classroom?.resources?.[0] && (typeof Data?.classroom?.resources?.[0] === 'object');
  const partsFieldName = ((Data?.classroom?.resources?.[0] && (typeof Data?.classroom?.resources?.[0] === 'object')) && ('parts' in Data.classroom.resources[0])) ? 'parts' : 'lessons';
  const dataLesson = Data.lesson;
  let parts = isPartsObjPresent ? Data.classroom.resources[0]?.[partsFieldName] : [];

  if ((((parts !== undefined) || (parts !== null)) && (parts?.title === "Assessments")) && parts?.length) {
    const { itemList, lsn, preface, tile, title } = parts;
    parts = [...parts, { itemList, lsn, preface, tile, title }];
  }

  if ((isPartsObjPresent && (Data.classroom.resources[0]?.[partsFieldName]?.title === "Assessments")) && (typeof parts === 'object') && (parts !== null)) {
    const { itemList, lsn, preface, tile, title, ...restOfLessonParts } = parts;
    const lastPart = { itemList, lsn, preface, tile, title };
    parts = [...Object.values(restOfLessonParts), lastPart];
  }

  const ref = useRef();

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
              <div className='row mx-auto justify-content-center'>
                <div className='infobox rounded-3 p-2 fs-5 my-2 fw-light w-auto'>
                  <h3 className='fs-5'>
                    <i className="bi-alarm fs-5 me-2" />
                    {Data.lessonDur}
                  </h3>
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

        <div className='container lessonsPartContainer px-0 pe-sm-1 px-md-2 pb-4'>
          {parts.map((part, index, self) => {
            let {
              lsn,
              lsnNum,
              lsnTitle,
              partTitle,
              title,
              lsnPreface,
              partPreface,
              preface,
              chunks,
              learningObj,
              itemList,
              lessonTile,
              lsnExt,
            } = part;
            let secondTitle = null;

            // get the image tile here and pass it as component. 

            if (partsFieldName === 'lessons') {
              const { tile, title } = resources?.[0]?.[partsFieldName]?.[index] ?? {};
              lessonTile = tile;
              secondTitle = (lsnTitle === 'Procedure not documented yet') ? title : null;
            }

            const targetLessonInDataLesson = dataLesson.find(({ lsnNum }) => lsnNum == lsn);

            if (!learningObj && (lsn !== 'last') && targetLessonInDataLesson?.learningObj) {
              const { learningObj: _learningObj } = targetLessonInDataLesson;
              learningObj = _learningObj;
            }

            if (!chunks && (lsn !== 'last') && targetLessonInDataLesson) {
              const { chunks: _chunks } = targetLessonInDataLesson;
              chunks = _chunks;
            }

            if (!lsnExt && (dataLesson && (typeof dataLesson === 'object'))) {
              const { lsnExt: lsnExtBackup } = Object.values(dataLesson).find(({ lsnNum: lsnNumDataLesson }) => {
                return (lsnNumDataLesson && ((lsn == lsnNumDataLesson) || (lsnNum == lsnNumDataLesson)));
              }) ?? {};
              lsnExt = lsnExtBackup;
            }

            return (
              <LessonPart
                lessonTileForDesktop={getLessonTile(part, "d-none d-lg-block position-relative me-4", lessonTile)}
                lessonTileForMobile={getLessonTile(part, "d-flex my-3 my-lg-0 d-lg-none position-relative", lessonTile)}
                partsArr={self}
                key={`${index}_part`}
                resources={resources}
                _numsOfLessonPartsThatAreExpanded={[numsOfLessonPartsThatAreExpanded, setNumsOfLessonPartsThatAreExpanded]}
                lsnNum={lsn ?? lsnNum}
                lsnTitle={secondTitle ?? ((lsnTitle ?? partTitle) ?? title)}
                lsnPreface={(lsnPreface ?? partPreface) ?? preface}
                lsnExt={lsnExt}
                chunks={chunks}
                ForGrades={ForGrades}
                learningObjectives={learningObj}
                partsFieldName={partsFieldName}
                lessonTileUrl={lessonTile}
                itemList={itemList}
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