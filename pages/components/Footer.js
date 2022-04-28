export default function Footer () {
  return (
    <div className="border-top pt-5 pb-3">
      <div className="container row mx-auto">
        <div className="col">
          <h5>Galactic Polymath</h5>
          <p>We translate current research into creative interdisciplinary lessons for grades 5+ that are <em>free for everyone.</em></p>
          <p>[social media icons]</p>
        </div>
        <div className="col">
          <h5>Contact</h5>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            href="mailto:info@galacticpolymath.com"
          >
            Email us
          </a>
        </div>
        <div className="col">
          <h5>Join Our Mailing List</h5>
          <p>Get updates and early access to our latest free lessons and learning tools.</p>
          <a
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
            href="https://galacticpolymath.us8.list-manage.com/subscribe?u=42413c3d307f9b69fd5d5319e&id=33924ebd91"
          >
            Subscribe
          </a>
        </div>
        <div className="col-12 text-center mt-3 pt-3 border-top">
          made with [love] by Galactic Polymath &copy; [year]
        </div>
      </div>
    </div>
  );
}