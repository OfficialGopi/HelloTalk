import { motion, AnimatePresence, type Variants } from "framer-motion";
import React from "react";

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 40,
    scale: 0.95,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const CallModal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          className="fixed inset-0  z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            key="modal"
            className="relative w-full max-w-5xl mx-auto flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Your call UI goes here */}
            <div className="flex flex-col sm:flex-row w-full h-full">
              {children}
            </div>
            {onClose && (
              <button
                className="absolute top-3 right-3 text-neutral-400 hover:text-white"
                onClick={onClose}
              >
                ✕
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallModal;
