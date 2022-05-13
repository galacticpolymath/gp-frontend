import Layout from '../components/Layout';
import Link from 'next/link';
import SectionServices from './Services';
import SectionDescription from './Description';
import SectionPartners from './Partners';
import GetInvolved from './GetInvolved';

const AboutPage = () => {
  return (
    <Layout>
      <h1>About GP</h1>
      <h4 >
          Galactic Polymath (GP) is an education studio.{"\n"} We help
          scientists, nonprofits, and sustainable companies achieve
          outreach at scale by translating complex, cutting-edge research
          into mind-blowing lessons for grades 5+.
      </h4>
      <div>
        <SectionServices />
        <SectionDescription />
        {/* <SectionTeam /> */}
        <SectionPartners />
        <GetInvolved />
      </div>
    </Layout>
  );
};

export default AboutPage;