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
    <div className="grid grid-cols-3 gap-4 justify-items-center">
      {numbers.map((num) => (
        <Button
          key={num}
          type="button"
          variant="default"
          className="h-16 w-16 rounded-full text-2xl font-bold"
          onClick={() => onInput(num.toString())}
        >
          {num}
        </Button>
      ))}
      <div />
      <Button
        type="button"
        variant="default"
        className="h-16 w-16 rounded-full text-2xl font-bold"
        onClick={() => onInput('0')}
      >
        0
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="h-16 w-16 rounded-full"
        onClick={onDelete}
        aria-label="Delete last digit"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
    </div>
  );
}
