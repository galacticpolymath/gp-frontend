import Image from 'next/image';
import React from 'react';

const SubjectBreakDown = ({ SteamEpaulette, SteamEpaulette_vert }) => {
  return (
    <div className='position-relative'>
      <div className="d-none d-sm-grid">
        Subject breakdown by standard alignments:
        <Image
          src={SteamEpaulette}
          alt="Subject breakdown by standard alignments"
          priority
          height={90}
          width={2200}
          style={{
            objectFit: 'contain',
            width: '100%',
          }}
        />
      </div>
      <div className="d-sm-flex d-sm-none  row justify-content-start pb-2">
        <Image
          src={SteamEpaulette_vert}
          alt="Subject breakdown by standard alignments"
          priority
          height={1320}
          width={320}
          style={{
            objectFit: 'contain',
            height: '80vw',
            width: 'auto',
          }}
          className='col p-0 d-flex align-self-end'
        />
        <div className="col text-start align-content-center mt-3">
          <i className="bi bi-arrow-90deg-left fs-2 mb-0 d-flex "></i>
          <div
            className="rounded p-1 mt-0 d-flex"
            style={{ border: '2px solid ' }}
          >
            <h5>Subject breakdown by standard alignments</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectBreakDown;
