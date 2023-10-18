export const getLatestSubRelease = (sections) => {
    const versionSection = sections.versions;
  
    if (!versionSection) return null;
  
    const lastRelease = versionSection.Data[versionSection?.Data?.length - 1].sub_releases;
    const lastSubRelease = lastRelease[lastRelease?.length - 1];
  
    return lastSubRelease;
  };