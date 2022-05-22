import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
// import { makeStyles } from "@material-ui/core/styles";
// import AnchorLink from "react-anchor-link-smooth-scroll";

// import GridContainer from "components/Grid/GridContainer";
// import GridItem from "components/Grid/GridItem";
// import Image from "../../components/StrapiImage";
import RichText from '../components/RichText';
//import { SECTIONS } from "./constants";
import ShareTools from './ShareTools';
import Link from 'next/link';
import Image from 'next/image';


const getLatestSubRelease = (sections) => {
  const versionSection = sections.versions;
  const lastRelease =
    versionSection.Data[versionSection.Data.length - 1].sub_releases;
  const lastSubRelease = lastRelease[lastRelease.length - 1];
  return lastSubRelease;
};

const Header = ({
  location,
  Title,
  Subtitle,
  SponsoredBy,
  CoverImage,
  SponsorImage,
  Section,
}) => {
  const lastSubRelease = getLatestSubRelease(Section);

  // temporary code until we decide how multiple sponsor images should be displayed
  if (Array.isArray(SponsorImage.url)){
    SponsorImage.url = SponsorImage.url[0];
  }

  return (
    <div className="Header">
      <div className="container row mx-auto">
        {/* SectionHeading Div used for nav dots */}
        <div
          className="SectionHeading"
          id="Title"
          style={{ padding: 0, margin: 0 }}
        >
          {/* Dots nav text; not displayed on page */}
          <span style={{ display: 'none' }}>Title</span>
        </div>
        {lastSubRelease && (
          <Link passHref href="#version_notes">
            <a>
              <p>
                Version {lastSubRelease.version} (Updated{' '}
                {format(new Date(lastSubRelease.date),'MMM d, yyyy')})
              </p>
            </a>
          </Link>
        )}
        <h2>{Title}</h2>
        <h4>{Subtitle}</h4>

        <ShareTools location={location} lessonTitle={Title} />

        <div className='container mx-auto row text-center'>
          <div className="col">
            <Image 
              alt="Subtitle"
              layout="responsive"
              // TODO: will these always be the same size?
              width={1500}
              height={450}
              src={CoverImage.url}
            />
          </div>
        </div>

        <div className='container mx-auto row sponsor'>
          <div className='col-12 col-sm-9 sponsorDescr'>
            <h5>Sponsored by:</h5>
            <RichText content={SponsoredBy} />
          </div>
          <div className='col-12 col-sm-3 sponsorLogo'>
            <Image
              width={1}
              height={1}
              layout="responsive"
              alt={SponsoredBy}
              src={SponsorImage.url}
            />

          </div>
        </div>
      </div>
    </div>
  );
};

Header.propTypes = {
  Title: PropTypes.string,
  Subtitle: PropTypes.string,
  SponsoredBy: PropTypes.string,
  CoverImage: PropTypes.object,
  SponsorImage: PropTypes.object,
};

export default Header;
