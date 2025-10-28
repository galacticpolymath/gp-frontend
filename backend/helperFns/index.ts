interface ICache{
  [copyUnitJobStatus: `copyUnitJobStatus-${string}`]: 'ongoing' | 'stopped',
}

export const setCacheVal = async <TKey extends keyof ICache, TVal extends ICache[TKey]>(key: TKey, val: TVal) => {
  const { cache } = await import('../authOpts/authOptions');
  
  return cache.set(key, val);
};

export const getCacheVal = async <TKey extends keyof ICache, TVal extends ICache[TKey]>(key: TKey): Promise<TVal | undefined> => {
  const { cache } = await import('../authOpts/authOptions');

  return cache.get(key) as (TVal | undefined);
};

export const deleteCacheVal = async <TKey extends keyof ICache>(key: TKey): Promise<number> => {
  const { cache } = await import('../authOpts/authOptions');

  return cache.del(key);
};