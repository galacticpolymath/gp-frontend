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
  return (
    <Layout>
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
            sizes='(max-width: 991px) 648px, (max-width: 1199px) 426px, 713px'
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
        <div className="container mx-auto row align-items-center d-flex d-sm-block justify-content-sm-start justify-content-center flex-column">
          <h2 className="fw-light fs-1 text-center text-sm-start text-lg-center p-3 p-lg-4">
            Think <strong>bigger</strong>.<br />{' '}
            Learn everything.
          </h2>

          <div className='bg-white p-4 row align-items-center rounded-3 d-flex d-sm-flex flex-column flex-sm-row'>
            <div className='col-sm-9 text-center'>
              <div className="d-flex justify-content-center justify-content-sm-start align-items-stretch">
                <div className='badge bg-secondary-light fs-5 text-center mb-2'>New release!</div>
              </div>
              <div className="position-relative newReleaseImg">
                <Image
                  priority
                  src={NewReleaseImage.src}
                  fill
                  sizes="(max-width: 991px) 452.25px, 902.25px"
                  style={{ objectFit: 'contain' }}
                  alt="I Like That! How perception, emotion, and cognition shape our preferences"
                />
              </div>
            </div>
            <div className='col-12 col-sm-3 text-sm-center d-flex justify-content-center mt-2 mt-sm-0 align-items-center'>
              <section className="d-flex mt-1 flex-column justify-content-center align-items-center justify-content-sm-start align-items-sm-stretch">
                <div className="d-flex justify-content-center align-items-center mt-3">
                  <h5 className='fw-light'>Sponsor:</h5>
                </div>
                <a href="https://www.nsf.gov/">
                  <div className="position-relative nsfImgContainer">
                    <Image
                      src={NSFImage.src}
                      fill
                      style={{ objectFit: 'contain' }}
                      sizes="175px"
                      alt="National Science Foundation"
                    />
                  </div>
                </a>
              </section>
            </div>
          </div>

          <div className="col-12 col-lg-10 offset-lg-1 px-0 py-3 mt-4 d-flex flex-column justify-content d-sm-block align-items-center">
            <h4 className="text-center text-sm-start">We want to empower students with <em>agency</em> and <em>critical thinking</em>.</h4>
            <p className="text-center text-sm-start">
              Our lessons can be <em><strong>taught in any subject classroom!</strong></em> We align to learning standards in ELA, math, social studies and science to provide deeper understanding and longer retention.
            </p>
            <p className="text-center text-sm-start">
              We build lessons around <em><strong>real research, data, and stories</strong></em> from diverse STEM experts.
            </p>
            <Link href="/lessons/en-US/5" className='btn btn-primary'>
              See this lesson
            </Link>
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
              1. Clients hire us;<br />
              <span className="fw-light fs-5">
                <span className="visually-hidden">&mdash;</span>
                researchers, nonprofits, &amp; companies pay
              </span>
            </h5>
            <p>Government-funded researchers and organizations that want to support research impacts on society hire us to make a body of knowledge available to the public.</p>
          </div>
          <div className='col-12 col-lg-6 col-xl-3 py-3'>
            <h5 className='mb-3 text-height-1 fw-bold'>
              2. We translate<br />
              <span className="fw-light fs-5">research into lessons</span>
            </h5>
            <p>
              Our team of science communicators, educators, and artists work directly with subject experts to translate our clients&apos; area of focus into free lessons for grades 5-12.{' '}
              <span className='highlight'>Our goal is for every lesson to be ready to teach in any subject classroom by a non-expert with 15 min. of prep time.</span>
            </p>
          </div>
          <div className='col-12 col-lg-6 col-xl-3 py-3'>
            <h5 className='mb-3 text-height-1 fw-bold'>
              3. We publish<br />
              <span className="fw-light fs-5">free lessons for everyone</span>
            </h5>
            <p>Working closely with educators and districts in our growing network, lessons are tested and taught in classrooms. Equal access to lessons means more of the public can connect with the body of knowledge our clients care about.</p>
          </div>
          <div className='col-12 col-lg-6 col-xl-3 py-3'>
            <h5 className='mb-3 text-height-1 fw-bold'>
              4. We improve,<span className="visually-hidden">,</span><br />
              <span className="fw-light fs-5">evaluate, revise, repeat</span>
            </h5>
            <p>All of our lessons are continuously evaluated, updated, and revised—meaning they are always up-to-date and working to make the jobs of teaching and outreach easier!</p>
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
                  sizes="(max-width: 767px) 486px, (max-width: 991px) 600px, 646.5px"
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
          <div className='container p-3 p-lg-5 mx-auto row'>
            <div className='col-12 mb-4'>
              <h3 className='col-lg-8 col-xl-6 offset-lg-2 offset-xl-3 text-center text-sm-start text-lg-center fw-light fs-2 mb-3'>Benefits of connecting classrooms to the world of Academia</h3>
            </div>
            <div className='col-12 col-lg-6 mb-4 mb-lg-0'>
              <div style={{ height: '400px' }} className='bg-white rounded-3 p-4 d-none d-sm-flex d-sm-block flex-column justify-content-center align-items-center'>
                <h4 className="text-center text-sm-start w-100">For Teachers</h4>
                <ul style={{ height: 210 }} className="d-none d-xl-block pt-2">
                  <li>Free (open-access), high-quality lessons</li>
                  <li>Regularly updated based on your feedback</li>
                  <li>Differentiated for grades 5-6, 7-8 & 9-12</li>
                  <li>Adaptable for different time lengths, extension activities, etc.</li>
                </ul>
                <ul style={{ height: 225 }} className="d-sm-block d-md-none pt-2">
                  <li>Free (open-access), high-quality lessons</li>
                  <li>Regularly updated based on your feedback</li>
                  <li>Differentiated for grades 5-6, 7-8 & 9-12</li>
                  <li>Adaptable for different time lengths, extension activities, etc.</li>
                </ul>
                <ul style={{ height: 240 }} className="d-none d-md-block d-xl-none">
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
            <div className='col-12 col-lg-6 d-flex d-sm-block flex-column justify-content-center align-items-center'>
              <div style={{ height: '400px' }} className='bg-white rounded-3 p-4 d-none d-sm-flex d-sm-block flex-column justify-content-center align-items-center'>
                <h4 className="text-center text-sm-start w-100">For Clients</h4>
                <ul style={{ height: 210 }} className="d-none d-md-block d-lg-none d-xl-block pt-2">
                  <li>Magnify the impact of your research and outreach efforts</li>
                  <li>Get detailed impact metrics to report to funders</li>
                  <li>If you love GP, but don&apos;t have the funds to hire us, <strong>there are also many avenues for collaboration!</strong></li>
                </ul>
                <ul style={{ height: 225 }} className="d-block d-md-none pt-2">
                  <li>Magnify the impact of your research and outreach efforts</li>
                  <li>Get detailed impact metrics to report to funders</li>
                  <li>If you love GP, but don&apos;t have the funds to hire us, <strong>there are also many avenues for collaboration!</strong></li>
                </ul>
                <ul style={{ height: 240 }} className="d-none d-lg-block d-xl-none">
                  <li>Magnify the impact of your research and outreach efforts</li>
                  <li>Get detailed impact metrics to report to funders</li>
                  <li>If you love GP, but don&apos;t have the funds to hire us, <strong>there are also many avenues for collaboration!</strong></li>
                </ul>
                <div className="d-flex justify-content-center">
                  <Link href="/hire-us" className='btn btn-primary'>
                    Get lessons
                  </Link>
                </div>
              </div>
              <div style={{ minWidth: 240 }} className='bg-white rounded-3 p-4 d-flex d-sm-none d-sm-block flex-column justify-content-center align-items-center'>
                <h4 className="text-center text-sm-start w-100">For Teachers</h4>
                <ul className="d-block d-md-none pt-2">
                  <li>Free (open-access), high-quality lessons</li>
                  <li>Regularly updated based on your feedback</li>
                  <li>Differentiated for grades 5-6, 7-8 & 9-12</li>
                  <li>Adaptable for different time lengths, extension activities, etc.</li>
                </ul>
                <div className="d-flex justify-content-center">
                  <Link href="/hire-us" className='btn btn-primary'>
                    Get lessons
                  </Link>
                </div>
              </div>
              <div style={{ minWidth: 240 }} className='bg-white mt-3 rounded-3 p-4 d-flex d-sm-none d-sm-block flex-column justify-content-center align-items-center'>
                <h4 className="text-center text-sm-start w-100">For Clients</h4>
                <ul className="d-block d-md-none pt-2">
                  <li>Magnify the impact of your research and outreach efforts</li>
                  <li>Get detailed impact metrics to report to funders</li>
                  <li>If you love GP, but don&apos;t have the funds to hire us, <strong>there are also many avenues for collaboration!</strong></li>
                </ul>
                <div className="d-flex justify-content-center">
                  <Link href="/hire-us" className='btn btn-primary'>
                    Get lessons
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
