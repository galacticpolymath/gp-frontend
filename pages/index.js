/* eslint-disable react/jsx-max-props-per-line */
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import styles from './index.module.css';
import HeroImage from '../assets/img/city_network.jpg';
import EngineeringImage from '../assets/img/engineering_together.jpeg';
import NewReleaseImage from '../assets/img/new_release.jpg';
import NSFImage from '../assets/img/nsf.png';
import ScientificAmericanImage from '../assets/img/scientific_american.jpg';

export default function Home() {
  const newReleasePath = '/lessons/en-US/6';

  const layoutProps = {
    title: 'Galactic Polymath - Home Page',
    description: 'We are an education studio. We translate current research into creative, interdisciplinary lessons for grades 5+ that are free for everyone.',
    url: 'https://www.galacticpolymath.com/',
    imgSrc: 'https://res.cloudinary.com/galactic-polymath/image/upload/v1593304395/logos/GP_full_stacked_grad_whiteBG_llfyal.png',
    keywords: 'Galactic Polymath, Galactic, Polymath, education, studio, education studio, education studio for kids, education studio for children, education studio for teens, education studio for teenagers, education studio for young adults, education studio for young people, education studio for youth, education studio for adolescents, education studio for parents, education studio for teachers, education studio for counselors, education studio for schools, education studio for school districts.',
  };

  return (
    <Layout {...layoutProps}>
      <Hero imgSrc={HeroImage.src}>
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
          <div className=' container bg-white  rounded-3 justify-content-center py-5 px-4'>
            <div className='row justify-content-center gy-5'>
              <div className='col-12 offset-0 offset-md-1 col-md-7 col-lg-6'>
                <Link href={newReleasePath} className=' no-link-decoration object-fit-contain w-auto'>
                  <div className="position-relative mx-auto">

                    <Image
                      priority
                      src={NewReleaseImage.src}
                      height={1000}
                      width={1500}
                      sizes="60vw"
                      className='lessonsPgShadow rounded-4 h-auto'
                      style={{ objectFit: 'contain' }}
                      alt="Electric Crystals: A tour of crystal symmetry through comics"
                    />
                    <div className='badge bg-secondary fs-6 text-center' style={{ zIndex: 15, position: 'absolute', top: '-10px', left: '-20px' }}>
                      New release!
                    </div>

                  </div>
                </Link>
              </div>
              <div className='col-12 col-md-2 col-lg-1 d-grid justify-content-center align-content-center mx-auto'>
                <h5 className='fw-light text-center'>Sponsor:</h5>
                <a href="https://www.nsf.gov/">
                  <div className="position-relative nsfImgContainer">
                    <Image
                      src={NSFImage.src}
                      fill
                      className='h-auto'
                      style={{ objectFit: 'contain' }}
                      // sizes="175px"
                      alt="National Science Foundation"
                    />
                  </div>
                </a>
              </div>
            </div>
            <div className='row mt-5 '>
              <div className='col-12 col-md-8 justify-content-center d-flex'>
                <Link href={newReleasePath} className='btn btn-primary '>
                  See this lesson
                </Link>
              </div>
              <div className='col-0 col-md-4' />
            </div>
          </div>

          <div className="col-12 col-lg-10 offset-lg-1 px-0 py-3 my-5">
            <div className="display-4">We want to empower students with <em>agency</em> and <em>critical thinking</em>.</div>
            <p className="fs-3 pt-3">
              Our lessons are centered on cutting edge research and connected to real careers!
            </p>

          </div>
        </div>
      </div>

      <div className="container mx-auto py-5">
        <h2 className='text-center text-sm-start text-lg-center'>
          What We Do<br />
          <span className='fs-4 fw-light'>(And how we make it free for teachers)</span>
        </h2>
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
      </div>

      <div className="bg-primary-light">
        <div className="container d-flex flex-column-reverse flex-lg-row-reverse mx-auto py-5 align-items-center">
          <section className="row w-100 w-md-75 mt-3 mt-lg-0">
            <div className="col-12 ps-lg-5 d-flex flex-column justify-content-center align-items-center d-sm-block">
              <h4 className="mb-4 text-center text-sm-start">Our lesson &quot;Females Singing to be Heard&quot; featured in <em>Scientific American</em>.</h4>
              <a
                className='btn btn-primary mb-2'
                href="https://www.scientificamerican.com/article/why-it-took-so-long-to-appreciate-female-birds-songs/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the article
              </a>
              <br />
              <Link href="/lessons/en-US/1" className='btn btn-secondary'>

                Check out the lesson

              </Link>
            </div>
          </section>
          <section className="row w-100 w-md-75">
            <div className="col-12 d-flex justify-content-center align-items-center d-sm-block">
              <div className="position-relative ps-0 w-100 scientificAmericanImgContainer">
                <Image
                  fill
                  sizes="100%"
                  src={ScientificAmericanImage.src}
                  alt="Why We Didn't Know that Female Birds Sing, Scientific American."
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </div>
          </section>
        </div>
      </div>
      <div className="col-12 col-lg-10 offset-lg-1 px-0 py-3 my-5">
        <div className="display-4">The Real World doesn't respect subject boundaries. <em>Our lessons don't either!</em></div>
        <p className='fs-3 pt-3'>
           We craft learning narratives that students will remember. We make it clear how abstract learning standards in ELA, math, social studies and science connect to give students methods for approaching complex problems.
        </p>

      </div>

      <div className="bg-light-gray">
        <div className='bg-secondary-light'>
          <div className='container p-3 p-lg-5 mx-auto text-center d-none d-lg-block'>
            <p className='fs-4'>Real Research + Real Stories + Real Data + Real Careers =</p>
            <p className='fs-3'>Real Learning</p>
          </div>
          <div className='py-3 border mx-auto d-block d-lg-none'>
            <p className='w-100 text-center mb-0'>Real Research + Real Stories + Real Data + Real Careers</p>
            <p className='w-100 text-center mb-0 mt-0'>=</p>
            <p className='w-100 text-center mb-0'>Real Learning</p>
          </div>
        </div>

        <div className='bg-light-gray py-4'>
          <div className='container p-3 p-lg-5 mx-auto row justify-content-center align-items-center'>
            <div className='col-12 mb-4'>
              <h3 className='col-lg-8 col-xl-6 offset-lg-2 offset-xl-3 text-center fw-light fs-2 mb-3'>Benefits of connecting classrooms to the world of Academia</h3>
            </div>
            <div className='col-12 col-md-10 col-lg-6 mb-4 mb-lg-0 d-flex justify-content-center align-items-center'>
              <div style={{ minWidth: 265 }} className='bg-white rounded-3 px-3 py-4 d-flex flex-column justify-content-center align-items-center teacherAndClientsIsland'>
                <h4 className="text-center text-sm-start w-100">For Teachers</h4>
                <ul className="teacherAndClientsUl pt-2">
                  <li>Free (open-access), high-quality lessons</li>
                  <li>Regularly updated based on your feedback</li>
                  <li>Differentiated for grades 5-6, 7-8 & 9-12</li>
                  <li>Adaptable for different time lengths, extension activities, etc.</li>
                </ul>
                <div className="d-flex justify-content-center">
                  <Link href="/lessons" className='btn btn-primary'>
                    Get lessons
                  </Link>
                </div>
              </div>
            </div>
            <div className='col-12 col-md-10 col-lg-6 d-flex justify-content-center align-items-center'>
              <div style={{ minWidth: 265 }} className='bg-white rounded-3 d-flex flex-column justify-content-center align-items-center px-3 py-4 teacherAndClientsIsland'>
                <h4 className="text-center text-sm-start w-100">For Clients</h4>
                <ul className="teacherAndClientsUl pt-2">
                  <li>Magnify the impact of your research and outreach efforts</li>
                  <li>Get detailed impact metrics to report to funders</li>
                  <li>If you love GP, but don&apos;t have the funds to hire us, <Link passHref href="about/#get_involved"> there are also many avenues for collaboration!</Link></li>
                </ul>
                <div className="d-flex justify-content-center">
                  <Link href="/hire-us" className='btn btn-primary'>
                    Hire Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
