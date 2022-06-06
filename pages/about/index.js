import Layout from '../../components/Layout';
import Link from 'next/link';
import Hero from '../../components/Hero';
import styles from './about.module.css'
import SectionServices from './sections/Services';
import SectionDescription from './sections/Description';
import SectionPartners from './sections/Partners';
import GetInvolved from './sections/GetInvolved';
import SectionTeam from './sections/Team';

const AboutPage = () => {
  return (
    <Layout>
      <Hero className="bg-secondary">
        <h1>About GP</h1>
        <p>
            Galactic Polymath (GP) is an education studio.{"\n"} We help
            scientists, nonprofits, and sustainable companies achieve
            outreach at scale by translating complex, cutting-edge research
            into mind-blowing lessons for grades 5+.
        </p>
      </Hero>
      <div className={styles.center}>
        <div>
        <SectionServices />
        <SectionDescription />
        <SectionTeam />
        <SectionPartners />
        <GetInvolved />
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;