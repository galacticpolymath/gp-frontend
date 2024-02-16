/* eslint-disable indent */
import NodeCache from 'node-cache';

const cache = (() => {
    const _cache = new NodeCache();

    return _cache;
})();

export default cache;