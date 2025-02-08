import React, { Key, ReactNode, useEffect, useState } from 'react'; 
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumb';
import BentoGrid from '../../components/BentoGrid'
import { useParams } from 'react-router-dom';
import {  FaEye ,  FaFileInvoice, FaDollarSign, FaCalendarAlt, FaRegClock, FaTools } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { HiOutlineCurrencyRupee } from "react-icons/hi2";
import { FaCreditCard } from 'react-icons/fa';
import { FaIdCard } from 'react-icons/fa';
import { MdOutlineCall } from "react-icons/md";
import { MdOutlineAddIcCall } from "react-icons/md";
import { MdOutlineMail } from "react-icons/md";
import { MdOutlineLocationOn } from "react-icons/md";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BASE_APP_BACKEND_BASEURL;

// interface FeeOrExpense {
//   description: string;
//   amount: number;
// }

// interface Invoice {
//   _id: string;
//   invoiceNumber: string;
//   invoice_date: string;
//   TotalAmount: number;
//   due_amount: number;
//   isPaid: boolean;
//   ProfessionalFees: FeeOrExpense[];
//   ReimbursementExpenses: FeeOrExpense[];
// }

interface Company {
  _id: string;
  companyName: string;
  address: string;
  gstNumber: string;
  cinNumber: string;
  panNumber: string;
  contactPerson: string;
  contactNumber: string;
  alternateNumber: string;
  email: string;
  
    invoices: {
      unpaid_ProfessionalFees: any;
      unpaid_ReimbursementExpenses: any;
      due_amount: number;
      _id: Key | null | undefined;
      TotalAmount: ReactNode;
      ReimbursementExpenses: any;
      ProfessionalFees: any;
      invoice_date: string | number | Date; invoiceNumber: string, totalPayableAmount: number, isPaid: boolean 
  }[];
}

const CompanyProfile: React.FC = () => {
  const { companyId } = useParams(); // Get companyId from URL params
  const [company, setCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false); // State for toggling between view and edit mode
  // const [editableInvoices, setEditableInvoices] = useState<{ [key: string]: boolean }>({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);



  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${baseUrl}/api/companies/${companyId}`);
      navigate("/forms/CompList"); // Fix: Replace navigator with navigate
      // Redirect or update UI after deletion
    } catch (error) {
      console.error("Error deleting company:", error);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const [formData, setFormData] = useState<Company>({
    _id: '',
    companyName: '',
    address: '',
    gstNumber: '',
    cinNumber: '',
    panNumber: '',
    contactPerson: '',
    contactNumber: '',
    alternateNumber: '',
    email: '',
    invoices: [],
  });
  const [activeTab, setActiveTab] = useState('Overview'); // State for active tab
  const [totalPayableAmount, setTotalPayableAmount] = useState(0);
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [totalInvoices, setTotalInvoices] = useState(0);

  useEffect(() => {
    axios.get(`/api/company/${companyId}`)
      .then(response => {
        setDueAmount(response.data.dueAmount); // Set due amount from API response
      })
      .catch(error => console.error("Error fetching company data:", error));
  }, [companyId]); 
  
  

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/companies/profile/${companyId}`);
        const { company, totalPayableAmount, dueAmount, totalInvoices } = response.data;
        setCompany(company);
        setFormData(company); // Pre-fill the form data when the company is fetched
        setTotalPayableAmount(totalPayableAmount);
        setDueAmount(dueAmount);
        setTotalInvoices(totalInvoices);
      } catch (error) {
        console.error('Error fetching company:', error);
      }
    };
  
    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const handleInputChange = (invoiceId: string, field: string, value: number) => {
    setCompany((prevCompany) => {
      if (!prevCompany) return prevCompany;
      return {
        ...prevCompany,
        invoices: prevCompany.invoices.map((inv) =>
          inv._id === invoiceId ? { ...inv, [field]: value } : inv
        ),
      };
    });
  };
  
  const handleBlur = async (invoiceId: string, field: string, value: number) => {
    try {
      const invoiceToUpdate = company?.invoices.find((inv) => inv._id === invoiceId);
      if (!invoiceToUpdate) return;
  
      const updatedDueAmount =
        field === "unpaid_ProfessionalFees"
          ? invoiceToUpdate.due_amount - (value - (invoiceToUpdate.unpaid_ProfessionalFees || 0))
          : invoiceToUpdate.due_amount - (value - (invoiceToUpdate.unpaid_ReimbursementExpenses || 0));
  
      await axios.patch(`${baseUrl}/api/invoices/${invoiceId}`, {
        [field]: value,
        due_amount: updatedDueAmount,
      });
  
      setCompany((prevCompany) => {
        if (!prevCompany) return prevCompany;
        const updatedInvoices = prevCompany.invoices.map((inv) =>
          inv._id === invoiceId
            ? { ...inv, [field]: value, due_amount: updatedDueAmount }
            : inv
        );
      
        return { ...prevCompany, invoices: updatedInvoices };
      });

      setDueAmount((prevDueAmount) => {
        if (field === "unpaid_ProfessionalFees") {
          return prevDueAmount - (value - (invoiceToUpdate.unpaid_ProfessionalFees || 0));
        } else {
          return prevDueAmount - (value - (invoiceToUpdate.unpaid_ReimbursementExpenses || 0));
        }
      });
      
      
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${baseUrl}/api/companies/updatecomp/${companyId}`, formData);
      
      setIsEditing(false);
      setFormData(response.data);

      // Show success toast
      toast.success('Company data updated successfully!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

    } catch (error) {
      console.error('Error updating company:', error);
      
      // Show error toast
      toast.error('Error updating company data.', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
          
              <div>
                <h2 className="text-lg text-right font-semibold mb-4">
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      if (!isEditing) setFormData(company!); // Reset to original data when canceling
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </h2>
              </div>
      
<div className="grid grid-cols-1 text-black  lg:grid-cols-3 gap-4 mt-3">
  {/* Left Section */}
  <div className="border border-[#d1e2ff] shadow rounded-xl p-8 col-span-1 flex flex-col justify-between">
  <div className="flex justify-center">
    <div className="w-20 h-20 text-6xl rounded-full border border-[#0856fff3] font-serif flex items-center justify-center text-primary font-bold">
      <span>{formData.companyName.charAt(0).toUpperCase()}</span>
    </div>
  </div>
  <div className="text-center flex-1">
    {isEditing ? (
      <input
        type="text"
        name="companyName"
        value={formData.companyName}
        onChange={handleChange}
        className="w-full text-center mt-10 rounded p-2"
      />
    ) : (
      <>
        <h2 className="mt-16 font-semibold text-[#232323d2] text-4xl">
          {company?.companyName}
        </h2>
      </>
    )}
  </div>
  <button
        onClick={() => setShowModal(true)}
        className="self-end mx-auto p-3 -mb-3 w-full mt-4 border border-[#ff888896] font-semibold rounded-xl hover:text-meta-1 transition duration-300 hover:scale-105"
      >
        Delete Company
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-black bg-opacity-50 ">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">Confirm Deletion</h2>
            <p>Are you sure you want to delete this company?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-meta-1 text-white rounded-md"
              >
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
</div>


  {/* Right Section */}
  <motion.div
    className="w-full lg:w-[200%] gap-6 "
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8 }}
  >
    <div className=" grid grid-cols-1 md:grid-cols-2 bg-white shadow rounded-lg border border-[#d1e2ff] p-10 h-full lg:h-full gap-3">
      <h2 className="font-semibold text-primary text-center text-xl mb-6">Contact Information</h2>
      <h2 className="font-semibold text-primary text-center text-xl mb-6">Company Information</h2>
      
      <div className="w-full flex flex-col gap-4">
        {[
          { label: "Email", name: "email", icon: <MdOutlineMail className='text-xl text-primary' /> },
          { label: "Contact Number", name: "contactNumber", icon: <MdOutlineCall className='text-xl text-primary' /> },
          { label: "Alternate Number", name: "alternateNumber", icon: <MdOutlineAddIcCall className='text-xl text-primary' /> },
          { label: "Address", name: "address", icon: <MdOutlineLocationOn className='text-3xl -mr-1 text-primary' /> },
        ].map(({ name, icon }) => (
          <div key={name} className="bg-white shadow-sm border border-[#d1e2ff] rounded-xl p-5 flex items-center gap-2">
            {icon}
            {isEditing ? (
              <input
                type="text"
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                className="border rounded p-2 mt-8 w-full"
              />
            ) : (
              <span className="text-gray-700">{(company as any)[name]}</span>
            )}
          </div>
        ))}
                    </div>
                    
      <div className="w-full flex flex-col gap-4">
        {[
          { label: "GST", name: "gstNumber", icon: <FaCreditCard  className='text-primary ml-1' /> },
          { label: "PAN", name: "panNumber", icon: <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
            fill=""
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2" fill="#E0E0E0" />
          <rect x="4" y="6" width="16" height="4" fill="#3c50e0" />
          <rect x="4" y="12" width="8" height="2" fill="#3c50e0" />
          <rect x="4" y="15" width="8" height="2" fill="#3c50e0" />
          <circle cx="18" cy="14" r="3" fill="#3c50e0" />
        </svg> },
          { label: "CIN", name: "cinNumber", icon: <FaIdCard className='text-primary mr-1 ml-1' /> }
        ].map(({ name, icon }) => (
          <div key={name} className="bg-white shadow-sm border border-[#d1e2ff] rounded-xl p-5 flex items-center gap-2">
            {icon}
            {isEditing ? (
              <input
                type="text"
                name={name}
                value={(formData as any)[name]}
                onChange={handleChange}
                className="border rounded p-2 w-full"
              />
            ) : (
              <span className="text-gray-700">{(company as any)[name]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  </motion.div>
</div>

      
              {isEditing && (
                <div className="mt-4 text-right">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-[#a9c7ff] font-semibold hover:scale-110 transition duration-300 text-black rounded hover:bg-green-600"
                  >
                    Update
                  </button>
                </div>
                
              )}
            </motion.div>
            <ToastContainer />
          </>
        );
        case 'Invoices':
          return (
            <div>
              {company?.invoices && company.invoices.length > 0 ? (
                <motion.table
                  className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <thead className="bg-gray text-black">
                    <tr>
                      <th className="py-6 px-6 border-r border-b border-successlight text-center text-lg font-large text-gray-600">
                        <FaFileInvoice className="inline mr-1 mb-1" /> Invoice ID
                      </th>
                      <th className="py-6 px-6 border-r border-b border-successlight text-center  text-lg font-large text-gray-600">
                        <FaDollarSign className="inline mr-1 mb-1" /> Amount
                      </th>
                      <th className="py-6 px-6 border-r border-b border-successlight text-center  text-lg font-large text-gray-600">
                        <FaCalendarAlt className="inline mr-1 mb-1" /> Date
                      </th>
                      <th className="py-6 px-6 border-r border-b border-successlight text-center  text-lg font-large text-gray-600">
                        <FaRegClock className="inline mr-1 mb-1" /> Due Amount
                      </th>
                      <th className="py-6 px-6 border-r border-b border-successlight text-center text-lg font-large text-gray-600">
                        <FaTools className="inline mr-1 mb-1" /> Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(company.invoices) &&
                      company.invoices.map((invoice: any) => (
                        <motion.tr
                          key={invoice._id}
                          className="hover:bg-gray-50 text-black font-medium transition duration-200 ease-in-out"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.80 }}
                        >
                          <td className="py-5 px-6 border-r  text-center border-b border-gray">{invoice.invoiceid}</td>
                          <td className="py-3 px-6 border-r text-center border-b border-gray">{invoice.TotalAmount}</td>
                          <td className="py-3 px-6 border-r text-center border-b border-gray">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-6 text-center border-r border-b border-gray">
                            <span
                              className={invoice.due_amount === 0 ? 'text-success' : 'text-danger'}
                            >
                              {invoice.due_amount === 0 ? 'Paid' : invoice.due_amount}
                            </span>
                          </td> 
                          <td className="py-3 px-6  text-center border-b border-gray">
                            <button className="text-primary hover:underline"><FaEye/></button>
                          </td>
                        </motion.tr>
                      ))}
                  </tbody>
                </motion.table>
              ) : (
                <p className="text-center text-gray-600 mt-4">No invoices available for this company.</p>
              )}
            </div>
        );
      
      case 'Payment Status':
        function setInvoices(arg0: (prevInvoices: any[]) => any[]) {
          throw new Error('Function not implemented.');
        }

        return (
          
          <div>
            <h2 className='mb-5'>{company?.companyName} Have to paid total <span className='text-danger text-xl'>{dueAmount} </span> Due Amount</h2>
              {company?.invoices && company.invoices.length > 0 ? (
                <motion.table
                  className="min-w-full bg-white text-black shadow-lg rounded-lg overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <thead className="bg-gray">
                    <tr>
                      <th className="py-6 px-6 border-r border-b border-successlight text-center font-medium text-gray-600">
                        <FaCalendarAlt className="inline mb-1" /> Date
                      </th>
                      <th className="py-6 px-6 border-r border-b border-successlight text-left font-medium text-gray-600">
                      <HiOutlineCurrencyRupee  className="inline text-xl  mb-1" /> ProfessionalFees
                      </th>
                      <th className="py-6 px-6 border-r border-b border-successlight text-left font-medium text-gray-600">
                      <HiOutlineCurrencyRupee  className="inline text-xl  mb-1" /> ReimbursementExpense
                      </th>
                      <th className="py-6 px-6 border-r border-b border-successlight text-center font-medium text-gray-600">
                        <FaRegClock className="inline mb-1" /> Due
                      </th>
                      <th className="py-6 px-6 border-r border-b border-successlight text-center font-medium text-gray-600">
                        pro.
                      </th>
                      <th className="py-6 px-6 border-r border-b border-successlight text-center font-medium text-gray-600">
                         re.
                      </th>
                      <th className="py-6 px-6 border-b border-successlight text-center font-medium text-gray-600">
                        Edit
                      </th>
                      {/* <th className="py-6 px-6 border-b border-successlight text-center font-medium text-gray-600">
                        <FaTools className="inline mr-2" /> Action
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
  {Array.isArray(company?.invoices) &&
    company.invoices
      .filter((invoice) => invoice.due_amount !== 0 || !invoice.isPaid) // Filter invoices with due amounts or unpaid status
      .map((invoice) => (
        <motion.tr
          key={invoice._id}
          className="hover:bg-gray-50 transition duration-200 ease-in-out"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
         
        >
          <td className="py-3 px-6 text-center border-r border-b border-gray">
            {new Date(invoice.invoice_date).toLocaleDateString()}
          </td>
          <td className="py-3 px-6 text-left border-r border-b border-gray">
            {invoice.ProfessionalFees.length > 0 ? (
              <>
                {invoice.ProfessionalFees.map((fee: { description: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; amount: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
                  <div key={index}>
                    <span>{fee.description}</span>: <span>{fee.amount}</span>
                  </div>
                ))}
                <br />
                <strong>
                  Total: {invoice.ProfessionalFees.reduce((sum: any, fee: { amount: any; }) => sum + fee.amount, 0)}
                </strong>
              </>
            ) : (
              <span>No Professional Fees</span>
            )}
          </td>
          <td className="py-3 px-6 text-left border-r border-b border-gray">
            {invoice.ReimbursementExpenses.length > 0 ? (
              <>
                {invoice.ReimbursementExpenses.map((expense: { description: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; amount: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
                  <div key={index}>
                    <span>{expense.description}</span>: <span>{expense.amount}</span>
                  </div>
                ))}
                <br />
                <strong>
                  Total: {invoice.ReimbursementExpenses.reduce((sum: any, expense: { amount: any; }) => sum + expense.amount, 0)}
                </strong>
              </>
            ) : (
              <span>No Reimbursement Expenses</span>
            )}
          </td>
          <td className="py-3 px-6 text-center border-b border-gray">
            <span
              className={invoice.due_amount === 0 ? 'text-success' : 'text-danger'}
            >
              {invoice.due_amount === 0 ? 'Paid' : invoice.due_amount}
            </span>
          </td>
                    <td>
            <div className="p-2 bg-[#e6ccff3a] border-[#ebebeb] border-r">
              <input
                type="number"
                className="w-24 px-2 text-center bg-[#ccfffb44] border-[#ebebeb] border-r"
                value={invoice.unpaid_ProfessionalFees || 0}
                onChange={(e) =>
                  handleInputChange(String(invoice._id), "unpaid_ProfessionalFees", parseFloat(e.target.value) || 0)
                }
                onBlur={(e) =>
                  handleBlur(String(invoice._id), "unpaid_ProfessionalFees", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </td>

<td>
  <div className="p-2 bg-[#e6ccff3a] border-[#ebebeb] border-r">
    <input
      type="number"
      className="w-24 px-2 text-center bg-[#ccfffb44] border-[#ebebeb] border-r"
      value={invoice.unpaid_ReimbursementExpenses || 0}
      onChange={(e) =>
        handleInputChange(String(invoice._id), "unpaid_ReimbursementExpenses", parseFloat(e.target.value) || 0)
      }
      onBlur={(e) =>
        handleBlur(String(invoice._id), "unpaid_ReimbursementExpenses", parseFloat(e.target.value) || 0)
      }
    />
  </div>
</td>



        </motion.tr>
      ))}
</tbody>

                </motion.table>
              ) : (
                <p className="text-center text-gray-600 mt-4">No invoices available for this company.</p>
              )}
            </div>
        );
        case 'Insights':
          return (
            <div>
            <h2 className="text-lg font-semibold mb-6">Insights</h2>
            <BentoGrid 
              companyName={company?.companyName ?? ''}
              invoiceNumber={company?.invoices[0]?.invoiceNumber ?? ''}
              totalPayableAmount={totalPayableAmount.toString()} // Convert totalPayableAmount to string
              dueAmount={dueAmount}
              totalInvoices={totalInvoices}
            />
          </div>
          );
      default:
        return null;
    }
  };

  if (!company) {
    return <p>Loading...</p>;
  }

  return (
    <>
     <span>{company?.companyName}</span> <Breadcrumb pageName="Profile" />
      <div className="p-6 bg-white rounded-xl min-h-screen">
        {/* Header Section */}
        {/* <div className="flex justify-between items-center pb-4">
          <div>
            <h1 className="text-4xl text-boxdark-2 font-semibold">{company?.companyName}</h1>
            <p className="text-gray-500">Ahemdabad</p>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600">Remove</button>
        </div> */}

        {/* Tabs Section */}
        <div className="mt-4 border-b border-successlight">
          <ul className="flex text-lg space-x-6 text-primary">
            {['Overview', 'Invoices', 'Payment Status', 'Insights'].map((tab) => (
              <li
                key={tab}
                className={`pb-2 cursor-pointer ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-500 font-semibold'
                    : 'text-gray-500 hover:text-blue-500'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>

        {/* Tab Content Section */}
        <div className="mt-6 bg-white shadow rounded p-6">{renderTabContent()}</div>

        {/* Incomplete Profile Warning */}
        <div className="mt-4 bg-yellow-100 text-yellow-700 p-4 rounded border border-yellow-300">
          <p>
            This {formData.companyName} profile is incomplete.{' '}
            <span className="text-primary hover:underline cursor-pointer">Complete now</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default CompanyProfile;
