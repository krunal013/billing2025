import axios from 'axios';
import { useEffect, useState } from 'react';
// import ChartThree from '../../components/ChartThree.tsx';
import ChartOne from '../../components/ChartOne.tsx';
import ChartTwo from '../../components/ChartTwo.tsx';

import CardOne from '../../components/CardOne.tsx';
import CardTwo from '../../components/CardTwo.tsx';
import CardThree from '../../components/CardThree.tsx';
import CardFour from '../../components/CardFour.tsx';
import CardFive from '../../components/CardFive.tsx';
import CardSix from '../../components/CardSix.tsx';
import CardSeven from '../../components/CardSeven.tsx';
import CardEight from '../../components/CardEight.tsx';
// import ChatCard from '../../components/ChatCard.tsx';
// import DueSlider from '../../components/DueSlider.tsx'
// import MapOne from '../../components/MapOne.tsx';
import Latest from '../../components/Latest.tsx';
// import TableOne from '../../components/CompanyList.tsx';
import CardCarousel from '../../components/CardCarousel.tsx';
// import  Form  from "../Form/form.tsx"

interface Company {
  _id: string;
}
interface Invoices {
  _id: string;
}

const currentYear = new Date().getFullYear();
const baseUrl = import.meta.env.VITE_BASE_APP_BACKEND_BASEURL;
const ECommerce: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoices[]>([]);
  const [totalDue, setTotalDue] = useState<number | null>(null);
  const [latestInvoices, setLatestInvoices] = useState<any[]>([]);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalProfessionalFees, setTotalProfessionalFees] = useState<number>(0);
  const [totalReimbursementFees, setTotalReimbursementFees] =
    useState<number>(0);
  const [totalDueFees, setTotalDueFees] = useState<number>(0);

  const [invoiceData, setInvoiceData] = useState({
    totalDueAmount: 0, // This should match the backend response
    totalPaidAmount: 0, // This should match the backend response
    companyDueAmounts: [], // This matches the companyDueAmounts array in the backend response
  });

  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/companies`);
        setCompanies(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/get_invoice`,
        );
        setInvoices(response.data.invoices); // Access the invoices array
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get<{ totalDueAmount: number }>(
          `${baseUrl}/api/total_due_amount`,
        );
        setTotalDue(response.data.totalDueAmount);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    const fetchLatestInvoices = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/latest_invoice`,
        );
        setLatestInvoices(response.data.invoices); // Store the fetched invoices
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setLoading(false);
      }
    };

    fetchLatestInvoices();
  }, []);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/invoice-summary`,
        );
        setInvoiceData(response.data);
      } catch (error) {
        console.error('Error fetching invoice data:', error);
      }
    };

    fetchInvoiceData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `${baseUrl}/api/invoice/summary/yearly/${selectedYear}`;
        if (selectedMonth !== null) {
          url = `${baseUrl}/api/invoice/summary/monthly/${selectedYear}`;
        }

        const response = await axios.get(url);
        if (selectedMonth === null) {
          // Yearly summary response
          const { summary } = response.data;
          setTotalAmount(summary?.total_Amount || 0);
          setTotalProfessionalFees(summary?.total_ProfessionalFees || 0);
          setTotalReimbursementFees(summary?.total_ReimbursementExpenses || 0);
          setTotalDueFees(summary?.total_due || 0);
        } else {
          // Monthly summary response
          const monthData = response.data.monthlySummary.find(
            (m: any) => m._id.month === selectedMonth,
          );
          setTotalAmount(monthData?.total_Amount || 0);
          setTotalProfessionalFees(monthData?.total_ProfessionalFees || 0);
          setTotalReimbursementFees(
            monthData?.total_ReimbursementExpenses || 0,
          );
          setTotalDueFees(monthData?.total_due || 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardOne totalCompanies={companies.length} />
        <CardTwo totalInvoices={invoices.length} />
        <CardFour data={invoiceData} />
        <CardThree totalDue={totalDue} />
      </div>

      <div className='border-2 border-[#9ac2ff9f] mt-6 pt-5 pb-10 pr-5 pl-5  rounded-lg'>
      <div className="flex items-center space-x-4 py-7 p-3">
        <h4 className="text-title-md font-bold text-black dark:text-white">
          Select Year & Month
        </h4>
        <select
          className="border p-1 text-white bg-primary font-semibold rounded-md transition-all duration-300 ease-in-out transform active:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(parseInt(e.target.value));
            setSelectedMonth(null); // Reset month when year changes
          }}
        >
          {[2022, 2023, 2024, 2025].map((year) => (
            <option className='bg-white text-black' key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          className="border p-1 text-white bg-primary font-semibold rounded-md transition-all duration-300 ease-in-out transform active:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={selectedMonth || ''}
          onChange={(e) =>
            setSelectedMonth(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option  value="">All Months</option>
          {[...Array(12)].map((_, index) => (
            <option className='bg-white text-black' key={index + 1} value={index + 1}>
              {new Date(0, index).toLocaleString('default', {
                month: 'long',
              })}
            </option>
          ))}
        </select>
      </div>
      {/* Display Summary Cards */}

      <div className="grid grid-cols-1  gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardFive totalAmount={totalAmount} />
        <CardSix totalProfessionalFees={totalProfessionalFees} />
        <CardSeven totalReimbursementFees={totalReimbursementFees} />
        <CardEight TotalDueFees={totalDueFees} />
      </div>
      </div>
      <div className="max-w-[347px] sm:max-w-[159px] md:max-w-[200px] lg:max-w-[317px] pb-10 pt-10">
        <CardCarousel />
      </div>

      <br />
      <div className="grid grid-cols-[1fr_1fr] gap-4">
        <div>
          <Latest invoices={latestInvoices} />
        </div>
        <div>
          <ChartTwo data={invoiceData} />
        </div>
      </div>

      {/* <Form/> */}
      <div className="mt-4 grid grid-cols-2 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        {/* <ChartTwo data={invoiceData} /> */}
        {/* <ChartThree /> */}

        {/* <Latest invoices={latestInvoices} /> */}
        <div className="col-span-12 xl:col-span-8">{/* <TableOne /> */}</div>
        {/* <ChatCard /> */}
      </div>
    </>
  );
};

export default ECommerce;
