import { cn } from "@/lib/cn";
import { useEffect, useRef } from "react";

interface AutoResizeTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  onChange,
  placeholder = "Type Message Here...",
  className,
}: AutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset first
      const maxHeight = 4 * 24; // ≈ 2 rows → 24px per row (depends on text-base/line-height)
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, maxHeight) + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        "w-full p-2 bg-transparent outline-none resize-none overflow-y-auto text-base leading-6 scrollbar-thin scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-700",
        className
      )}
      rows={1}
    />
  );
};

export default AutoResizeTextarea;
