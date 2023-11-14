import { format } from 'date-fns';
import { useMemo } from 'react';
import RichText from '../RichText';
import Image from 'next/image';
import { useRouter } from 'next/router';
import LocDropdown from '../LocDropdown';

const getLatestSubRelease = versions => {
  if (!versions || !Array.isArray(versions)) {
    return null;
  }

  const lastRelease = versions.at(-1).sub_releases;
  const lastSubRelease = lastRelease.at(-1);

  return lastSubRelease;
};

const Title = ({
  availLocs,
  locale,
  numID,
  Subtitle,
  SponsoredBy,
  lessonTitle,
  versions,
  lessonBannerUrl,
  sponsorLogoImgUrl,
}) => {
  const router = useRouter();

  const handleBtnClick = () => {
    if (!document.getElementById('versions-container')?.offsetParent) {
      const headingVersionsElement = document.getElementById('heading_versions');
      headingVersionsElement.querySelector('button').click();
    }

    // change the verions notes section id, delete the number nine
    window.location.href = `${window.location.origin}/lessons/${router.query.loc}/${router.query.id}#9._version_notes`;
  };

  const lastSubRelease = useMemo(() => getLatestSubRelease(versions), []);

  return (
    <div className="container d-flex justify-content-center pt- pb-4 px-0">
      <div id="lessonTitleSecId" className="d-flex justify-content-center align-items-center SectionHeading lessonTitleId">
        <div className="col-12">
          <div className="d-flex justify-content-between">
            {lastSubRelease && (
              <button
                onClick={handleBtnClick}
                className='underline-on-hover no-btn-styles d-flex'
                style={{ color: 'black' }}
              >
                <span className='fw-lighter justify-items-left'>
                  Version {lastSubRelease.version}{' '}
                  (Updated {format(new Date(lastSubRelease.date), 'MMM d, yyyy')})
                </span>
              </button>
            )}
            {availLocs && (
              <LocDropdown
                availLocs={availLocs}
                loc={locale}
                id={numID}
              />
            )}
          </div>
          <h1 id="lessonTitleId" className="mt-2 fs-3 fs-md-larger mb-1">{lessonTitle}</h1>
          <h4 className='fw-light fs-6'>{Subtitle}</h4>
          {lessonBannerUrl && (
            <div className='w-100 position-relative my-2 mx-0'>
              <Image
                src={lessonBannerUrl}
                alt={Subtitle}
                width={1500}
                height={450}
                priority
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}
          <div className='row mt-4 d-flex flex-column flex-sm-row align-content-center'>
            <div className="col-12 col-sm-8 col-md-8 col-lg-9 d-grid">
              <h5>Sponsored by:</h5>
              <RichText content={SponsoredBy} />
            </div>
            <div className="col-6 col-sm-1 col-md-4 col-lg-3 m-auto d-grid">
              {sponsorLogoImgUrl && (
                <div style={{ height: '180px' }} className='position-relative sponsorImgContainer d-sm-block d-flex justify-content-center align-items-center w-100'>
                  <Image
                    src={Array.isArray(sponsorLogoImgUrl) ? sponsorLogoImgUrl[0] : sponsorLogoImgUrl}
                    alt={Subtitle}
                    className='sponsorImg'
                    sizes="225px"
                    fill
                    style={{ width: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Title;