import React from 'react';
import PropTypes from 'prop-types';

import CollapsibleSection from './CollapsibleSection';

const Acknowledgments = ({ index, SectionTitle, Data = [] }) => {
  return null;//(
  //   <CollapsibleSection
  //     className="Acknowledgments"
  //     index={index}
  //     SectionTitle={SectionTitle}
  //   >
  //     <div className={classes.container}>
  //       {Data &&
  //         Data.map(({ role, def, records = [] }, i) => (
  //           <div className="role" key={i}>
  //             <h4>{role}</h4>
  //             <p>{def}</p>
  //             {records.map(({ name, url, title, affiliation, location }) => (
  //               <div className="record" key={name}>
  //                 <h5>
  //                   <a href={url} rel="noopener noreferrer" target="_blank">
  //                     {name}
  //                   </a>
  //                 </h5>
  //                 <div>{title}</div>
  //                 {affiliation && <div>{affiliation}</div>}
  //                 <div>{location}</div>
  //               </div>
  //             ))}
  //           </div>
  //         ))}
  //     </div>
  //   </CollapsibleSection>
  // );
};

Acknowledgments.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  Data: PropTypes.array,
};

export default Acknowledgments;
