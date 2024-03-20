/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */

import Link from 'next/link';
import { validateHrefStr } from '../helperFns/validateUrl';

const CustomLink = ({
    hrefStr,
    children,
    fontSize,
    targetLinkStr = '_self',
    color = '',
    style = {},
    className = 'no-link-decoration',
}) => {
    if (color) {
        style.color = color;
    }
    if (fontSize) {
        style.fontSize = fontSize;
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