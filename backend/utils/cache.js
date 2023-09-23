import NodeCache from "node-cache";

const cache = (() => {
    const _cache = new NodeCache();
    console.log('cache initalized.')
    return _cache;
})();

export { cache };