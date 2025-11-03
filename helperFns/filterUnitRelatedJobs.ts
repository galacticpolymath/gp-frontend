import jobVizDataObj from '../data/Jobviz/jobVizDataObj.json';

export const getUnitRelatedJobs = (socCodesFromUnit: Set<string>) => {
  if (!jobVizDataObj.data.length) {
    throw new Error('No job categories found.');
  }

  return jobVizDataObj.data.filter((job) => {
    return socCodesFromUnit.has(job.soc_code);
  });
};