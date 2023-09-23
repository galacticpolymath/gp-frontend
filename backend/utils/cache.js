import NodeCache from "node-cache";

let currentCache = null;

export const getCache = () => {
    if(currentCache){
        console.log('Cache was already created.')
        return currentCache;
    }

    console.log('cache has not been instantiated.')

    currentCache = new NodeCache();

    return currentCache;
};

