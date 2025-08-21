import { motion, AnimatePresence } from "framer-motion";

const ConfirmDeleteDialog = ({
  open,
  handleClose,
  deleteHandler,
}: {
  open: boolean;
  handleClose: () => void;
  deleteHandler: () => void;
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl bg-neutral-100 dark:bg-neutral-950 p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Confirm Delete
            </h2>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-400">
              Are you sure you want to delete this group?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
              >
                No
              </button>
              <button
                onClick={deleteHandler}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Yes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDeleteDialog;
