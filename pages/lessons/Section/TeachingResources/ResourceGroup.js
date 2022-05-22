import React from "react";

import { getIcon } from "../../icons";

const ResourceGroup = ({ itemTitle, links = [] }) => {
  if (links.url) {
    links = [links];
  }
  return (
    <li>
      <p>
        <strong>{itemTitle}</strong>
      </p>
      <ul>
        {links.length > 0 &&
          links.map(({ url, linkText }, i) => (
            <li key={i}>
              {getIcon(linkText)}
              <a href={url} target="_blank" rel="noreferrer noopener">
                {linkText}
              </a>
            </li>
          ))}
      </ul>
    </li>
  );
};

export default ResourceGroup;
