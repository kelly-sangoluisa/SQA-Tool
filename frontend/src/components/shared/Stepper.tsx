import React from 'react';
import styles from './Stepper.module.css';

type Props = {
  currentStep: number;
};

export default function Stepper({ currentStep }: Props) {
  const getStepStatus = (step: number): 'in_progress' | 'completed' | 'cancelled' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'in_progress';
    return 'cancelled';
  };

  return (
    <div className={styles.stepper}>
      <div className={styles.stepperInner}>
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${styles[getStepStatus(step)]}`}>
                {getStepStatus(step) === 'completed' ? (
                  <svg
                    className={styles.checkIcon}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <div className={styles.stepContent}>
                <p className={styles.stepLabel}>{`Paso ${step}`}</p>
                <p className={styles.stepTitle}>
                  {step === 1 && 'Información'}
                  {step === 2 && 'Estándar'}
                  {step === 3 && 'Criterios'}
                  {step === 4 && 'Subcriterios'}
                </p>
              </div>
            </div>

            {step < 4 && (
              <div className={`${styles.stepDivider} ${currentStep > step ? styles.completed : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
