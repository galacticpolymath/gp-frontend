import Link from 'next/link';
import styles from '../about.module.css'


export default function SectionServices() {
  return (
        <div className='bg-light-gray'>
          <h2>
            Easier Outreach, Better Results
          </h2>
          <h3>
            We do the heavy lifting, creating and disseminating mind-expanding lessons that
            engage young learners in the knowledge areas our clients care about.
          </h3>
          <h4>
            In just a few short meetings, we define clients' outreach goals
            and map out the lessons and supporting media that will achieve lasting
            understanding in target areas.
          </h4>
          <h4>
            We create and publish lessons on our site and do the hard work of getting them out to teachers through
            a growing network of educators, districts, and professional organizations.
          </h4>
          <h4>
            We measure and maximize outreach performance—as we hear back from teachers, we improve the lessons, and collect
            impact data, which we report back to clients upon request.
          </h4>
          <h3>
            <b>Learn how we can level up your outreach in <Link href="/hire-us"><a>Hire Us</a></Link></b>
          </h3>
        </div>
  );
}