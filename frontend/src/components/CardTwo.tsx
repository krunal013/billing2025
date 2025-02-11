import { FaPlus } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { TbFileInvoice } from "react-icons/tb";
import React, { useState } from "react";

interface CardTwoProps {
  totalInvoices: number;
}

const CardTwo: React.FC<CardTwoProps> = ({ totalInvoices }) => {
  const [showCardTooltip, setShowCardTooltip] = useState(false);

  return (
    <React.Fragment>
      <NavLink to="/InvoiceTable">
        <div
          className="relative rounded-xl border border-stroke bg-white py-6 px-7.5 dark:border-strokedark dark:bg-boxdark transition hover:border-[#3c4fe073] hover:scale-105 cursor-pointer"
          onMouseEnter={() => setShowCardTooltip(true)}
          onMouseLeave={() => setShowCardTooltip(false)}
        >
          {/* Tooltip for View Invoices - Positioned at Top Right */}
          {showCardTooltip && (
            <div className="absolute top-0 right-0 transform translate-y-[-60%] translate-x-[-10%] bg-white text-black text-xs border border-[#3c4fe073] rounded-lg px-2 py-1 shadow-md">
              Click to view Invoices
            </div>
          )}

          {/* Icon */}
          <div className="flex h-11.5 w-11.5 text-3xl text-primary items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <TbFileInvoice />
          </div>

          {/* Content */}
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {totalInvoices}
              </h4>
              <span className="text-sm text-black font-medium">
                Total Invoices
              </span>
            </div>

            {/* Add Invoice Button */}
            <div className="flex space-x-2 relative">
              <NavLink to="/forms/form">
                <button className="flex h-10 w-10 text-lg items-center justify-center rounded-full border border-[#b5d8fc] text-white bg-primary transition duration-300 hover:scale-125 relative group">
                  <FaPlus />
                  {/* Tooltip for Add Invoice */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs border border-[#3c4fe073] rounded px-2 py-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    Add Invoice
                  </div>
                </button>
              </NavLink>
            </div>
          </div>
        </div>
      </NavLink>
    </React.Fragment>
  );
};

export default CardTwo;
