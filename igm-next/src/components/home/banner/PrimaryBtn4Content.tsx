export function PrimaryBtn4Content({ label }: { label: string }) {
  return (
    <>
      <span className="icon">
        <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="none"
            stroke="currentColor"
            d="M1 9L9 1M9 1C7.22222 1.33333 3.33333 2 1 1M9 1C8.66667 2.66667 8 6.33333 9 9"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="content">{label}</span>
      <span className="icon two">
        <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="none"
            stroke="currentColor"
            d="M1 9L9 1M9 1C7.22222 1.33333 3.33333 2 1 1M9 1C8.66667 2.66667 8 6.33333 9 9"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </>
  );
}
