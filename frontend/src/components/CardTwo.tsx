import { FaPlus } from "react-icons/fa6";
import { NavLink } from 'react-router-dom';
import { TbFileInvoice } from "react-icons/tb";
import React from "react";

interface CardTwoProps {
  totalInvoices: number;
}

const CardTwo: React.FC<CardTwoProps> = ({ totalInvoices }) => {
  return (
    <React.Fragment>
        <NavLink to="/InvoiceTable">
        <div className="rounded-xl border border-stroke bg-white py-6 px-7.5  dark:border-strokedark dark:bg-boxdark transition hover:border-[#3c4fe073] hover:scale-105 cursor-pointer">
      <div className="flex h-11.5 w-11.5 text-3xl text-primary items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
      <TbFileInvoice />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {totalInvoices}
          </h4>
          <span className="text-sm text-black font-medium">Total Invoices</span>
        </div>

        <div className="flex space-x-2">
          
             
           

          <React.Fragment>
            <NavLink to="/forms/form">
              <button
                className="flex h-10 w-10 text-lg items-center justify-center rounded-full border border-[#b5d8fc] text-white bg-primary  transition duration-300 hover:scale-125 relative group"
              >
                <FaPlus />
                <span className="absolute flex bottom-full border border-[#3c4fe073] mb-2 transform opacity-0 group-hover:opacity-100 text-center text-black bg-white rounded px-2 py-1 text-xs transition-opacity whitespace-nowrap">
          Add Invoice
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

export default CardTwo;
