/* eslint-disable no-console */
/* eslint-disable semi */
/* eslint-disable quotes */
import React from 'react';
import MarkdownView from 'react-showdown';
import Link from 'next/link';

// WHAT IS HAPPENING:
//BUG: when the user clicks on a link, the page scroll to the target section does not occur 

// WHAT I WANT: when the user clicks on a link, have the page scroll to occur. 

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