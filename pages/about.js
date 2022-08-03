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
  </Layout>
);

export default AboutPage;