/* eslint-disable quotes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-max-props-per-line */
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import styles from './index.module.css';
import EngineeringImage from '../assets/img/engineering_together.jpeg';
import ScientificAmericanImage from '../assets/img/scientific_american.jpg';
import VanderBiltPressReleaseImg from '../assets/img/vanderbilt_press_release.png';
import FrontiersPaperImg from '../assets/img/frontiers_paper.png';
import EdutopiaBoostingStudentsDataLiteracyImg from '../assets/img/Edutopia_boosting-students-data-literacy.jpg';
import CarouselContainer from '../components/CarouselContainer';
import CarouselItem from '../components/CarouselItem';
import SponsorsMarquee from '../components/Sponsors';
import NewRelease from '../components/Home/NewRelease';

const papers = [
  {
    imgSrc: ScientificAmericanImage.src,
    imgAlt: 'Scientific American Paper',
    articleLink: 'https://www.scientificamerican.com/article/why-it-took-so-long-to-appreciate-female-birds-songs/',
    lessonLink: '/lessons/en-US/1',
    h4Txt: 'Our lesson &quot;Females Singing to be Heard&quot; featured in <em>Scientific American</em>.',
    className: 'paper-title',
  },
  {
    imgSrc: EdutopiaBoostingStudentsDataLiteracyImg.src,
    imgAlt: 'Edutopia Paper GP',
    articleLink: 'https://www.edutopia.org/article/boosting-students-data-literacy/',
    lessonLink: '/lessons/en-US/5#lesson_part_2',
    h4Txt: 'Our data literacy strategy used in several lessons featured in <em>Edutopia</em>.',
    className: 'paper-title',
  },
  {
    imgSrc: VanderBiltPressReleaseImg.src,
    imgAlt: 'VanderBilt Press Release',
    articleLink: 'https://as.vanderbilt.edu/news/2024/06/28/heard-that-bird-creanza-lab-develops-free-curriculum-to-teach-birdsong-identification/',
    lessonLink: '/lessons/en-US/11#lesson_part_1',
    h4Txt: 'Our lesson &quot;Heard that bird?&quot; featured in <em>Vanderbilt University Press</em>.',
    className: 'paper-title',
  },
  {
    imgSrc: FrontiersPaperImg.src,
    imgAlt: 'Frontiers Paper Img',
    articleLink: 'https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2024.1366207/full',
    lessonLink: '',
    h4Txt: 'GP founder was lead author on an article arguing for importance of teachers as partners for growing a STEM engaged society.',
    className: 'mb-3',
  },
];
const releases = [
  {
    newReleasePath: '/lessons/en-US/12',
    sponsorImgPath: 'https://storage.googleapis.com/gp-cloud/lessons/HybridZones_en-US/NSF_logo_sm.png ',
    sponsorImgAlt: 'gp_sponsor_image',
    NewReleaseImage_src: 'https://storage.googleapis.com/gp-cloud/lessons/HybridZones_en-US/HybridZones_unit-assets-4-card-(1).png',
    releaseInfoTxt: "National Science Foundation",
    customCss: 'col-12 col-md-3 col-lg-4 mt-3',
    sponsorImgClassName: 'w-100 sci-journey-sponsor-img',
  },
  {
    newReleasePath: '/lessons/en-US/10',
    sponsorImgPath: 'https://storage.googleapis.com/gp-cloud/lessons/SciJourneys_en-US/if-then_logo.png',
    sponsorImgAlt: 'gp_sponsor_image',
    NewReleaseImage_src: 'https://storage.googleapis.com/gp-cloud/lessons/SciJourneys_en-US/SciJourneys-UnitAssets-2-card_FINAL.png',
    releaseInfoTxt: "An initiative of Lyda Hill Philanthropies",
    customCss: 'col-12 col-md-3 col-lg-4 mt-3',
    sponsorImgClassName: 'w-100 sci-journey-sponsor-img',
  },
  {
    newReleasePath: '/lessons/en-US/8',
    sponsorImgPath: 'https://storage.googleapis.com/gp-cloud/lessons/BioInspired_en-US/JTF_logo_wtagline.png',
    sponsorImgAlt: 'gp_sponsor_image',
    NewReleaseImage_src: 'https://storage.googleapis.com/gp-cloud/lessons/BioInspired_en-US/bioinspired_assets-3-card.png',
    releaseInfoTxt: "Dr. Emilie Snell-Rood's Lab at the University of Minnesota",
    customCss: 'col-12 col-md-3 col-lg-4 mt-3 mt-md-0 pt-0 pt-md-3 pt-xxl-4',
    sponsorImgClassName: 'w-100 sponsor-img-release',
  },
  {
    newReleasePath: '/lessons/en-US/13',
    sponsorImgPath: 'https://storage.googleapis.com/gp-cloud/lessons/PacificH2O_en-NZ/canterbury_logo.jpg',
    sponsorImgAlt: 'gp_sponsor_image',
    NewReleaseImage_src: 'https://pacific-h2o.galacticpolymath.com/images/PacificH2O-meta-image.png',
    releaseInfoTxt: "The Department of Chemical and Process Engineering at the University of Canterbury",
    customCss: 'col-12 col-md-3 col-lg-4 mt-3 mt-md-0',
    sponsorImgClassName: 'w-100 sponsor-img-release',
  },

];

export default function Home() {
  const layoutProps = {
    title: 'Galactic Polymath - Home Page',
    description: 'We are an education studio. We translate current research into creative, interdisciplinary lessons for grades 5+ that are free for everyone.',
    url: 'https://www.galacticpolymath.com/',
    imgSrc: 'https://res.cloudinary.com/galactic-polymath/image/upload/v1593304395/logos/GP_full_stacked_grad_whiteBG_llfyal.png',
    keywords: 'Galactic Polymath, Galactic, Polymath, education, studio, education studio, education studio for kids, education studio for children, education studio for teens, education studio for teenagers, education studio for young adults, education studio for young people, education studio for youth, education studio for adolescents, education studio for parents, education studio for teachers, education studio for counselors, education studio for schools, education studio for school districts.',
  };
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  return (
    <Layout {...layoutProps}>
      <Hero
        heroContainerStyle={{
          backgroundImage: `url(${origin}/imgs/home/home-pg-banner.png)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'fill',
        }}
        className='home-pg-hero'
        isStylesHereOn={false}
      >
        <h1 className={styles.shadow}>We are an education studio.</h1>
        <p className={`${styles.shadow} my-4 fs-5 fw-light`}>We translate current research into creative, interdisciplinary lessons for grades 5+ that are free for <em>everyone</em>.</p>
        <div className="d-flex d-sm-block flex-column justify-content-start align-items-start">
          <Link
            passHref
            href="/lessons"
            className="btn btn-primary"
          >
            Get Lessons
          </Link>
          <Link
            href="/hire-us"
            className="btn btn-primary mt-4 mt-sm-0 mx-sm-2"
          >
            Do Outreach
          </Link>
        </div>
      </Hero>
      <div className="container d-flex align-items-center mx-auto px-3 py-4 py-lg-5 flex-column flex-lg-row-reverse">
        <div className="position-relative col-12 col-lg-6 engineeringImgHomePg">
          <Image
            src={EngineeringImage.src}
            alt="Two people working on a diagram together"
            fill
            sizes='100%'
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className='col-12 col-lg-6 order-2 order-lg-1 p-3 text-center space-y-3'>
          <h3 className='mb-2 text-center text-sm-start text-lg-center'>Open-Access</h3>
          <p className='mb-4 text-center text-sm-start text-lg-center'>
            <em>We do not sell to schools.</em>{' '}
            We believe every student deserves access to free, high-quality learning content.
          </p>

          <h3 className='mb-2 text-center text-sm-start text-lg-center'>Straight from the Source</h3>
          <p className='mb-4 text-center text-sm-start text-lg-center'>Our lessons are designed with extensive input from working scientists and other STEM experts, meaning they are current and authentic.</p>

          <h3 className='mb-2 text-center text-sm-start text-lg-center'>High-Quality</h3>
          <p className='mb-4 text-center text-sm-start text-lg-center'>We are a team of educators, scientists, and artists focused on publishing mind-expanding lessons that are also easy to teach.</p>
        </div>
      </div>
      <div className="bg-light-gray py-3 py-sm-5 border">
        <div className="container mx-auto row align-items-center justify-content-center">
          <h2 className="fw-light fs-1 text-center text-sm-start text-lg-center p-3 p-lg-4 mb-5">
            Think <strong>bigger</strong>.<br />{' '}
            Learn everything.
          </h2>
          <div className='container bg-white rounded-3 justify-content-center py-1 py-lg-5 px-2 px-lg-4'>
            <CarouselContainer
              autoCarouselSecClassName="col-12 mt-0 px-0 px-md-4"
              parentStylesClassName="p-0 d-flex flex-column papersCarouselContainer position-relative"
              dotSecClassName='d-flex justify-content-center align-items-center pb-3 pt-sm-2 pt-md-3'
              intervalTimeMs={4_000}
            >
              {releases.map(({ NewReleaseImage_src, newReleasePath, sponsorImgPath, sponsorImgAlt, releaseInfoTxt, customCss, sponsorImgClassName }, index) => (
                <div key={index} className='autoCarouselItem'>
                  <NewRelease sponsorImgClassName={sponsorImgClassName} releaseInfoTxt={releaseInfoTxt} NewReleaseImage_src={NewReleaseImage_src} customCss={customCss} newReleasePath={newReleasePath} sponsorImgPath={sponsorImgPath} sponsorImgAlt={sponsorImgAlt} />
                </div>
              ))}
            </CarouselContainer>
          </div>

          <div className="col-12 col-lg-10 offset-lg-1 px-4 py-3 my-5">
            <div className="display-4">We want to empower students with <em>agency</em> and <em>critical thinking</em>.</div>
            <p className="fs-3 pt-3">
              Our lessons help build 21st Century Skills and foster lifelong curiosity.
            </p>

          </div>
        </div>
      </div>

      <div className="container mx-auto py-5">
        <div className='text-center text-sm-start text-lg-center display-4'>
          What We Do<br />
          <span className='fs-4 fw-light'>(And how we make it free for teachers)</span>
        </div>
        <div className="row text-center text-sm-start text-lg-center pt-lg-5">
          <div className='col-12 col-lg-6 col-xl-3 py-3'>
            <h5 className='mb-3 text-height-1 fw-bold'>
              1. Clients hire us &#x2192;<br />
              <span className="fw-light fs-5">
                <span className="visually-hidden">&mdash;</span>
                We make outreach easier for researchers, nonprofits, &amp; companies.
              </span>
            </h5>
          </div>
          <div className='col-12 col-lg-6 col-xl-3 py-3'>
            <h5 className='mb-3 text-height-1 fw-bold'>
              2. We translate &#x2192;<br />
              <span className="fw-light fs-5">We weave real STEM research &amp; data into free, interdisciplinary lessons</span>
            </h5>
          </div>
          <div className='col-12 col-lg-6 col-xl-3 py-3'>
            <h5 className='mb-3 text-height-1 fw-bold'>
              3. We publish &#x2192;<br />
              <span className="fw-light fs-5">We release our lessons worldwide with an <em>open-access</em> license.</span>
            </h5>
          </div>
          <div className='col-12 col-lg-6 col-xl-3 py-3'>
            <h5 className='mb-3 text-height-1 fw-bold'>
              4. We evaluate &#x21ba;<span className="visually-hidden">,</span><br />
              <span className="fw-light fs-5">We gather measures of impact for clients as we improve lessons over time.</span>
            </h5>
          </div>
        </div>
        <div className='w-100 mt-5' style={{ height: 250 }}>
          <h6 className="mb-3">
            Made open access by these funding organizations and research institutions:
          </h6>
          <div className="mt-5">
            <SponsorsMarquee />
          </div>
        </div>
      </div>
      <div className="bg-primary-light py-md-4 py-lg-0">
        <h2 className="fw-light fs-1 text-center pb-sm-3 pb-md-0 px-3 pt-3 px-lg-4 pt-lg-4 ">
          In The Press:
        </h2>
        <CarouselContainer
          autoCarouselSecClassName="col-12 mt-0 px-0 px-md-4 autoCarouselSec"
          parentStylesClassName="p-0 d-flex flex-column papersCarouselContainer position-relative"
          dotSecClassName='d-flex justify-content-center align-items-center pb-3 pt-sm-4 pt-lg-0'
        >
          {papers.map((paper, index) => {
            // have the items stream in a horizontal fashion, don't have it revert to the beginning
            return (
              <CarouselItem
                key={index}
                parentStyles='d-flex justify-content-center align-items-center'
                secondChildDivClassName='px-1 pb-0 rounded w-100'
                thirdChildDivClassName='px-md-1 papersCarouselItem border-0'
              >
                <div className="d-flex flex-column flex-md-row h-100">
                  <section className="paperItemSec d-flex justify-content-center align-items-center">
                    <div className='paperItemImgContainer position-relative'>
                      <Image
                        fill
                        src={paper.imgSrc}
                        alt={paper.imgAlt}
                        className='w-100 h-100 position-absolute'
                      />
                    </div>
                  </section>
                  <section className="ps-sm-2 ps-md-0 paperItemSec d-flex justify-content-center align-items-center">
                    <div className="mt-md-0 mt-2 col-12 ps-lg-3 d-flex flex-column justify-content-center align-items-center d-md-block">
                      <h4
                        style={{ whiteSpace: 'initial' }}
                        className={`text-center text-md-start ${paper.className}`}
                        dangerouslySetInnerHTML={{ __html: paper.h4Txt }}
                      />
                      <Link
                        className='btn btn-primary mb-2'
                        href={paper.articleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read the article
                      </Link>
                      <br className="d-none d-md-block" />
                      {paper.lessonLink && (
                        <Link
                          href={paper.lessonLink}
                          className='btn btn-secondary'
                        >
                          Check out the lesson
                        </Link>
                      )}
                    </div>
                  </section>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContainer>
      </div>
      <div className="col-12 col-lg-10 offset-lg-1 px-4 py-3 my-5">
        <div className="display-4">The Real World doesn&apos;t fit neatly into subject boundaries. <em>Our lessons don&apos;t either!</em></div>
        <p className='fs-3 pt-3'>
          We craft learning narratives that students will remember. We make it clear how abstract learning standards in language arts, math, social studies and science connect to give students methods for approaching complex problems.
        </p>
      </div>
      <div className="bg-light-gray">
        <div className='bg-secondary-light d-flex justify-content-center align-items-center py-sm-4 px-1 px-sm-0'>
          <div className="position-relative gp-equation-img-container">
            <Image
              src="/imgs/learning-equation.png"
              alt="Galactic_Polymath_Equation"
              className='w-100 gp-equation-img px-1 px-sm-0'
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        <div className='bg-light-gray py-4'>
          <div className='no-x-mobile-margin row my-5 justify-content-center'>
            <div className='col-10'>
              <h3 className='mt-5 display-5'>
                Benefits of connecting classrooms to the real world with GP:
              </h3>
            </div>
          </div>

          {/* For Teachers and Clients boxes container */}
          <div className='container my-5'>
            <div className='row g-5 justify-content-center align-content-start mx-1'>

              {/* Teachers box */}
              <div className='d-grid col-12 col-md-5 bg-white rounded-3 p-4 me-md-5'>
                {/* <div className='d-grid '> */}
                <h2 className="d-block">For Teachers</h2>
                <ul className="fs-4 align-self-start">
                  <li>Get free, high-quality lessons!</li>
                  <li>Have your voice heard by a company that cares.</li>
                  <li>Remix our materials to meet the needs of your students.</li>
                </ul>
                <div className="d-grid justify-content-center mt-3">
                  <Link href="/lessons" className='btn btn-primary align-self-end'>
                    Get lessons
                  </Link>
                </div>
                {/* </div> */}

              </div>

              {/* Clients box */}
              <div className='d-grid col-12 col-md-5 justify-content-center bg-white rounded-3  p-4'>

                <h2 className="text-start ">For Clients</h2>
                <div className=' d-block'>
                  <ul className=" fs-4">
                    <li>Scale up your outreach, with less work!</li>
                    <li>Get detailed impact metrics to report to funders.</li>
                    <li>If can&apos;t hire us, <Link passHref href="about/#get_involved"> there are still many ways to collaborate!</Link></li>
                  </ul>
                </div>
                <div className="d-grid justify-content-center ">
                  <Link href="/hire-us" className='btn btn-primary mt-3'>
                    Hire Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='py-3' />
      </div>
    </Layout>
  );
}
