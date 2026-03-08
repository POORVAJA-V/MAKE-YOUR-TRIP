import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '../utils/animations';

const PageWrapper = ({ children, className = "" }) => (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className={`min-h-screen pb-20 pt-20 px-4 md:px-8 ${className}`}>
        {children}
    </motion.div>
);

export default PageWrapper;
