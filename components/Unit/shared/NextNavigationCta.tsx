import React from 'react';
import { ArrowRight } from 'lucide-react';
import styles from './NextNavigationCta.module.css';

const SquareArrowRightExitIcon: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 15, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M10 12h11" />
    <path d="m17 16 4-4-4-4" />
    <path d="M21 6.344V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.344" />
  </svg>
);

type TNextNavigationCtaProps = {
  activeTab: string;
  materialsTabKey: string;
  creditsTabKey: string;
  isStandalonePreview: boolean;
  nextLessonId: number | null;
  nextTab: { key: string; label: string } | null;
  handleLessonChange: (lessonId: number) => void;
  handleTabChange: (tabKey: string) => void;
};

const NextNavigationCta: React.FC<TNextNavigationCtaProps> = ({
  activeTab,
  materialsTabKey,
  creditsTabKey,
  isStandalonePreview,
  nextLessonId,
  nextTab,
  handleLessonChange,
  handleTabChange,
}) => {
  if (
    isStandalonePreview ||
    !((activeTab === materialsTabKey && nextLessonId != null) || (activeTab !== creditsTabKey && nextTab))
  ) {
    return null;
  }

  return (
    <div className={styles.nextTabCtaWrap}>
      {activeTab === materialsTabKey && nextLessonId != null && (
        <button
          type="button"
          className={styles.nextLessonCta}
          onClick={() => handleLessonChange(nextLessonId)}
        >
          <span>Lesson {nextLessonId}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      )}
      {nextTab && (
        <button
          type="button"
          className={styles.nextTabCta}
          onClick={() => handleTabChange(nextTab.key)}
        >
          <span>Next: {nextTab.label}</span>
          <SquareArrowRightExitIcon size={15} />
        </button>
      )}
    </div>
  );
};

export default NextNavigationCta;
