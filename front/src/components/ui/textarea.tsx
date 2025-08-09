import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.ComponentPropsWithoutRef<typeof TextareaAutosize> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextareaAutosize
        ref={ref}
        className={cn(
          "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm " +
          "shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 " +
          "focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        minRows={1}
        maxRows={12}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
