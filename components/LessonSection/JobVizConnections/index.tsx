import React, { useMemo } from 'react';
import { IJobVizConnection } from '../../../backend/models/Unit/JobViz';
import { IConnectionJobViz } from '../../../backend/models/Unit/JobViz';
import { GpPlusBtn } from '../../../pages/gp-plus';

interface IJobVizConnectionsProps {
  unitTitle: string;
  jobVizConnections?: IConnectionJobViz[] | IJobVizConnection[] | null;
}

const JobVizConnections: React.FC<IJobVizConnectionsProps> = ({
  jobVizConnections,
  unitTitle,
}) => {
  const handleJobVizConnectionBtnClick = () => {};

  const jobVizConnectionsArr = useMemo(() => {
    const _jobVizConnections = jobVizConnections?.filter((jobVizConnection) => {
      return (
        // check for nulls
        jobVizConnection &&
        jobVizConnection?.job_title &&
        jobVizConnection?.soc_code
      );
    }) as IJobVizConnection[] | IConnectionJobViz[];
    jobVizConnections = _jobVizConnections;

    if (!jobVizConnections?.length) {
      console.error(
        'Developer Error: jobVizConnections is empty or undefined in JobVizConnections component.'
      );

      return [];
    }

    let jobVizConnectionsDeprecated: IJobVizConnection[] | null = null;

    for (const { soc_code, job_title } of jobVizConnections) {
      if (Array.isArray(soc_code) || Array.isArray(job_title)) {
        jobVizConnectionsDeprecated = jobVizConnections as IJobVizConnection[];
        break;
      }
    }

    if (jobVizConnectionsDeprecated?.length) {
      return jobVizConnectionsDeprecated
        .map(({ job_title, soc_code }) => {
          const jobTitle = job_title[0];
          const socCode = soc_code[0];

          if (!socCode || !jobTitle) {
            return null;
          }

          return {
            job_title: jobTitle,
            soc_code: socCode,
          };
        })
        .filter(Boolean) as IConnectionJobViz[];
    }

    return jobVizConnections as IConnectionJobViz[];
  }, []);

  if (!jobVizConnectionsArr?.length) {
    console.error(
      "Developer Error: 'jobVizConnectionsArr' is populated, but the component does not handle this case. Please check the JobVizConnections implementation."
    );

    return (
      <div className="mt-4 text-red-600 font-semibold">
        Error: Unable to load job connections for this unit. Please try again
        later.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">
        Jobs and careers related to the &quot;{unitTitle}&quot; unit:
      </h3>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        {jobVizConnectionsArr.map(({ job_title }, index) => {
          return (
            <li key={index} className="text-base">
              {job_title}
            </li>
          );
        })}
      </ul>
      <GpPlusBtn onClick={handleJobVizConnectionBtnClick}>
        <div
          style={{ lineHeight: '23px', fontSize: '18px' }}
          className="d-flex flex-column text-black"
        >
          Preview job exploration assignment
        </div>
      </GpPlusBtn>
    </div>
  );
};

export default JobVizConnections;
