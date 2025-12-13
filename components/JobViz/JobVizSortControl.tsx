import * as React from "react";
import styles from "../../styles/jobvizBurst.module.scss";
import { LucideIcon } from "./LucideIcon";
import {
  JOBVIZ_DEFAULT_SORT_OPTION,
  JOBVIZ_SORT_OPTIONS,
  getSortOptionById,
  type JobVizSortOption,
} from "./jobvizSorting";

interface JobVizSortControlProps {
  options?: JobVizSortOption[];
  activeOptionId?: string;
  onChange?: (optionId: string) => void;
}

export const JobVizSortControl: React.FC<JobVizSortControlProps> = ({
  options = JOBVIZ_SORT_OPTIONS,
  activeOptionId = JOBVIZ_DEFAULT_SORT_OPTION.id,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const focusIndicatorRef = React.useRef<HTMLButtonElement | null>(null);
  const [pulseOptionId, setPulseOptionId] = React.useState<string | null>(null);
  const activeOption = React.useMemo(
    () => getSortOptionById(activeOptionId),
    [activeOptionId]
  );
  React.useEffect(() => {
    const handleSortFocus = (event: Event) => {
      const detail = (event as CustomEvent<{ optionId?: string }>).detail;
      const targetId = detail?.optionId ?? JOBVIZ_DEFAULT_SORT_OPTION.id;
      onChange?.(targetId);
      setOpen(true);
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setPulseOptionId(targetId);
      if (focusIndicatorRef.current) {
        focusIndicatorRef.current.dataset.pulse = "true";
        window.setTimeout(() => {
          if (focusIndicatorRef.current) {
            focusIndicatorRef.current.dataset.pulse = "false";
          }
        }, 1200);
      }
      window.setTimeout(() => setPulseOptionId(null), 1500);
    };
    window.addEventListener("jobviz-sort-focus", handleSortFocus);
    return () => window.removeEventListener("jobviz-sort-focus", handleSortFocus);
  }, [onChange]);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      if (!(event.target instanceof Node)) return;
      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleSelect = (optionId: string) => {
    onChange?.(optionId);
    setOpen(false);
  };

  return (
    <div className={styles.sortControl} id="jobviz-sort-control" ref={containerRef}>
      <button
        type="button"
        className={`${styles.sortButton} ${open ? styles.sortButtonOpen : ""}`}
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
        data-pulse="false"
        ref={focusIndicatorRef}
      >
        <span className={styles.sortButtonLabel}>Sort by</span>
        <span className={styles.sortButtonValue}>{activeOption.label}</span>
        <LucideIcon
          name={activeOption.icon}
          className={styles.sortButtonDirectionIcon}
        />
      </button>
      {open && (
        <div className={styles.sortDropdown} role="menu">
          {options.map((option) => {
            const isActive = option.id === activeOption.id;
            return (
              <button
                type="button"
                key={option.id}
                className={`${styles.sortOption} ${
                  isActive ? styles.sortOptionActive : ""
                } ${
                  pulseOptionId === option.id ? styles.sortOptionPulse : ""
                }`}
                onClick={() => handleSelect(option.id)}
                role="menuitemradio"
                aria-checked={isActive}
              >
                <span className={styles.sortOptionText}>
                  <span>{option.label}</span>
                  {option.detail && (
                    <span className={styles.sortOptionDetail}>
                      {option.detail}
                    </span>
                  )}
                </span>
                <LucideIcon
                  name={option.icon}
                  className={styles.sortOptionIcon}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
