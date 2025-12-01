"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "fixed inset-0 z-[99998] bg-black/80 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Base styles
          "bg-background fixed flex flex-col rounded-lg border shadow-lg",
          // Animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-top-[2%]",
          "data-[state=open]:slide-in-from-top-[2%]",
          "duration-200",
          // Responsive width with proper constraints
          "w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)]",
          "sm:w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)]",
          "md:w-[calc(100vw-3rem)] md:max-w-[min(92vw,1400px)]",
          "lg:w-[calc(100vw-4rem)] lg:max-w-[min(90vw,1600px)]",
          "xl:max-w-[min(88vw,1800px)]",
          "2xl:max-w-[min(85vw,1920px)]",
          // Responsive height
          "max-h-[calc(100vh-1rem)] max-h-[calc(100dvh-1rem)]",
          "sm:max-h-[calc(100vh-2rem)] sm:max-h-[calc(100dvh-2rem)]",
          "md:max-h-[calc(100vh-3rem)] md:max-h-[calc(100dvh-3rem)]",
          "lg:max-h-[calc(100vh-4rem)] lg:max-h-[calc(100dvh-4rem)]",
          // Remove default padding
          "p-0",
          className,
        )}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close 
          className={cn(
            "ring-offset-background focus:ring-ring",
            "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            "absolute z-10 rounded-sm opacity-70",
            "transition-opacity hover:opacity-100",
            "focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
            "disabled:pointer-events-none",
            // Responsive positioning and sizing
            "top-3 right-3 p-1",
            "sm:top-4 sm:right-4 sm:p-1.5",
            "md:top-4 md:right-4",
            "lg:top-5 lg:right-5",
            // Icon sizing
            "[&_svg]:pointer-events-none [&_svg]:shrink-0",
            "[&_svg]:size-4 sm:[&_svg]:size-4 md:[&_svg]:size-5"
          )}
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col space-y-1.5",
        "text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2",
        "sm:flex-row sm:justify-end sm:gap-2",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-semibold leading-none tracking-tight",
        "text-base sm:text-lg md:text-xl lg:text-2xl",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-muted-foreground",
        "text-xs sm:text-sm md:text-base",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
