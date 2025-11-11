import Image from "next/image";

interface IHeroForFreeUsersProps {
  className?: string;
}

const HeroForFreeUsers: React.FC<IHeroForFreeUsersProps> = ({
  className = "jobviz-hero-free text-light position-relative overflow-hidden",
}) => {
  return (
    <section className={className}>
      <div className="container py-5 position-relative">
        <div className="row align-items-center justify-content-center text-center text-md-start g-4">
          <div className="col-md-7">
            <h1 className="fw-bold display-5 mb-2 animate-fadein">
              JobViz Career Explorer{" "}
              <span className="free-tag ms-1">(FREE)</span>
            </h1>
            <p className="lead animate-fadein delay-1">
              Discover how classroom learning connects to real-world careers
              across industries and the economy.
            </p>
          </div>
          <div className="col-md-4 d-flex justify-content-md-center justify-content-center animate-fadein delay-1">
            <div className="jobviz-logo-shell">
              <div className="jobviz-logo-inner">
                <img
                  src="https://dev.galacticpolymath.com/_next/image?url=%2Fimgs%2FjobViz%2Fjobviz_icon.png&w=3840&q=75"
                  alt="JobViz Logo"
                  className="jobviz-logo-img"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroForFreeUsers;
