/* eslint-disable no-console */
/* eslint-disable semi */
/* eslint-disable quotes */
import React from 'react';
import MarkdownView from 'react-showdown';
import Link from 'next/link';

const components = {
  AnchorLink({ href, ...props }) {
    return (
      (
        <Link
          href={href.replace(/[_]/g, "-")}
          passHref
          scroll={false}
          {...props}
        >

        </Link>
      )
    );
  },
  a(props) {
    const linkProps = {};
    let LinkComponent = Link;

    // if the link DOES NOT go to galacticpolymath.com/* (excluding subdomains)
    if (!/^(https?:)?(\/\/)?(www\.)?galacticpolymath\.com/.test(props.href)) {
      LinkComponent = 'a';
      linkProps.target = '_blank';
      linkProps.rel = 'nooopener noreferrer';
    }

    return <LinkComponent {...props} {...linkProps}></LinkComponent>;
  },
};

// GOAL: make the text clickable, change the appearance of the arrow when the user hovers over the text

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