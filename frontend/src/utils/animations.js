export const pageVariants = {
    initial: { opacity: 0, y: 30, filter: "blur(5px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -30, filter: "blur(5px)", transition: { duration: 0.4 } }
};

export const cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    hover: {
        y: -10,
        scale: 1.02,
        boxShadow: "0px 20px 40px rgba(0,0,0,0.12)",
        transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    tap: { scale: 0.97, boxShadow: "0px 5px 10px rgba(0,0,0,0.1)" }
};

export const btnVariants = {
    hover: { scale: 1.05, boxShadow: "0px 10px 20px rgba(59,130,246,0.4)" },
    tap: { scale: 0.95 }
};

export const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};
