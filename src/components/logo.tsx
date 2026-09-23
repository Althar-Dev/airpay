import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  imgClassName?: string;
  hideText?: boolean;
}

export function Logo({ className, imgClassName, hideText = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/img/logo.png"
        alt="AirPay Logo"
        width={500}
        height={500}
        unoptimized
        priority
        className={cn("shrink-0 object-contain [image-rendering:-webkit-optimize-contrast]", imgClassName)}
      />
      {!hideText && (
        <span className="font-headline font-black text-xl tracking-tighter text-foreground select-none">
          Air<span className="text-primary">Pay</span>
        </span>
      )}
    </div>
  );
}
