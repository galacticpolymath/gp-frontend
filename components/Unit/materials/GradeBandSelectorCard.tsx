import React from 'react';
import { GraduationCap } from 'lucide-react';
import RichText from '../../RichText';
import styles from '../UnitPage.module.css';
import { IItemForUI, INewUnitLesson, IResource } from '../../../backend/models/Unit/types/teachingMaterials';

type TGradeBandSelectorCardProps = {
  teachingMaterialsPreface?: string | null;
  shouldShowGradeBandChooser: boolean;
  classroomResources: IResource<INewUnitLesson<IItemForUI>>[];
  unitId: number | string;
  selectedResourceIndex: number;
  hasMultipleGradeBandOptions: boolean;
  setSelectedResourceIndex: (index: number) => void;
};

const GradeBandSelectorCard: React.FC<TGradeBandSelectorCardProps> = ({
  teachingMaterialsPreface,
  shouldShowGradeBandChooser,
  classroomResources,
  unitId,
  selectedResourceIndex,
  hasMultipleGradeBandOptions,
  setSelectedResourceIndex,
}) => {
  if (!teachingMaterialsPreface && !shouldShowGradeBandChooser) {
    return null;
  }

  return (
    <div
      id="unit-search-materials-preface"
      className={styles.gradeBandSelectorCard}
    >
      {teachingMaterialsPreface && (
        <div className={styles.gradeBandPreface}>
          <RichText content={teachingMaterialsPreface} />
        </div>
      )}
      {shouldShowGradeBandChooser && (
        <div className={styles.gradeBandChooser}>
          <h4 className={styles.gradeBandHeading}>
            <GraduationCap size={15} aria-hidden="true" />
            <span>Available Grade Bands</span>
          </h4>
          <div className={styles.gradeBandOptions}>
            {classroomResources.map((resource, index) => {
              const label =
                resource.gradePrefix?.trim() ||
                resource.grades?.trim() ||
                `Option ${index + 1}`;
              const optionId = `grade-band-${unitId}-${index}`;
              return (
                <label
                  key={optionId}
                  htmlFor={optionId}
                  className={styles.gradeBandOption}
                >
                  <input
                    id={optionId}
                    type="radio"
                    name={`grade-band-${unitId}`}
                    checked={selectedResourceIndex === index}
                    onChange={() => setSelectedResourceIndex(index)}
                    disabled={!hasMultipleGradeBandOptions}
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeBandSelectorCard;
