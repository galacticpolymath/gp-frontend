/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */

import Link from 'next/link';
import { validateHrefStr } from '../helperFns/validateUrl';

const CustomLink = ({
    hrefStr,
    children,
    targetLinkStr = '_self',
    color = '',
    style = {},
    className = 'no-link-decoration',
}) => {
    if (color) {
        style.color = color;
    }

    return (
        <Link
            style={style}
            href={validateHrefStr(hrefStr)}
            target={targetLinkStr}
            rel="noopener noreferrer"
            className={className}
        >
            {children}
        </Link>
    );
};

export default CustomLink;