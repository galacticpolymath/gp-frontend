import React, { useMemo } from 'react';
import { IJobVizConnection } from '../../../backend/models/Unit/JobViz';
import {
  IConnectionJobViz,
} from '../../../backend/models/Unit/JobViz';

interface IJobVizConnectionsProps {
  unitTitle: string;
  jobVizConnections?: IConnectionJobViz[] | IJobVizConnection[] | null;
}

const JobVizConnections: React.FC<IJobVizConnectionsProps> = ({
  jobVizConnections,
  unitTitle,
}) => {
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
      <button
        className="flex items-center gap-2 px-6 py-3 bg-white border-4 border-blue-600 rounded-full text-black font-bold text-lg hover:bg-blue-50 transition-colors"
        onClick={() => {
          // TODO: Add preview job exploration assignment functionality
          console.log('Preview job exploration assignment clicked');
        }}
      >
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Preview job exploration assignment
      </button>
    </div>
  );
};

export default JobVizConnections;
