import React, { RefObject } from 'react';
import jobVizDataObj from '../../../data/Jobviz/jobVizDataObj.json';
import { toast } from 'react-toastify';
import { SUPPORT_EMAIL } from '../../../shared/constants';
import {
  ISelectedJob,
  useModalContext,
} from '../../../providers/ModalProvider';

interface IJobToursCard {
  ref?: RefObject<HTMLElement | null>;
  jobTitleAndSocCodePairs: [string, string][];
  unitName: string;
  onJobTitleTxtCick?: () => void,
}

const JobToursCard: React.FC<IJobToursCard> = ({
  ref,
  jobTitleAndSocCodePairs,
  unitName,
  onJobTitleTxtCick,
}) => {
  const {
    _selectedJob: [, setSelectedJob],
  } = useModalContext();
  const handleJobTitleTxtClick = (socCode: string) => () => {
    if (onJobTitleTxtCick){
      onJobTitleTxtCick();
    }

    const targetJob = jobVizDataObj.data.find(
      (job) => job.soc_code === socCode
    ) as ISelectedJob | undefined;

    if (!targetJob) {
      toast.error(
        <>
          <div
            style={{
              fontSize: '15px',
              lineHeight: '1.6',
              fontWeight: '500',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '20px' }}>🔍</span>
              <strong>Oops! Job Data Not Found</strong>
            </div>
            <p
              style={{
                margin: '0 0 10px 28px',
                color: '#555',
                fontWeight: '400',
              }}
            >
              We couldn&apos;t locate the information for this job selection.
            </p>
            <div
              style={{
                marginLeft: '28px',
                padding: '10px 12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                borderLeft: '3px solid #1976d2',
              }}
            >
              <span style={{ color: '#666', fontSize: '14px' }}>
                Think this is an error?{' '}
                <a
                  href={SUPPORT_EMAIL}
                  style={{
                    color: '#1976d2',
                    textDecoration: 'none',
                    fontWeight: '600',
                    borderBottom: '2px solid #1976d2',
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact our support team
                </a>{' '}
                and we&apos;ll help you out!
              </span>
            </div>
          </div>
        </>,
        {
          position: 'top-center',
          autoClose: 8000,
          closeOnClick: true,
          pauseOnHover: true,
          style: {
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }
      );
      return;
    }

    setSelectedJob(targetJob);
  };

  return (
    <section
      ref={ref}
      id="job-tours-section"
      className="container py-5"
    >
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-4">
            Jobs and careers related to the &ldquo;{unitName}&rdquo; unit:
          </h3>
          <ul
            className="mb-4 d-none d-sm-block"
            style={{ columnCount: 2, columnGap: '1.3rem' }}
          >
            {jobTitleAndSocCodePairs.map(([jobTitle, socCode], index) => {
              return (
                <li
                  onClick={handleJobTitleTxtClick(socCode)}
                  key={index}
                  className="underline-on-hover"
                >
                  {jobTitle}
                </li>
              );
            })}
          </ul>
          <ul className="mb-4 d-block d-sm-none">
            {jobTitleAndSocCodePairs.map(([jobTitle, socCode], index) => {
              return (
                <li
                  onClick={handleJobTitleTxtClick(socCode)}
                  key={index}
                  className="underline-on-hover"
                >
                  {jobTitle}
                </li>
              );
            })}
          </ul>
          <div className="d-flex align-items-start">
            <div className="me-3 mt-1" style={{ fontSize: '2rem' }}>
              ✏️
            </div>
            <div>
              <p className="mb-2">
                <strong>Assignment:</strong> Research these jobs and explain{' '}
                <em>with data</em> which you would be most or least interested
                in.
              </p>
              <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                Your teacher will provide instructions on how to share your
                response.
              </p>
              <div
                className="alert alert-info py-2 px-3 mb-0"
                role="alert"
                style={{ fontSize: '0.85rem' }}
              >
                ℹ️ <strong>Note:</strong> This feature is currently being built
                and will be available soon.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobToursCard;
