import { format } from 'date-fns';
import { useMemo } from 'react';
import RichText from '../RichText';
import Image from 'next/image';
import { useRouter } from 'next/router';
import LocDropdown from '../LocDropdown';
import ShareWidget from '../AboutPgComps/ShareWidget';

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
  SponsoredBy = '',
  lessonTitle,
  versions,
  lessonBannerUrl,
  sponsorLogoImgUrl,
  lessonUrl,
}) => {
  const router = useRouter();
  let sponsors = useMemo(() => {
    let sponsorsLinkTxts = [];

    if (SponsoredBy) {
      let urls = SponsoredBy.match(/\((.*?)\)/g);
      urls = urls.length ? urls.map(txt => txt.replace(/\(|\)/g, '')) : urls;
      let sponsorByTxtArr = SponsoredBy.match(/\[(.*?)\]/g);
      sponsorByTxtArr = sponsorByTxtArr.length ? sponsorByTxtArr.map(txt => txt.replace(/\[|\]/g, '')) : sponsorByTxtArr;

      for (let index = 0; index < sponsorByTxtArr.length; index++) {
        let url = urls[index];

        if (!url) {
          continue;
        }

        let sponsorByTxt = sponsorByTxtArr[index];

        sponsorsLinkTxts.push(`[${sponsorByTxt}](${url})`);
      }
    }

    return sponsorsLinkTxts;
  }, []);

  const handleBtnClick = () => {
    if (!document.getElementById('versions-container')?.offsetParent) {
      const headingVersionsElement = document.getElementById('heading_versions');
      headingVersionsElement.querySelector('button').click();
    }

    window.location.href = `${window.location.origin}/lessons/${router.query.loc}/${router.query.id}#version-notes`;
  };

  const lastSubRelease = useMemo(() => getLatestSubRelease(versions), []);

  return (
    <div className="container pt-4">
      <div id="lessonTitleSecId" className="d-flex justify-content-center align-items-center d-xxl-block">
        <div className="col-12 d-flex flex-column">
          <div className="mt-3 mt-sm-0 d-flex justify-content-between">
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
          <div className="d-flex flex-column flex-xxl-row">
            <div className="col-xxl-9">
              <div>
                <h1 id="lessonTitleId" className="mt-2 fs-2 fs-md-larger mb-1">{lessonTitle}</h1>
                <h4 className='fw-light fs-6 fs-md-med mb-2'>{Subtitle}</h4>
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
              </div>
            </div>
            <div className='d-flex d-md-none'>
              <label className='d-flex justify-content-center align-items-center'>Share: </label>
              {process.env.NODE_ENV === 'production'
                ? (
                  <ShareWidget
                    pinterestMedia={lessonBannerUrl}
                    widgetParentCss='share-widget d-flex d-md-none flex-row bg-transparent'
                  />
                )
                : (
                  <ShareWidget
                    developmentUrl={`${lessonUrl}/`}
                    pinterestMedia={lessonBannerUrl}
                    shareWidgetStyle={{ maxWidth: '300px' }}
                    widgetParentCss='share-widget d-flex my-2 d-md-none flex-row gap-2 ps-1 w-100 bg-transparent'
                  />
                )}
            </div>
            <div className='ms-xxl-3 mb-4 mb-md-3 mb-lg-0 mt-4 mt-md-0 col-xxl-3 row my-0 py-0 d-xxl-flex flex-xxl-column-reverse justify-content-xxl-center align-items-xxl-center'>
              <div className="col-12 col-sm-8 col-md-8 col-lg-9 col-xxl-12 d-grid align-content-center d-xxl-flex flex-xxl-column p-0">
                <h5 className='text-xxl-center'>Sponsored by:</h5>
                <ul className='d-xxl-flex justify-content-xxl-center align-items-xxl-center m-xxl-0 p-xxl-0'>
                  {!!sponsors?.length && (
                    sponsors.map((sponsor, index) => (
                      <li key={index}>
                        <RichText
                          content={sponsor}
                        />
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="col-5 col-sm-4  col-md-3 col-lg-3 col-xxl-12 m-auto d-grid m-xxl-0">
                {sponsorLogoImgUrl && (
                  <div className='d-sm-block d-xxl-flex justify-content-center align-items-center'>
                    <img
                      src={Array.isArray(sponsorLogoImgUrl) ? sponsorLogoImgUrl[0] : sponsorLogoImgUrl}
                      alt={Subtitle}
                      className='p-lg-4 sponsor-img'
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Title;