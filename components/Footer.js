export default function Footer () {
  return (
    <footer className="pt-4 bg-dark-gray text-white">
      <div className="container py-4 row mx-auto gap-2 gap-lg-0">
        <div className="col-12 col-lg-5">
          <h4 className="fs-5">Galactic Polymath</h4>
          <p>We translate current research into creative interdisciplinary lessons for grades 5+ that are <em>free for everyone.</em></p>
          <p>[social media icons]</p>
        </div>
        <div className="col-12 col-lg-3">
          <h4 className="fs-5">Contact</h4>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary my-2 btn-sm"
            href="mailto:info@galacticpolymath.com"
          >
            Email us
          </a>
        </div>
        <div className="col-12 col-lg-4">
          <h4 className="fs-5">Join Our Mailing List</h4>
          <p>Get updates and early access to our latest free lessons and learning tools.</p>
          <a
            className="btn btn-primary btn-sm"
            target="_blank"
            rel="noopener noreferrer"
            href="https://galacticpolymath.us8.list-manage.com/subscribe?u=42413c3d307f9b69fd5d5319e&id=33924ebd91"
          >
            Subscribe
          </a>
        </div>
      </div>
      <div className="bg-dark text-center text-gray py-3 fs-7">
        made with [love] by Galactic Polymath &copy; [year]
      </div>
    </footer>
  );
}