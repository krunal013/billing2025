import React from 'react';
import { FaArrowRight } from "react-icons/fa6";
import { NavLink } from 'react-router-dom';

interface Invoice {
  companyName: string;
  date: string;
  totalAmount: number;
  dueAmount: number;
}

interface LatestProps {
  invoices: Invoice[];
}

const Latest: React.FC<LatestProps> = ({ invoices }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      };
      
  return (
    <div className="container w-[850px] h-[380px]  mx-auto px-3 py-0">
      <div className="overflow-hidden bg-white shadow-md border border-[#b8d4f579] relative">
        <table className="min-w-full table-auto h-[432px]">
          <thead>
            <tr className="bg-gray-200 text-black border-[#23232348] border-b uppercase text-sm leading-normal">
              <th className="py-3 px-6 border-r border-[#23232348] text-center">Company</th>
              <th className="py-3 px-6 border-r border-[#23232348] text-center">Date</th>
              <th className="py-3 px-6 border-r border-[#23232348] text-center">Total Amount</th>
              <th className="py-3 px-6 text-center">Due Amount</th>
            </tr>
          </thead>
          <tbody className="text-black text-md font-light">
            {invoices.map((invoice, index) => (
              <tr key={index} className="border-b  border-[#23232318]  hover:bg-gray-100">
                <td className="py-3 px-6 text-center text-black border-[#23232318] border-r whitespace-nowrap">
                  <span className="font-medium">{invoice.companyName}</span>
                </td>
                <td className="py-3 px-6 border-r text-black border-[#23232318] text-center">
                  <span>{formatDate(invoice.date)}</span>
                </td>
                <td className="py-3 px-6 border-r text-black border-[#23232318] text-center">
                  <span>₹{invoice.totalAmount}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span className="text-black">₹{invoice.dueAmount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-full flex justify-center py-4">
       <React.Fragment>
        <NavLink to="/InvoiceTable">
         <button className=" text-primary  rounded-full px-4 py-2 flex gap-1">View More <FaArrowRight className='mt-1' /></button>
           </NavLink>
       </React.Fragment>
        
        </div>
      </div>
    </div>
  );
};

export default Latest;
