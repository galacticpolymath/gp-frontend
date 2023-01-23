import React from 'react';
import MarkdownView from 'react-showdown';
import Link from 'next/link';

const components = {
  AnchorLink ({ href, ...props }) {
    return (
      <Link href={href} {...props} />
    );
  },
  a (props) {
    return (
      <a
        {...props}
        target='_blank'
        rel='noopener noreferrer'
      />
    );
  },
};

const CustomMarkdownView = ({
  markdown,
  ...passThruProps
}) => {
  return (
    <MarkdownView
      {...passThruProps}
      markdown={markdown}
      components={{ ...components }}
    />
  );
};

export default CustomMarkdownView;