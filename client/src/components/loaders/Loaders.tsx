import { motion } from "framer-motion";

const shimmer = {
  initial: { backgroundPosition: "-200% 0" },
  animate: { backgroundPosition: "200% 0" },
  transition: { repeat: Infinity, duration: 1.5, ease: "linear" as const },
};

const LayoutLoader = () => {
  return (
    <div className="grid grid-cols-12 h-[calc(100vh-4rem)] gap-4">
      {/* Left Sidebar */}
      <div className="hidden sm:block sm:col-span-4 md:col-span-3 h-full">
        <motion.div
          className="w-full h-full rounded-md bg-neutral-800 
          bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 
          bg-[length:200%_100%]"
          initial={shimmer.initial}
          animate={shimmer.animate}
          transition={shimmer.transition}
        />
      </div>

      {/* Chat Section */}
      <div className="col-span-12 sm:col-span-8 md:col-span-5 lg:col-span-6 h-full flex flex-col gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <motion.div
            key={index}
            className="w-full h-20 rounded-lg bg-neutral-800 
            bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 
            bg-[length:200%_100%]"
            initial={shimmer.initial}
            animate={shimmer.animate}
            transition={shimmer.transition}
          />
        ))}
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:block md:col-span-4 lg:col-span-3 h-full">
        <motion.div
          className="w-full h-full rounded-md bg-neutral-800 
          bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 
          bg-[length:200%_100%]"
          initial={shimmer.initial}
          animate={shimmer.animate}
          transition={shimmer.transition}
        />
      </div>
    </div>
  );
};

const TypingLoader = () => {
  return (
    <div className="flex items-center justify-center gap-2 p-2">
      {[0, 0.1, 0.2].map((delay, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full bg-neutral-500"
          transition={{
            y: {
              duration: 0.4,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut",
            },
          }}
          animate={{ y: ["0%", "-40%"] }}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );
};

export { TypingLoader, LayoutLoader };
