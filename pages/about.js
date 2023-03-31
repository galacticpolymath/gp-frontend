/* eslint-disable react/jsx-indent-props */
import Hero from '../components/Hero';
import Layout from '../components/Layout';
// import HeroImage from '../assets/img/city_network.jpg';
import styles from './index.module.css';
import TeamMemberCard from '../components/TeamMemberCard';
import productTeam from '../data/AboutPg/productTeam.json';
import devTeam from '../data/AboutPg/devTeam.json';
import alumni from '../data/AboutPg/alumni.json';
import Image from 'next/image';
import Link from 'next/link';

const MATT_LINKS =
  [
    { link: 'https://www.mattwilkinsbio.com/', icon: 'bi bi-globe' },
    { link: 'https://github.com/drwilkins', icon: 'bi bi-github' },
    { link: 'https://www.linkedin.com/in/mattwilkinsphd/', icon: 'bi bi-linkedin' },
    { link: 'https://twitter.com/mattwilkinsbio', icon: 'bi bi-twitter' },
    { link: 'https://scholar.google.com/citations?user=MZKGDvAAAAAJ&hl=en', imgSrc: '/imgs/about/google_scholar.png' },
  ];

const AboutPage = () => (
  <Layout>
    <Hero 
      imgSrc='/imgs/about/about_hero.png'
      isImgToTheSide
      className='about-hero d-flex pt-4 pb-4 pt-md-0 pb-md-0 flex-column-reverse flex-md-row-reverse'
      isStylesHereOn={false}
      // imgSrc={HeroImage.src}
    >
      <h1 className={styles.shadow}>About GP</h1>
      <p className={styles.shadow}>Galactic Polymath (GP) is an education studio. We help scientists, nonprofits, and sustainable companies achieve outreach at scale by translating complex, cutting-edge research into mind-blowing lessons for grades 5+.</p>
    </Hero>

    <div className="bg-light-gray p-3 p-md-4 p-lg-5">
      <div className='bg-white rounded container mx-auto align-items-center gap-3'>
        <div className='text-center p-5 pb-3'>
          <h2>Easier Outreach, Better Results</h2>
          <p className='mt-4 fs-4 fw-light'>We do the heavy lifting, creating and disseminating mind-expanding lessons that engage young learners in the knowledge areas our clients care about.</p>
        </div>

        <div className='row p-3 p-md-4 p-lg-5'>
          <div className='col-12 col-lg-4'>
            <h5>1. Design</h5>
            <p>In just a few short meetings, we define clients&apos; outreach goals and map out the lessons and supporting media that will achieve lasting understanding in target areas.</p>
          </div>
          <div className='col-12 col-lg-4'>
            <h5>2. Publish</h5>
            <p>We create and publish lessons on our site and do the hard work of getting them out to teachers through a growing network of educators, districts, and professional organizations.</p>
          </div>
          <div className='col-12 col-lg-4'>
            <h5>3. Revise &amp; Report</h5>
            <p>We measure and maximize outreach performance—as we hear back from teachers, we improve the lessons, and collect impact data, which we report back to clients upon request.</p>
          </div>
        </div>

        <div className='pb-4 px-5 text-center'>
          <p className='fs-4 fw-bold'>Learn how we can level up your outreach in
            <Link
              style={{ color: 'skyblue' }}
              className='underline-on-hover mx-1'
              href='/hire-us'
            >
              HIRE US
            </Link>
            .
          </p>
        </div>
      </div>
    </div>

    <div className='bg-primary-light'>
      <div className='container mx-auto py-5 row align-items-center flex-wrap flex-lg-nowrap white-divider-lg'>
        <h3 className='col fs-1 fw-light text-nowrap flex-grow-0 pb-3 pb-lg-0 pe-lg-4'>Our Mission</h3>
        <p className='m-0 col-auto flex-shrink-1 fs-3 fw-light ps-lg-4 pt-3 pt-lg-0'>To create a direct pipeline between the sources of knowledge and grade 5-12 classrooms by translating complex topics from researchers, non-profits, and sustainable corporations, into high-quality, open-access educational materials.</p>
      </div>
    </div>

    <div className='container mx-auto py-5 row'>
      <div className='col-12 col-lg-6 mb-2 mb-sm-4 mb-lg-0 d-flex justify-content-center align-items-center'>
        <div className="position-relative ourVisionImgContainer">
          <Image
            fill
            alt="Our_Vision_Galactic_Polymath"
            style={{ objectFit: 'contain', maxHeight: '100%', minHeight: '100%' }}
            className="w-100 h-100"
            sizes="(max-width: 575px) 521px, (max-width: 767px) 486px, (max-width: 991px) 594.594px, (max-width: 1199px) "
            src="/imgs/about/our_vision.jpeg"
          />
        </div>
      </div>
      <div className='col-12 col-lg-6 mt-3 mt-sm-2'>
        <h3 className='fw-light text-center text-sm-start'>Our Vision</h3>
        <p className="text-center text-sm-start mt-2">We are a{' '}
          <a
            target='_blank'
            rel='noopener noreferrer'
            href="https://en.wikipedia.org/wiki/Triple_bottom_line"
          >
            triple bottom line
          </a> social enterprise, motivated by People, Planet, and Profit—in that order. We want to improve the lives of teachers, students, and researchers because we have been in all of those roles. We are also keenly interested in amplifying marginalized voices (particularly those of indigenous peoples around the world), not only because representation matters, but because diverse perspectives lead to better solutions. We are working toward a future where education is bolder, more creative, more equitable, and where organizational outreach truly has Broader Impacts.
        </p>
        <a
          target='_blank'
          rel='noopener noreferrer'
          href="https://vimeo.com/manage/videos/448000812"
          className="btn btn-secondary"
        >See this talk by our founder to learn more.
        </a>
      </div>
    </div>

    <div className='bg-primary p-5 text-white fs-1 fw-light text-center'>
      <div>Think <span className='fw-bold'>bigger</span>.</div>
      <div>Learn everything.</div>
    </div>

    <div className='bg-light-gray'>
      <div className='container mx-auto p-3 py-lg-5 gap-3 d-flex flex-column'>
        <h2 className='text-center mt-4 fs-1'>Meet Our Team</h2>

        <div className='row'>
          <div className='col-12 text-center p-3 py-lg-4 px-lg-5'>
            <h3 className='fs-4 mb-3 text-uppercase fw-light'>Leadership</h3>
            <p className='fs-5'>After doing biological research for over a decade and teaching in Nashville public middle schools for 3+ years, Matt left his position as a postdoc at Vanderbilt&apos;s Collaborative for STEM Education and Outreach in February 2021 to focus on GP full time.</p>
          </div>
        </div>

        <div className='row'>
          <TeamMemberCard
            className='col-12 col-lg-6 offset-lg-3 text-center'
            name="Matt Wilkins, PhD"
            position="Founder, CEO"
            imgSrc="/imgs/profilePics/matt_wilkins_profile3_sq_xs.jpg"
            links={MATT_LINKS}
          >
            <p>A scientist, teacher, writer, and pusher of boulders. Matt wants to live in a world where critical thinking and curiosity are as essential as breathing. Enjoys rock climbing, wildlife photography, and doing silly voices.</p>
          </TeamMemberCard>
        </div>

        <div className='row'>
          <div className='col-12 text-center p-3 py-lg-4 px-lg-5'>
            <h3 className='fs-4 mb-3 text-uppercase fw-light'>Product Team</h3>
            <p className='fs-5'>Our multitalented group of contractors and volunteers includes scientists, artists, communicators, and education experts who are responsible for bringing each Galactic Polymath lesson to life.</p>
          </div>
        </div>

        <div className='row justify-content-center align-items-stretch'>
          {productTeam.map((member, index) => {
            const { name, description, position, imgSrc, links } = member;

            if (imgSrc && links) {
              return (
                <TeamMemberCard
                  key={`${index}_${name}`}
                  className='col-12 col-lg-6 col-xl-4'
                  name={name}
                  position={position}
                  links={links}
                  imgSrc={imgSrc}
                >
                  {description}
                </TeamMemberCard>
              );
            }

            return (
              <TeamMemberCard
                key={`${index}_${name}`}
                className='col-12 col-lg-6 col-xl-4'
                name={name}
                position={position}
              >
                {description}
              </TeamMemberCard>
            );
          })}
        </div>

        <div className='row'>
          <div className='col-12 text-center p-3 py-lg-4 px-lg-5'>
            <h3 className='fs-4 mb-3 text-uppercase fw-light'>Dev Team</h3>
            <p className='fs-5'>The talented (mostly volunteer) group building and maintaining our site, as well as a growing variety of publishing and teaching tools. Fluent in React.js, SASS, CSS, HTML, R and other languages.</p>
          </div>
        </div>

        <div className='row justify-content-center align-items-stretch'>
          {devTeam.map((member, index) => {
            const { name, position, links, imgSrc, description } = member;
            return (
              <TeamMemberCard
                key={`${index}_${name}`}
                className='col-12 col-lg-6 col-xl-4'
                name={name}
                position={position}
                links={links}
                imgSrc={imgSrc}
              >
                {description}
              </TeamMemberCard>
            );
          })}
        </div>

        <div className='row'>
          <div className='col-12 text-center p-3 py-lg-4 px-lg-5'>
            <h3 className='fs-4 mb-3 text-uppercase fw-light'>Alumni</h3>
            <p className='fs-5'>We wouldn&apos;t be here without the hard work of these amazing folks!</p>
          </div>
        </div>

        <div className='row justify-content-center align-items-stretch'>
          {alumni.map(({ name, position, description, imgSrc, links }, index) => {
            const props = { className: 'col-12 col-lg-6 col-xl-4', name, position };

            if (links) {
              props['links'] = links;
            }

            if (imgSrc) {
              props['imgSrc'] = imgSrc;
            }

            return (
              <TeamMemberCard key={`${index}_${name}`} {...props}>
                {description}
              </TeamMemberCard>
            );
          }
          )}
        </div>
      </div>
    </div>
  </Layout>
);

export default AboutPage;