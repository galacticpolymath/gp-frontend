import Hero from '../components/Hero';
import Layout from '../components/Layout';
import HeroImage from '../assets/img/city_network.jpg';
import styles from './index.module.css';

const AboutPage = () => (
  <Layout>
    <Hero imgSrc={HeroImage.src}>
      <h1 className={styles.shadow}>About GP</h1>
      <p className={styles.shadow}>Galactic Polymath (GP) is an education studio. We help scientists, nonprofits, and sustainable companies achieve outreach at scale by translating complex, cutting-edge research into mind-blowing lessons for grades 5+.</p>
    </Hero>

    <div className="bg-light-gray p-4">
      <div className='bg-white rounded container mx-auto align-items-center p-5'>
        <div className='row text-center mb-5'>
          <div className='col-8 offset-2'>
            <h2>Easier Outreach, Better Results</h2>
            <p className='mt-4 fs-4 fw-light'>We do the heavy lifting, creating and disseminating mind-expanding lessons that engage young learners in the knowledge areas our clients care about.</p>
          </div>
        </div>

        <div className='row'>
          <div className='col-4'>
            <h5>1. Design</h5>
            <p>In just a few short meetings, we define clients&apos; outreach goals and map out the lessons and supporting media that will achieve lasting understanding in target areas.</p>
          </div>
          <div className='col-4'>
            <h5>2. Publish</h5>
            <p>We create and publish lessons on our site and do the hard work of getting them out to teachers through a growing network of educators, districts, and professional organizations.</p>
          </div>
          <div className='col-4'>
            <h5>3. Revise &amp; Report</h5>
            <p>We measure and maximize outreach performance—as we hear back from teachers, we improve the lessons, and collect impact data, which we report back to clients upon request.</p>
          </div>
        </div>

        <div className='row mt-5 text-center'>
          <p className='fs-4 fw-bold'>Learn how we can level up your outreach in [TODO: link hireus]</p>
        </div>
      </div>
    </div>

    <div className='bg-info'>
      <div className='container mx-auto p-5 gap-3 row align-items-center'>
        <h3 className='col-auto fs-1 fw-light'>Our Mission</h3>
        <p className='m-0 col fs-3 fw-light border-start ps-4 border-white'>To create a direct pipeline between the sources of knowledge and grade 5-12 classrooms by translating complex topics from researchers, non-profits, and sustainable corporations, into high-quality, open-access educational materials.</p>
      </div>
    </div>

    <div className='container mx-auto p-5 row'>
      <div className='col-6'>
        [TODO: image]
      </div>
      <div className='col-6'>
        <h3 className='fw-light'>Our Vision</h3>
        <p>We are a{' '}
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
  </Layout>
);

export default AboutPage;