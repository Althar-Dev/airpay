"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        let IconComponent = CheckCircle2;
        let badgeBg = "bg-emerald-400 text-black";

        if (variant === 'destructive') {
          IconComponent = AlertCircle;
          badgeBg = "bg-white text-rose-600";
        } else if (variant === 'success') {
          IconComponent = CheckCircle2;
          badgeBg = "bg-emerald-400 text-black";
        } else {
          // Default / Info / Warning
          IconComponent = AlertTriangle;
          badgeBg = "bg-amber-300 text-black";
        }

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 w-full">
              <div className={`p-1.5 sm:p-2 rounded-xl border-2 border-black shadow-neo-sm shrink-0 mt-0.5 ${badgeBg}`}>
                <IconComponent className="h-4 w-4 stroke-[3]" />
              </div>

              <div className="grid gap-0.5 flex-1 min-w-0 pr-2">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
