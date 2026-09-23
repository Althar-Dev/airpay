'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface NumberPadProps {
  onInput: (digit: string) => void;
  onDelete: () => void;
}

export function NumberPad({ onInput, onDelete }: NumberPadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full max-w-[260px] mx-auto">
      {numbers.map((num) => (
        <Button
          key={num}
          type="button"
          className="h-11 sm:h-12 w-full rounded-xl text-base sm:text-lg font-headline font-black border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-yellow dark:hover:bg-neo-yellow text-black dark:text-white dark:hover:text-black shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          onClick={() => onInput(num.toString())}
        >
          {num}
        </Button>
      ))}
      <div className="h-11 sm:h-12" />
      <Button
        type="button"
        className="h-11 sm:h-12 w-full rounded-xl text-base sm:text-lg font-headline font-black border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-yellow dark:hover:bg-neo-yellow text-black dark:text-white dark:hover:text-black shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        onClick={() => onInput('0')}
      >
        0
      </Button>
      <Button
        type="button"
        className="h-11 sm:h-12 w-full rounded-xl border-2 border-black dark:border-zinc-700 bg-neo-coral text-white hover:bg-rose-600 shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center"
        onClick={onDelete}
        aria-label="Delete last digit"
      >
        <ArrowLeft className="h-4.5 w-4.5 stroke-[3]" />
      </Button>
    </div>
  );
}
