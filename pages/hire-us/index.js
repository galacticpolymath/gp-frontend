import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';

const HireUsPage = () => {
  return (
    <Layout>
      <Hero className="bg-secondary">
        <h1>Achieving Real,<br />Lasting Impact</h1>
        <p className='fs-5'>Whether you are an NSF-funded researcher, a nonprofit, or a socially responsible company, you care about a body of knowledge and you want the public to understand and care about it, too.</p>
      </Hero>

      <div className='container mx-auto p-5'>
        <div className='row'>
          <h1 className='fw-light col-12 col-md-10 mb-5 offset-md-1 text-center'>
            Benefits of working with us
          </h1>
        </div>
        <div className='row'>
          <div className='col-12 col-md-6 offset-md-3'>
            <h3>Better, Easier Outreach</h3>
            <p className='fw-light'>Make grant proposals more competitive and achieve much broader impacts, while reducing your own workload.</p>
            <h3>Provide Open Access Education</h3>
            <p className='fw-light'>Help reduce inequality by funding the production of high quality lessons for all.</p>
            <h3>Level Up Learning</h3>
            <p className='fw-light'>Our lessons improve learning and retention by imbuing rigorous, interdisciplinary lessons with artistry, authentic data, and storytelling.</p>
            <h3>Measure Your Impact</h3>
            <p className='fw-light'>We will aggregate impact reports to showcase the good you are doing in the world for your funders, customers, or the general public.</p>
          </div>
        </div>
      </div>

      <div className='bg-info p-5'>
        <div className='container mx-auto text-center'>
          <div className='row'>
            <p className='col-12 col-md-10 offset-md-1 fw-light fs-2 mb-0'>Contracting us means having a fully-dedicated team of scientists, educators, and creatives working to achieve your outreach dreams!</p>
          </div>   
        </div>
      </div>
    </Layout>
  );
  
};

export default HireUsPage;