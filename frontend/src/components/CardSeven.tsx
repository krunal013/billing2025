
import { HiOutlineCash } from "react-icons/hi";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CardSevenProps {
  totalReimbursementFees: number;
}

const CardSeven: React.FC<CardSevenProps> = ({ totalReimbursementFees }) => {
  const [prevAmount, setPrevAmount] = useState(totalReimbursementFees);
  const [digits, setDigits] = useState<string[]>(totalReimbursementFees.toFixed(2).split(""));

  useEffect(() => {
    if (totalReimbursementFees !== prevAmount) {
      const newDigits = totalReimbursementFees.toFixed(2).split("");
      setTimeout(() => {
        setDigits(newDigits);
      }, 100); // Small delay for smooth transition
      setPrevAmount(totalReimbursementFees);
    }
  }, [totalReimbursementFees, prevAmount]);

  return (
    
        <div className="rounded-xl border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark transition ">
          <div className="flex h-11.5 w-11.5 text-3xl text-primary items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
          <HiOutlineCash />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
            <h4 className="text-title-md font-bold text-black dark:text-white flex">
            ₹
            {totalReimbursementFees
              .toString()
              .split('')
              .map((digit, index) => (
                <div key={index} className="relative w-4 h-8 overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={`${digit}-${index}`}
                      initial={{
                        y: prevAmount < totalReimbursementFees ? '100%' : '-100%',
                        opacity: 0,
                      }}
                      animate={{ y: '0%', opacity: 1 }}
                      exit={{
                        y: prevAmount < totalReimbursementFees ? '-100%' : '100%',
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
              <span className="text-sm font-medium">Total Reimbursement</span>
            </div>

            <div className="flex space-x-2">
              {/* <React.Fragment>
                <NavLink to="/forms/form">
                  <button className="flex h-10 w-10 text-lg items-center justify-center rounded-full border border-[#b5d8fc] text-primary hover:bg-[#b5d2fc] transition duration-300 hover:scale-125 relative group">
                    <FaPlus />
                    <span className="absolute flex bottom-full border border-[#3c4fe073] mb-2 transform opacity-0 group-hover:opacity-100 text-center text-black bg-white rounded px-2 py-1 text-xs transition-opacity whitespace-nowrap">
                      Add Invoice
                    </span>
                  </button>
                </NavLink>
              </React.Fragment> */}
            </div>
          </div>
        </div>
     
  );
};

export default CardSeven;
