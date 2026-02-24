"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

export default function StarRating({
  rating,
  onChange,
  size = "md",
  readOnly = false,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  const sizeMap = { sm: 16, md: 22, lg: 28 };
  const iconSize = sizeMap[size];

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        return (
          <motion.button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            whileHover={!readOnly ? { scale: 1.2 } : undefined}
            whileTap={!readOnly ? { scale: 0.9 } : undefined}
            className={`${readOnly ? "cursor-default" : "cursor-pointer"} focus:outline-none p-0.5`}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={iconSize}
              className={`transition-colors duration-150 ${
                filled
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(245,158,11,0.4)]"
                  : "fill-none text-[var(--border)]"
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
