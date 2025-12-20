import styles from './Loading.module.css';

interface LoadingProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly text?: string;
}

export function Loading({ size = 'md', text }: LoadingProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
}