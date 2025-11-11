import React from "react";
import { HiOutlineRocketLaunch } from "react-icons/hi2";


const HeroForGpPlusUsers: React.FC = () => {
  return (
    <section className="jobviz-hero text-center text-light position-relative overflow-hidden">
      <div className="jobviz-bg"></div>

      <div className="container py-5 position-relative">
        <h1 className="fw-bold display-5 mb-3 animate-fadein">
          JobViz Career Explorer+
        </h1>
        <p
          className="lead mx-auto animate-fadein delay-1"
          style={{ maxWidth: "700px" }}
        >
          Jobs related to our <em>Data Streams</em> unit
        </p>
      </div>

      <div className="container pb-5 animate-slideup position-relative">
        <div className="assignment-card p-4 shadow-sm bg-white position-relative rounded-4 text-start overflow-hidden">
          <HiOutlineRocketLaunch className="wm-rocket" aria-hidden="true" />

          <p className="assignment-title mb-3 text-dark d-flex align-items-center flex-wrap position-relative">
            <HiOutlineRocketLaunch
              className="assignment-icon me-2"
              name="rocket-outline"
            />
            <strong>Assignment:</strong>&nbsp;Explore these jobs and
            explain&nbsp;<em>with data</em>&nbsp;which you would be most or
            least interested in.
          </p>

          <div className="row row-cols-sm-2 row-cols-1 position-relative">
            <div className="col">
              <ul className="job-list text-dark">
                <li>Computer and information research scientists</li>
                <li>Database administrators</li>
                <li>Operations research analysts</li>
                <li>Statisticians</li>
              </ul>
            </div>
            <div className="col">
              <ul className="job-list text-dark">
                <li>Data scientists</li>
                <li>Zoologists and wildlife biologists</li>
                <li>Biological technicians</li>
                <li>Statistical assistants</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroForGpPlusUsers;
