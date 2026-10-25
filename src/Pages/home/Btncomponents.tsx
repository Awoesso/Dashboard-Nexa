interface BtncomponentsProps {
  label: string;
}

const Btncomponents = ({ label }: BtncomponentsProps) => {
  return (
    <button
      type="button"
      className="public-cta inline-flex h-11 w-fit shrink-0 cursor-pointer items-center justify-center rounded-full bg-black px-5 text-sm whitespace-nowrap text-white"
      aria-label={label}
    >
      <span className="relative overflow-hidden">
        <span className="public-cta-label block" aria-hidden="true">
          {label}
        </span>
        <span className="public-cta-label-hover absolute inset-0 block" aria-hidden="true">
          {label}
        </span>
      </span>
    </button>
  );
};

export default Btncomponents;