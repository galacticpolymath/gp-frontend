import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import Facebook from '../../img/share-logos/fb.svg';
import Pinterest from '../../img/share-logos/pinterest.svg';
import Twitter from '../../img/share-logos/twitter.svg';
import Email from '../../img/share-logos/email.svg';


const ShareTools = ({ lessonTitle }) => {
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setPageUrl(encodeURI(window.location.href));
  }, []);
  
  const networks = [
    {
      name: 'Facebook',
      link: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
      image: Facebook,
    },
    {
      name: 'Twitter',
      link: `https://twitter.com/intent/tweet?text=${pageUrl}`,
      image: Twitter,
    },
    {
      name: 'Pinterest',
      link: `https://pinterest.com/pin/create/link/?url=${pageUrl}`,
      image: Pinterest,
    },
    {
      name: 'Email',
      link: `mailto:?subject=${lessonTitle}&body=${pageUrl}`,
      image: Email,
    },
  ];
  
  return (
    <div id='ShareTools'>
      <label>Share:</label>
      {networks.map(({ name, link, image }) =>
        (
          <a
            className="d-block"
            key={name}
            rel='noopener noreferrer'
            target='_blank'
            href={link}
          >
            <Image
              width={30}
              height={30}
              src={image}
              alt={name}
            />
          </a>
        )
      )}
    </div>
  );
};

export default ShareTools;