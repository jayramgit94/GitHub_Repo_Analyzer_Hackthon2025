"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import StarRating from "./StarRating";

interface ReviewCardProps {
  review: {
    _id: string;
    userName: string;
    rating: number;
    comment: string;
    githubUrl?: string;
    createdAt: string;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Generate a consistent gradient for the avatar
  const gradients = [
    "from-primary-500 to-primary-600",
    "from-accent-500 to-accent-600",
    "from-purple-500 to-pink-500",
    "from-cyan-500 to-blue-500",
    "from-orange-500 to-red-500",
  ];
  const gradientIdx = review.userName.charCodeAt(0) % gradients.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-static p-6 group hover:border-[var(--primary)] transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradients[gradientIdx]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
          >
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-[var(--foreground)] text-sm">
              {review.userName}
            </h4>
            <p className="text-xs text-[var(--muted-fg)]">{date}</p>
          </div>
        </div>
        <StarRating rating={review.rating} readOnly size="sm" />
      </div>

      <p className="text-sm text-[var(--foreground)] opacity-85 leading-relaxed">
        {review.comment}
      </p>

      {review.githubUrl && (
        <a
          href={review.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-[var(--primary)] hover:underline underline-offset-2"
        >
          <ExternalLink size={12} />
          Analyzed Repo
        </a>
      )}
    </motion.div>
  );
}
