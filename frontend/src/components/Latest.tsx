import React from 'react';
import { FaArrowRight } from 'react-icons/fa6';
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
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get today's date in the required format
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Ensure the table has at least 6 rows to prevent stretching issue
  const minRows = 6;
  const extraRows = Math.max(0, minRows - invoices.length);

  return (
    <div className="container  w-full max-w-[850px] mx-auto shadow-md border border-[#7272722b]">
      <h1 className="text-black tracking-wider p-4 text-lg sm:text-xl">
        <span className="text-2xl font-bold">Recent Bills </span>
        <span className="text-lg">
          ( latest Bills till{' '}
          <span className="font-semibold">{currentDate}</span> )
        </span>
      </h1>

      <div className="overflow-x-auto bg-white border-t border-[#23232318] relative">
        <table className="min-w-full table-auto h-auto">
          <thead>
            <tr className="bg-[#e4effd] font-bold text-black border-[#23232318] border-b uppercase text-sm leading-normal">
              <th className="py-3 px-6 border-r border-[#23232318] text-center">
                Company
              </th>
              <th className="py-3 px-6 border-r border-[#23232318] text-center">
                Date
              </th>
              <th className="py-3 px-6 border-r border-[#23232318] text-center">
                Total Amount
              </th>
              <th className="py-3 px-6 text-center">Due Amount</th>
            </tr>
          </thead>

          <tbody className="text-black-2 text-md font-light">
            {invoices.map((invoice, index) => (
              <tr
                key={index}
                className="border-b border-[#23232318] hover:bg-[#a1a1a117]"
              >
                <td className="py-3 px-6 text-center border-r border-[#23232318] whitespace-nowrap">
                  <span className="font-medium">{invoice.companyName}</span>
                </td>
                <td className="py-3 px-6 font-medium border-r border-[#23232318] text-center">
                  <span>{formatDate(invoice.date)}</span>
                </td>
                <td className="py-3 px-6 font-medium border-r  border-[#23232318] text-center">
                  <span>₹{invoice.totalAmount}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span className=" font-medium">₹{invoice.dueAmount}</span>
                </td>
              </tr>
            ))}

            {/* Fill extra rows with empty placeholders to maintain structure */}
            {Array.from({ length: extraRows }).map((_, index) => (
              <tr
                key={`empty-${index}`}
                className="border-b border-[#23232318]"
              >
                <td className="py-3 px-6 text-center text-gray-400 border-[#23232318]">
                  -
                </td>
                <td className="py-3 px-6 text-gray-400 border-[#23232318] text-center">
                  -
                </td>
                <td className="py-3 px-6 text-gray-400 border-[#23232318] text-center">
                  -
                </td>
                <td className="py-3 px-6 text-center text-gray-400">-</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>

        <div className="absolute bottom-0 left-0 w-full flex justify-center py-4">
          <NavLink to="/InvoiceTable">
            <button className="text-primary hover:scale-110 transition duration-300 rounded-full px-4 py-2 flex gap-1">
              View More <FaArrowRight className="mt-1" />
            </button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Latest;
