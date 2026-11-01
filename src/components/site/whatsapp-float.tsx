"use client";

import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/icons";

export function WhatsAppFloat({ href }: { href: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.6, type: "spring", stiffness: 220, damping: 18 }}
      className="group fixed right-4 bottom-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-wine-800 text-lilac-50 shadow-[0_18px_40px_-12px_rgba(76,15,40,0.7)] ring-4 ring-white/70 transition hover:scale-105 md:right-6 md:bottom-6"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-wine-500/30 [animation-duration:2.8s]" />
      <WhatsAppIcon className="relative size-6" />
    </motion.a>
  );
}
