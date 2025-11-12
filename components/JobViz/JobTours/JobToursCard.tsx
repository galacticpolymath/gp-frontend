import React, { RefObject, useState } from "react";
import jobVizDataObj from "../../../data/Jobviz/jobVizDataObj.json";
import { toast } from "react-toastify";
import { SUPPORT_EMAIL } from "../../../shared/constants";
import {
  ISelectedJob,
  useModalContext,
} from "../../../providers/ModalProvider";
import { getPathsOfSearchResult } from "../../../helperFns/getPathsOfSearchResult";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useLessonContext } from "../../../providers/LessonProvider";
import { JobToursCardWithRocket } from "../Heros/HeroForGpPlusUsers";

export interface IJobToursCard {
  ref?: RefObject<HTMLElement | null>;
  jobTitleAndSocCodePairs: [string, string][];
  unitName?: string;
  onJobTitleTxtCick?: () => void;
}

export const showJobNotFoundToast = () => {
  toast.error(
    <>
      <div
        style={{
          fontSize: "15px",
          lineHeight: "1.6",
          fontWeight: "500",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "20px" }}>🔍</span>
          <strong>Oops! Job Data Not Found</strong>
        </div>
        <p
          style={{
            margin: "0 0 10px 28px",
            color: "#555",
            fontWeight: "400",
          }}
        >
          We couldn&apos;t locate the information for this job selection.
        </p>
        <div
          style={{
            marginLeft: "28px",
            padding: "10px 12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            borderLeft: "3px solid #1976d2",
          }}
        >
          <span style={{ color: "#666", fontSize: "14px" }}>
            Think this is an error?{" "}
            <a
              href={SUPPORT_EMAIL}
              style={{
                color: "#1976d2",
                textDecoration: "none",
                fontWeight: "600",
                borderBottom: "2px solid #1976d2",
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact our support team
            </a>{" "}
            and we&apos;ll help you out!
          </span>
        </div>
      </div>
    </>,
    {
      position: "top-center",
      autoClose: 8000,
      closeOnClick: true,
      pauseOnHover: true,
      style: {
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      },
    }
  );
};

export const useCreateHandleJobTitleTxtClick = (
  onJobTitleTxtCick?: () => void,
  onJobModalShow?: () => void
) => {
  const {
    _selectedJob: [, setSelectedJob],
  } = useModalContext();

  const handleJobTitleTxtClick = (socCode: string) => async () => {
    if (onJobTitleTxtCick) {
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
              fontSize: "15px",
              lineHeight: "1.6",
              fontWeight: "500",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "20px" }}>🔍</span>
              <strong>Oops! Job Data Not Found</strong>
            </div>
            <p
              style={{
                margin: "0 0 10px 28px",
                color: "#555",
                fontWeight: "400",
              }}
            >
              We couldn&apos;t locate the information for this job selection.
            </p>
            <div
              style={{
                marginLeft: "28px",
                padding: "10px 12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                borderLeft: "3px solid #1976d2",
              }}
            >
              <span style={{ color: "#666", fontSize: "14px" }}>
                Think this is an error?{" "}
                <a
                  href={SUPPORT_EMAIL}
                  style={{
                    color: "#1976d2",
                    textDecoration: "none",
                    fontWeight: "600",
                    borderBottom: "2px solid #1976d2",
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact our support team
                </a>{" "}
                and we&apos;ll help you out!
              </span>
            </div>
          </div>
        </>,
        {
          position: "top-center",
          autoClose: 8000,
          closeOnClick: true,
          pauseOnHover: true,
          style: {
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        }
      );
      return;
    }

    setSelectedJob(targetJob);

    if (onJobModalShow) {
      onJobModalShow();
    }
  };

  return handleJobTitleTxtClick;
};

export const createSelectedJobVizJobLink = (job: ISelectedJob) => {
  const paths = getPathsOfSearchResult(job);

  if (!paths) {
    return null;
  }

  return `${window.location.origin}/jobviz${paths}`;
};

interface IJobTitle {
  handleJobTitleBtnClick: () => void;
  jobTitle: string;
}

const JobTitle: React.FC<IJobTitle> = ({
  handleJobTitleBtnClick,
  jobTitle,
}) => {
  const [wasClicked, setWasClicked] = useState(false);

  return (
    <li
      onClick={() => {
        setWasClicked(true);
        handleJobTitleBtnClick();
      }}
      style={{
        width: "fit-content",
        maxWidth: "400px",
        color: wasClicked ? "#00008B" : "#3d8dc8",
        textDecoration: wasClicked ? "underline" : "none",
      }}
      className="text-primary li-dot-black"
    >
      <span
        style={{
          color: wasClicked ? "#00008B" : "#3d8dc8",
          textDecoration: wasClicked ? "underline" : "none",
        }}
        className="underline-on-hover"
      >
        {jobTitle}
      </span>
    </li>
  );
};

export const JobToursCardTopSticky: React.FC = () => {
  const {
    _isJobToursStickyTopCardDisplayed: [isJobToursStickTopCardDisplayed],
    _willRenderJobToursStickyTopCard: [willRenderJobToursStickyTopCard],
  } = useLessonContext();

  return willRenderJobToursStickyTopCard ? (
    <>
      <JobToursCardWithRocket
        cardClassName="assignment-card-on-top w-100 p-4 shadow-lg bg-white position-relative text-start overflow-hidden"
        jobTitleAndSocCodePairs={[]}
        className={`d-none d-sm-block ${
          isJobToursStickTopCardDisplayed
            ? "animate-slideup"
            : "animate-slidedown"
        } position-relative`}
        style={{
          width: "100vw",
        }}
        willTrackViewportLocation={false}
      />
      <JobToursCardWithRocket
        cardClassName="assignment-card-on-top w-100 p-4 shadow-lg bg-white position-relative text-start overflow-hidden"
        jobTitleAndSocCodePairs={[]}
        className={`d-block d-sm-none ${
          isJobToursStickTopCardDisplayed
            ? "animate-slideup"
            : "animate-slidedown"
        } position-relative`}
        style={{
          width: "100vw",
        }}
        willTrackViewportLocation={false}
        useInViewThreshold={0}
      />
    </>
  ) : null;
};

const JobToursCard: React.FC<IJobToursCard> = ({
  ref,
  jobTitleAndSocCodePairs,
  unitName,
  onJobTitleTxtCick,
}) => {
  const {
    _selectedJob: [, setSelectedJob],
  } = useModalContext();
  const pathname = usePathname();
  const router = useRouter();

  console.log("pathname: ", pathname);
  console.log("router: ", router);

  const searchParams = useSearchParams();
  const handleJobTitleTxtClick = (socCode: string) => () => {
    if (onJobTitleTxtCick) {
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
              fontSize: "15px",
              lineHeight: "1.6",
              fontWeight: "500",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "20px" }}>🔍</span>
              <strong>Oops! Job Data Not Found</strong>
            </div>
            <p
              style={{
                margin: "0 0 10px 28px",
                color: "#555",
                fontWeight: "400",
              }}
            >
              We couldn&apos;t locate the information for this job selection.
            </p>
            <div
              style={{
                marginLeft: "28px",
                padding: "10px 12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                borderLeft: "3px solid #1976d2",
              }}
            >
              <span style={{ color: "#666", fontSize: "14px" }}>
                Think this is an error?{" "}
                <a
                  href={SUPPORT_EMAIL}
                  style={{
                    color: "#1976d2",
                    textDecoration: "none",
                    fontWeight: "600",
                    borderBottom: "2px solid #1976d2",
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact our support team
                </a>{" "}
                and we&apos;ll help you out!
              </span>
            </div>
          </div>
        </>,
        {
          position: "top-center",
          autoClose: 8000,
          closeOnClick: true,
          pauseOnHover: true,
          style: {
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        }
      );
      return;
    }

    // if the user on the job viz page, then present the modal to the user

    if (pathname.includes("jobviz")) {
      const paths = getPathsOfSearchResult(targetJob);
      const searchParamsStr = searchParams.toString();
      const url = `${window.location.origin}/jobviz${paths}?${searchParamsStr}`;

      console.log("Navigating to JobViz URL: ", url);

      router.push(url, url, { scroll: false });

      // console.log('jobs path: ', paths);
    }

    setSelectedJob(targetJob);
  };

  if (pathname.includes("jobviz") && jobTitleAndSocCodePairs?.length) {
    console.log("Inside jobviz page, showing job tours modal");
    return (
      <>
        <ul
          className="d-none d-sm-block"
          style={{ columnCount: 2, columnGap: ".8rem" }}
        >
          {jobTitleAndSocCodePairs.map(([jobTitle, socCode], index) => {
            return (
              <JobTitle
                key={index}
                handleJobTitleBtnClick={handleJobTitleTxtClick(socCode)}
                jobTitle={jobTitle}
              />
            );
          })}
        </ul>
        <ul className="mb-4 d-block d-sm-none">
          {jobTitleAndSocCodePairs.map(([jobTitle, socCode], index) => {
            return (
              <JobTitle
                key={index}
                handleJobTitleBtnClick={handleJobTitleTxtClick(socCode)}
                jobTitle={jobTitle}
              />
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <section ref={ref} id="job-tours-section" className="container py-5">
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-4">
            Jobs and careers related to the &ldquo;{unitName}&rdquo; unit:
          </h3>
          {/* track if this card goes out of view */}
          <div className="d-flex align-items-start mb-4">
            <div className="me-3 mt-1" style={{ fontSize: "2rem" }}>
              ✏️
            </div>
            <div>
              <p className="mb-2">
                <strong>Assignment:</strong> Research these jobs and explain{" "}
                <em>with data</em> which you would be most or least interested
                in.
              </p>
              <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                Your teacher will provide instructions on how to share your
                response.
              </p>
              <div
                className="alert alert-info py-2 px-3 mb-0"
                role="alert"
                style={{ fontSize: "0.85rem" }}
              >
                ℹ️ <strong>Note:</strong> This feature is currently being built
                and will be available soon.
              </div>
            </div>
          </div>
          <ul
            className="d-none d-sm-block"
            style={{ columnCount: 2, columnGap: "1.3rem" }}
          >
            {jobTitleAndSocCodePairs.map(([jobTitle, socCode], index) => {
              return (
                <JobTitle
                  key={index}
                  handleJobTitleBtnClick={handleJobTitleTxtClick(socCode)}
                  jobTitle={jobTitle}
                />
              );
            })}
          </ul>
          <ul className="mb-4 d-block d-sm-none">
            {jobTitleAndSocCodePairs.map(([jobTitle, socCode], index) => {
              return (
                <JobTitle
                  key={index}
                  handleJobTitleBtnClick={handleJobTitleTxtClick(socCode)}
                  jobTitle={jobTitle}
                />
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default JobToursCard;
