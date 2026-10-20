import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="text-[8rem] font-extrabold leading-none text-gradient sm:text-[11rem]"
        >
          404
        </motion.div>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist or was moved.</p>
        <Link to="/" className="btn-brand mt-8">Back to home</Link>
      </div>
    </div>
  );
}
