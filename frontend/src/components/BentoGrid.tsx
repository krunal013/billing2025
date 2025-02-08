import React from "react";
import { motion } from "framer-motion";
import { FcApproval, FcCheckmark } from "react-icons/fc";

interface BentoGridProps {
  companyName: string;
  invoiceNumber: string;
  totalPayableAmount: string;
  dueAmount: number;
  totalInvoices: number;
}

const BentoGrid: React.FC<BentoGridProps> = ({ companyName, invoiceNumber ,dueAmount,totalPayableAmount}) => {
  // Define reusable animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05 },
  };

  return (
    <div className="bg-white px-2 flex justify-center items-center">
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 max-w-7xl">
        {/* Large header card */}
        <motion.div
          className="col-span-1 md:col-span-2 xl:col-span-3 bg-gray shadow-lg rounded-xl p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          transition={{ duration: 0.3 }}
        >
          <span className="text-7xl">
            <FcApproval />
          </span>
          <div>
            <h3 className="text-xl font-semibold">{companyName} pay total {totalPayableAmount} Amount in 2025</h3>
            <p className="text-lightgray">{dueAmount} is still pending</p>
            <a
              href="#"
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              see the invoices of {companyName} →
            </a>
          </div>
        </motion.div>

        {/* Smaller cards */}
        {[
          {
            title: "Total  invoices generate",
            description: "With Apple parts, tools, and manuals.",
            linkText: "see all invoices →",
          },
          {
            title: "30,000 amount is still due",
            description: "When your local grid is cleaner.",
            linkText: "follow up company for payment →",
          },
          {
            title: "other extra card",
            description: "-",
            linkText: " →",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="bg-white shadow-lg rounded-xl p-6 flex flex-col space-y-2"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="text-green-500 text-3xl mb-2"><FcCheckmark /></div>
            <h4 className="text-lg font-semibold">{item.title}</h4>
            <p className="text-gray-500">{item.description}</p>
            <a
              href="#"
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              {item.linkText}
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BentoGrid;
