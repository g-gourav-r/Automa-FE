export function Breadcrumb({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: string;
}) {
  return (
    <nav
      className="flex text-sm text-gray-500 mb-4 cursor-default"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1">
        {steps.map((step, index) => (
          <li key={step} className="inline-flex items-center">
            <span
              className={`${
                step === currentStep
                  ? "text-purple-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <svg
                className="w-4 h-4 mx-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
