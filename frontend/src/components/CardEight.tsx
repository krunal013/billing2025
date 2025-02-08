
import { NavLink } from 'react-router-dom';
import { BsClockHistory } from "react-icons/bs";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit } from "react-icons/fi";

interface CardEightProps {
  TotalDueFees: number;
}

const CardEight: React.FC<CardEightProps> = ({ TotalDueFees }) => {
  const [prevAmount, setPrevAmount] = useState(TotalDueFees);
  const [digits, setDigits] = useState<string[]>(
    TotalDueFees.toFixed(2).split(''),
  );

  useEffect(() => {
    if (TotalDueFees !== prevAmount) {
      const newDigits = TotalDueFees.toFixed(2).split('');
      setTimeout(() => {
        setDigits(newDigits);
      }, 100); // Small delay for smooth transition
      setPrevAmount(TotalDueFees);
    }
  }, [TotalDueFees, prevAmount]);

  return (
    <React.Fragment>
      <NavLink to="/InvoiceTable">
        <div className="rounded-xl border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark transition hover:border-[#3c4fe073] hover:scale-105 cursor-pointer">
          <div className="flex h-11.5 w-11.5 text-3xl text-danger items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
          <BsClockHistory />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
            <h4 className="text-title-md font-bold text-meta-1 dark:text-white flex">
            ₹
            {TotalDueFees
              .toString()
              .split('')
              .map((digit, index) => (
                <div key={index} className="relative w-4 h-8 overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={`${digit}-${index}`}
                      initial={{
                        y: prevAmount < TotalDueFees ? '100%' : '-100%',
                        opacity: 0,
                      }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{
                        y: prevAmount < TotalDueFees ? '-100%' : '100%',
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.4 + index * 0.05, // Faster but still staggered
                        ease: [0.25, 1, 0.5, 1], // Smooth easing
                      }}
                      className="absolute w-full text-center leading-tight"
                    >
                      {digit}
                    </motion.span>
                  </AnimatePresence>
                </div>
              ))}
          </h4>
              <span className="text-sm font-medium">Total Due</span>
            </div>

            <div className="flex space-x-2">
              <React.Fragment>
                <NavLink to="/InvoiceTable">
                  <button className="flex h-10 w-10 text-lg items-center justify-center rounded-full border border-[#b5d8fc] text-white bg-primary  transition duration-300 hover:scale-125 relative group">
                  <FiEdit />
                    <span className="absolute flex bottom-full border border-[#3c4fe073] mb-2 transform opacity-0 group-hover:opacity-100 text-center text-black bg-white rounded px-2 py-1 text-xs transition-opacity whitespace-nowrap">
                      Edit Due
                    </span>
                  </button>
                </NavLink>
              </React.Fragment>
            </div>
          </div>
        </div>
      </NavLink>
    </React.Fragment>
  );
};

export default CardEight;
