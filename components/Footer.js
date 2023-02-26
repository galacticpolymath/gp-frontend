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
            href="https://45216c4d.sibforms.com/serve/MUIEABKhQZtQBEauhcYKU3l3n-hkpWQzrO5xzjvf6yI0XwqVvF1MuYlACX2EVtDFWcm1w1nY6lw181I_CUGs3cYjltIR-qTgWYRKLH-zF1Ef_NONTcKn5KiY3iLDyW1Klex1c_dKo2S66mUXo6codlinm0zDopzcmgkU3wW1Wyp-T1L61TZcGWlE49DKcYAszOJj6AKW3MTxs5Q0"
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