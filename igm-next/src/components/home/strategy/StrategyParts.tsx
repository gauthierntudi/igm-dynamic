export function StrategyCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.65353 11.6968L7.56353 14.463C8.74893 12.7506 14.0179 4.386 17.0475 0.5C13.9099 6.4268 11.1823 12.6098 8.72913 18.823C8.37712 19.7142 7.12192 19.7294 6.75232 18.8454C5.58372 16.0514 4.32732 13.2748 2.95312 10.577C3.94112 10.3794 4.99472 10.7088 5.65332 11.6968H5.65353Z"
      />
    </svg>
  );
}

function BtnArrowIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M1 9L9 1M9 1C7.22222 1.33333 3.33333 2 1 1M9 1C8.66667 2.66667 8 6.33333 9 9"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        stroke="currentColor"
      />
    </svg>
  );
}

type StrategyCtaProps = {
  label: string;
  href: string;
};

export function StrategyCta({ label, href }: StrategyCtaProps) {
  return (
    <a className="primary-btn5" href={href}>
      {label}
      <BtnArrowIcon />
    </a>
  );
}
