import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RichText from '../RichText';
import SubjectBreakDown from './SubjectBreakdown';
import { TOverviewForUI } from '../../backend/models/Unit/types/overview';
import { ITargetStandardsCode } from '../../backend/models/Unit/types/standards';
import { INewUnitSchema } from '../../backend/models/Unit/types/unit';

type TProps = {
  LearningSummary: TOverviewForUI['TheGist'];
  TargetSubject: TOverviewForUI['TargetSubject'];
  ForGrades: TOverviewForUI['ForGrades'];
  EstLessonTime: TOverviewForUI['EstUnitTime'];
  SteamEpaulette: TOverviewForUI['SteamEpaulette'];
  SteamEpaulette_vert: TOverviewForUI['SteamEpaulette_vert'];
  TargetStandardsCodes?: INewUnitSchema['TargetStandardsCodes'];
  isOnPreview: boolean;
  areTargetStandardsValid: boolean;
  standards: Record<string, Omit<ITargetStandardsCode, 'set'>[]>;
  className?: string;
};

const GistCard = ({
  LearningSummary,
  standards,
  TargetSubject,
  ForGrades,
  EstLessonTime,
  SteamEpaulette,
  SteamEpaulette_vert,
  isOnPreview,
  areTargetStandardsValid,
  TargetStandardsCodes,
  className,
}: TProps) => {
  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    descriptor: Omit<ITargetStandardsCode, 'set'>
  ) => {
    event.preventDefault();
    const code = (event.target as HTMLAnchorElement).href.split('#')[1];
    const el = document.getElementById(descriptor.code);

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // This centers the element vertically in the viewport
      });
      el.className += ' bounce-animation';
      setTimeout(() => {
        el.className = el.className.replace(' bounce-animation', '');
      }, 3500);
      return;
    }

    const elementDim = document.getElementById(descriptor.dim);

    if (elementDim) {
      elementDim.scrollIntoView({
        behavior: 'smooth',
        block: 'center', // This centers the element vertically in the viewport
      });
      elementDim.className += ' bounce-animation';
      setTimeout(() => {
        elementDim.className = elementDim.className.replace(
          ' bounce-animation',
          ''
        );
      }, 3500);
      return;
    }
  };

  return (
    <div className={className}>
      {LearningSummary && (
        <div className='g-col-12 bg-white p-3 rounded-3 mt-2 text-start  align-items-center'>
          <Image
            src='/imgs/gp_logo_gradient_transBG.png'
            alt='Galactic_PolyMath_First_Sec_Mobile_Info'
            style={{ objectFit: 'contain' }}
            className='d-inline-flex me-2 mb-2'
            height={30}
            width={30}
          />
          <h5 className='d-inline-flex'>The Gist:</h5>
          <div>
            <RichText content={LearningSummary} />
          </div>
        </div>
      )}
      <div className='grid mx-auto gap-3 py-3 justify-content-center justify-content-sm-start'>
        <div className='d-none d-sm-grid g-col g-col-6 g-col-sm-4 bg-white p-3 rounded-3'>
          <i className='fs-3 mb-2 d-block bi-book-half' />
          <h5 id='selectedLessonTitle'>Target Subject: </h5>
          <span>{TargetSubject}</span>
        </div>
        <div className='d-none d-sm-grid g-col g-col-6 g-col-sm-4 bg-white p-3 rounded-3'>
          <i className='fs-3 mb-2 d-block bi-person-circle'></i>
          <h5>Grades: </h5>
          <span>{ForGrades}</span>
        </div>
        <div className='d-none d-sm-grid g-col g-col-sm-4 bg-white pt-sm-3 pe-sm-4 pb-sm-3 ps-sm-2 p-md-3 rounded-3'>
          <i className='fs-3 mb-2 d-block bi-alarm'></i>
          <h5>Estimated Time: </h5>
          <span>{EstLessonTime}</span>
        </div>
        <div className='d-sm-none g-col-12 align-items-center justify-content-center'>
          <div className='d-grid bg-white rounded-3 col-12 p-3'>
            <i className='fs-3 mb-2 d-block bi-book-half'></i>
            <h5>Target Subject: </h5>
            <span>{TargetSubject}</span>
          </div>
        </div>
        <div className='d-sm-none g-col-12 align-items-center justify-content-center'>
          <div className='d-grid bg-white rounded-3 col-12 p-3'>
            <i className='fs-3 mb-2 d-block bi-person-circle'></i>
            <h5>Grades: </h5>
            <span>{ForGrades}</span>
          </div>
        </div>
        <div className='d-sm-none g-col-12 align-items-center justify-content-center'>
          <div className='d-grid bg-white rounded-3 col-12 p-3'>
            <i className='fs-3 mb-2 d-block bi-alarm'></i>
            <h5>Estimated Time: </h5>
            <span>{EstLessonTime}</span>
          </div>
        </div>
      </div>
      {TargetStandardsCodes && areTargetStandardsValid && (
        <section className='d-flex flex-column pb-2 pt-1'>
          <h5 className='text-start'>Target standards: </h5>
          {Object.entries(standards).map(([stardard, standardDescriptors]) => {
            return (
              <>
                <div className='d-flex'>
                  <div className='d-flex justify-content-center align-items-center'>
                    <h6 className='fw-bold p-0 m-0'>{stardard}</h6>
                  </div>
                  <div style={{ transform: 'translateY(-1.5px)'  }} className='d-flex justify-content-center fw-bold p-0'>|</div>
                </div>
                <ul className='row g-0 m-0 p-0 list-unstyled w-75'>
                  {standardDescriptors.map(
                    (standardDescriptor, index, self) => {
                      return (
                        <li
                          key={index}
                          className='col-auto pt-0 pb-0 pr-0 ps-2 m-0 text-start'
                          style={{ lineHeight: '1.5' }}
                        >
                          <Link
                            href={`#${standardDescriptor.dim}`}
                            onClick={(event) =>
                              handleLinkClick(event, standardDescriptor)
                            }
                            className='text-dark underline-on-hover pointer fw-normal'
                          >
                            {standardDescriptor.code}
                          </Link>
                          {index !== self.length - 1 ? ',' : ''}
                        </li>
                      );
                    }
                  )}
                </ul>
              </>
            );
          })}
        </section>
      )}
      <section className='pb-2 pt-3'>
        {SteamEpaulette &&
          SteamEpaulette_vert &&
          (isOnPreview ? (
            <SubjectBreakDown
              SteamEpaulette={SteamEpaulette}
              SteamEpaulette_vert={SteamEpaulette_vert}
            />
          ) : (
            <Link passHref href='#learning_standards'>
              <SubjectBreakDown
                SteamEpaulette={SteamEpaulette}
                SteamEpaulette_vert={SteamEpaulette_vert}
              />
            </Link>
          ))}
      </section>
    </div>
  );
};

export default GistCard;