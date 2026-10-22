import { motion } from "framer-motion";

interface BtncomponentsProps {
  label: string;
}

const Btncomponents = ({ label }: BtncomponentsProps) => {
  return (
    <motion.button
      className="inline-flex h-11 w-fit shrink-0 cursor-pointer items-center justify-center rounded-full bg-black px-5 text-sm whitespace-nowrap text-white"
      aria-label={label}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
    >
      <span className="relative overflow-hidden">
        <motion.span
          className="block"
          variants={{ rest: { y: "0%" }, hover: { y: "-100%" } }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          aria-hidden="true"
        >
          {label}
        </motion.span>
        <motion.span
          className="absolute inset-0 block"
          variants={{ rest: { y: "100%" }, hover: { y: "0%" } }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          aria-hidden="true"
        >
          {label}
        </motion.span>
      </span>
    </motion.button>
  );
};

export default Btncomponents;