import React, { useEffect, useState } from 'react';

import Facebook from 'assets/img/share-logos/fb.svg'
import Pinterest from 'assets/img/share-logos/pinterest.svg'
import Twitter from 'assets/img/share-logos/twitter.svg'
import Email from 'assets/img/share-logos/email.svg'


const ShareTools = ({ location, lessonTitle }) => {
  const [pageUrl, setPageUrl] = useState('')
  useEffect(() => {
    setPageUrl(encodeURI(window.location.origin + location.pathname))
  }, [])

  const networks = [
    {
      name: 'Facebook',
      link: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
      image: Facebook
    },
    {
      name: 'Twitter',
      link: `https://twitter.com/intent/tweet?text=${pageUrl}`,
      image: Twitter
    },
    {
      name: 'Pinterest',
      link: `https://pinterest.com/pin/create/link/?url=${pageUrl}`,
      image: Pinterest
    },
    {
      name: 'Email',
      link: `mailto:?subject=${lessonTitle}&body=${pageUrl}`,
      image: Email
    }
  ]
  
  return (
    <div id='ShareTools'>
      <label>Share:</label>
      {networks.map(({ name, link, image }) =>
        <a
          key={name}
          rel='noopener noreferrer'
          target='_blank'
          href={encodeURI(link)}
        >
          <img src={image} alt={name} />
        </a>
      )}
    </div>
  )
}

export default ShareTools