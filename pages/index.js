import Link from 'next/link';

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
        <div>
          <Link passHref href="/lessons">
            <a className="btn btn-primary">Get Lessons</a>
          </Link>

          <Link
            href="/hire-us"
            className="btn btn-primary mx-2"
          >
            Do Outreach
          </Link>
        </div>
      </Hero>
      <div className="container mx-auto row align-items-center px-3 py-4 py-lg-5">
        <div className='col-12 col-lg-6 col-xl-7 order-1 order-lg-2 p-3 text-center'>
          <img
            className='border'
            src={EngineeringImage.src}
            alt="Two people working on a diagram together"
          />
        </div>
        <div className='col-12 col-lg-6 col-xl-5 order-2 order-lg-1 p-3 text-center space-y-3'>
          <h3 className='mb-2'>Open-Access</h3>
          <p className='mb-4'>
            <em>We do not sell to schools.</em>{' '}
            We believe every student deserves access to free, high-quality learning content.
          </p>

          <h3 className='mb-2'>Straight from the Source</h3>
          <p className='mb-4'>Our lessons are designed with extensive input from working scientists and other STEM experts, meaning they are current and authentic.</p>
          
          <h3 className='mb-2'>High-Quality</h3>
          <p className='mb-4'>We are a team of educators, scientists, and artists focused on publishing mind-expanding lessons that are also easy to teach.</p>
        </div>
      </div>

      <div className="bg-light-gray py-5">
        <div className="container mx-auto row align-items-center">
          <h2 className="fw-light fs-1 text-center p-3 p-lg-4">
            Think <strong>bigger</strong>.<br />{' '}
            Learn everything.
          </h2>

          <div className='bg-white p-4 row align-items-center rounded-3'>
            <div className='col-9 text-center'>
              <div className='badge bg-secondary-light fs-5 text-center mb-2'>New release!</div>
              <img
                className='border'
                src={NewReleaseImage.src}
                alt="I Like That! How perception, emotion, and cognition shape our preferences"
              />
            </div>
            <div className='col-3 text-center'>
              <h5 className='fw-light'>Sponsor:</h5>
              <a href="https://www.nsf.gov/">
                <img src={NSFImage.src} alt="National Science Foundation" />
              </a>
            </div>
          </div>

          <div className="col-12 col-lg-10 offset-lg-1 px-0 py-3 mt-4">
            <h4>We want to empower students with <em>agency</em> and <em>critical thinking</em>.</h4>
            <p>
              Our lessons can be <em><strong>taught in any subject classroom!</strong></em> We align to learning standards in ELA, math, social studies and science to provide deeper understanding and longer retention.
            </p>
            <p>
              We build lessons around <em><strong>real research, data, and stories</strong></em> from diverse STEM experts.
            </p>
            <Link href="/lessons/5">
              <a className='btn btn-primary'>See this lesson</a>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-5">
        <h2 className='text-center'>
          What We Do<br />
          <span className='fs-4 fw-light'>(And how we make it free for teachers)</span>
        </h2>
        <div className="row pt-5">
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
        <div className="container row mx-auto py-5 align-items-center">
          <div className="col-12 col-md-6 order-1 order-md-2">
            <h4 className="mb-4">Our lesson &quot;Females Singing to be Heard&quot; featured in <em>Scientific American</em>.</h4>
            <a
              className='btn btn-primary mb-2'
              href="https://www.scientificamerican.com/article/why-it-took-so-long-to-appreciate-female-birds-songs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the article
            </a>
            <br />
            <Link href="/lessons/1">
              <a className='btn btn-secondary'>
                Check out the lesson
              </a>
            </Link>
          </div>
          <div className="col-12 col-md-6 order-2 order-md-1">
            <img
              className='border'
              src={ScientificAmericanImage.src}
              alt="Why We Didn't Know that Female Birds Sing, Scientific American."
            />
          </div>
        </div>
      </div>

      <div className="bg-light-gray">
        {/* <div className="container mx-auto p-3 py-5 p-lg-5">
          <div className='col-12 col-lg-10 offset-lg-1'>
            <div className='text-center'>[video]</div>
            <h2 className="mt-5 mb-3">JobViz</h2>
            <h5>Connect lessons to careers with this free tool!</h5>
            <ul>
              <li>Search and browse ~1,000 jobs</li>
              <li>Explore US Bureau of Labor Statistics data most relevant to students</li>
              <li>Clean, responsive user interface</li>
              <li>Share links to jobs (useful for assignments)</li>
              <li>Create a springboard for independent career research</li>
            </ul>
            <Link href="/jobviz">
              <a className='btn btn-secondary mt-3'>Explore jobs</a>
            </Link>
          </div>
        </div> */}

        <div className='bg-secondary-light'>
          <div className='container p-3 p-lg-5 mx-auto text-center'>
            <p className='fs-4'>Real Research + Real Stories + Real Data + Real Careers =</p>
            <p className='fs-3'>Real Learning</p>
          </div>
        </div>

        <div className='bg-light-gray py-4'>
          <div className='container p-3 p-lg-5 mx-auto row'>
            <div className='col-12 mb-4'>
              <h3 className='col-lg-8 col-xl-6 offset-lg-2 offset-xl-3 text-center fw-light fs-2 mb-3'>Benefits of connecting classrooms to the world of Academia</h3>
            </div>
            <div className='col-12 col-lg-6 mb-4 mb-lg-0'>
              <div className='bg-white rounded-3 p-4'>
                <h4>For Teachers</h4>
                <ul>
                  <li>Free (open-access), high-quality lessons</li>
                  <li>Regularly updated based on your feedback</li>
                  <li>Differentiated for grades 5-6, 7-8 & 9-12</li>
                  <li>Adaptable for different time lengths, extension activities, etc.</li>
                </ul>
                <Link href="/lessons">
                  <a className='btn btn-primary'>Get lessons</a>
                </Link>
              </div>
            </div>
            <div className='col-12 col-lg-6'>
              <div className='bg-white rounded-3 p-4'>
                <h4>For Clients</h4>
                <ul>
                  <li>Magnify the impact of your research and outreach efforts</li>
                  <li>Get detailed impact metrics to report to funders</li>
                  <li>If you love GP, but don&apos;t have the funds to hire us, <strong>there are also many avenues for collaboration!</strong></li>
                </ul>
                <Link href="/hire-us">
                  <a className='btn btn-primary'>Get lessons</a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
