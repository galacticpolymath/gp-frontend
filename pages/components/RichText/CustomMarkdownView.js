import React from 'react';
import MarkdownView from 'react-showdown';
import Link from 'next/link';

const components = {
  AnchorLink (props) {
    return <Link offset="125px" {...props} />;
  },
  a (props) {
    let LinkComponent = Link;

    // if the link DOES NOT go to galacticpolymath.com/* (excluding subdomains)
    if (!/^(https?:)?(\/\/)?(www\.)?galacticpolymath\.com/.test(props.href)) {
      LinkComponent = 'a';
    }

    return <LinkComponent {...props} />;
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