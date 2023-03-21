import Hero from '../components/Hero';
import Layout from '../components/Layout';
import HeroImage from '../assets/img/city_network.jpg';
import styles from './index.module.css';
import TeamMemberCard from '../components/TeamMemberCard';
import Image from 'next/image';

const AboutPage = () => (
  <Layout>
    <Hero imgSrc={HeroImage.src}>
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
          <p className='fs-4 fw-bold'>Learn how we can level up your outreach in [TODO: link hireus]</p>
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
            src="/imgs/about/our_vision.jpeg"
          />
        </div>
      </div>
      <div className='col-12 col-lg-6 mt-2'>
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
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Stephanie Castillo"
            position="Digital Multimedia Specialist"
          >
            A PhD candidate in science communication, award winning video producer,and previous Jackson Wild Media Lab Fellow. Stephanie is also founder of Phuture Doctors—a media company showcasing diverse voices in STEM.
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Elaine Perignat, PhD"
            position="Education Specialist"
          >
            A spirited over-thinker with genuine enthusiasm for teaching and learning. Elaine loves to paint, create, build, and play if it means getting her hands dirty. Literally.
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Carver Lee, MSc"
            position="Graphic Design + Marketing Lead"
          >
            A geologist, sailor, teacher, and designer all rolled into one, Carver believes that learning and creating are always the way forward.
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Aarati Asundi, PhD"
            position="Video Creator"
          >
            A scientist, entrepreneur, and storyteller. From biology to climate change, she loves learning about the latest scientific research and sharing it with the world.
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name='Jayme Dyer, PhD'
            position="Video Creator"
          >
            A biology educator and science communicator, Jayme says Wow a lot <em>(especially about science!)</em> and works to help others do the same.
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name='Caitlin Friesen'
            position="Learning Multimedia Artist"
          >
            A biologist, scientist, educator, artist, and cyclist in constant pursuit of making things a little bit better. She loves learning, creating, and being outdoors!
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name='Audrey Serene'
            position="Animator"
          >
            An animator and experimental filmmaker who loves anything and everything that combines art and technology. Especially when it’s for a good cause.
          </TeamMemberCard>
        </div>

        <div className='row'>
          <div className='col-12 text-center p-3 py-lg-4 px-lg-5'>
            <h3 className='fs-4 mb-3 text-uppercase fw-light'>Dev Team</h3>
            <p className='fs-5'>The talented (mostly volunteer) group building and maintaining our site, as well as a growing variety of publishing and teaching tools. Fluent in React.js, SASS, CSS, HTML, R and other languages.</p>
          </div>
        </div>

        <div className='row justify-content-center align-items-stretch'>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Kenzie Bottoms"
            position="Lead Developer, GP Publishing Workflow"
          >
            A problem solver who codes, makes art, and roller skates, Kenzie is trying to pay it forward and delighted to work with such kind, talented people in the process.
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Leigha Robinson"
            position="Lead Developer, JobViz"
          >
            A Software Developer with a love of music, gardening, and using technology to make the world a better place. Leigha deeply believes in TEAM: Together Everyone Achieves More!
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Patrick Cheng"
            position="Lesson Plan UI/UX Lead"
          >
            An earnest problem solver that loves to break things down and build things up. Loves food, beer, and communing with the great outdoors.
          </TeamMemberCard>
        </div>

        <div className='row'>
          <div className='col-12 text-center p-3 py-lg-4 px-lg-5'>
            <h3 className='fs-4 mb-3 text-uppercase fw-light'>Alumni</h3>
            <p className='fs-5'>We wouldn&apos;t be here without the hard work of these amazing folks!</p>
          </div>
        </div>

        <div className='row justify-content-center align-items-stretch'>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Maria Brock"
            position="Front End Web Developer, GP Publishing Workflow"
          >
            A Software Developer who loves problem solving, puzzles, and art. Fan of gaming, learning, and crocheting adorable, nerdy things. Powered by coffee.
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Castle Crawford"
            position="Front End Web Developer"
          >
            A food fanatic, day hiker, video game vanquisher, Corgi lover, and Software Developer. Loves being part of a team focused on making a difference.
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Tyler Lemburg, MSc"
            position="Previous Lead Developer, JobViz"
          >
            A Senior Software Engineer working remotely for Cognito. Tyler built the first iteration of JobViz. He has worked for several nonprofits as a web developer and recently earned a Masters in Climatology.
          </TeamMemberCard>
          <TeamMemberCard
            className='col-12 col-lg-6 col-xl-4'
            name="Arda Turkmen"
            position="Back End Developer"
          >
            Arda is a senior at Vanderbilt University, majoring in Computer Science and Mathematics. He was key in developing our early website in 2019-2020 using Node.JS, React, and SQL managed through AWS.
          </TeamMemberCard>
        </div>
      </div>
    </div>
  </Layout>
);

export default AboutPage;