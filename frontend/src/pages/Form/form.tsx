import { useState, useEffect, ChangeEvent } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import axios from 'axios';
import InvoicePDF from './InvoicePDF';
import Breadcrump from '../../components/Breadcrumb';
import { MdDelete } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';
import { FaEyeSlash } from 'react-icons/fa';
import { MdCurrencyRupee } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import { BsCashCoin } from 'react-icons/bs';
// import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BASE_APP_BACKEND_BASEURL;
interface Company {
  _id: string;
  companyName: string;
  address: string;
  cinNumber: string;
  gstNumber: string;
  contactNumber: string;
  dueAmount: number;
}

interface FormState {
  To: string;
  company: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceid: string;
  particulars: Particular[];
  total: string;
}

interface Particular {
  description: string;
  subParticulars: SubParticular[];
  total: string;
}

interface SubParticular {
  [x: string]: any;
  description: string;
  amount: string;
}
interface Expense {
  description: string;
  price: number;
}

// interface PredefinedWork {
//   description: string;
//   amount: number;
// }
// interface PredefinedWork2 {
//   description: string;
//   amount: number;
// }

function Form() {
  const [companies, setCompanies] = useState<Company[]>([]); // State for storing the list of companies
  // const [selectedCompany, setSelectedCompany] = useState<string>(''); // State for the selected company ID
  // const navigate = useNavigate();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedCompanyDetails, setSelectedCompanyDetails] =
    useState<Company | null>(null);
  // const [searchTerm, setSearchTerm] = useState<string>("");
  // const [formIsValid, setFormIsValid] = useState(false);
  const [professionalFees, setProfessionalFees] = useState<Expense[]>([]);
  const [reimbursementFees, setReimbursementFees] = useState<Expense[]>([]);

  const initialFormState = {
    To: '',
    company: '',
    invoiceid: '',
    invoiceNo: '',
    invoiceDate: '',
    particulars: [
      {
        description: 'Professional Fees',
        subParticulars: [],
        total: '0',
      },
      {
        description: 'Reimbursement Expenses',
        subParticulars: [],
        total: '0',
      },
    ],
    total: '0',
  };

  const [formData, setFormData] = useState<FormState>(initialFormState);

  const handleCheckboxChange = (
    index: number,
    subIndex: number,
    checked: boolean,
  ) => {
    const particular = formData.particulars[index];
    const subParticular = particular.subParticulars[subIndex];

    const expenseData = {
      professionalfees:
        index === 0
          ? [
              {
                description: subParticular.description,
                price: subParticular.amount,
              },
            ]
          : [],
      riembursementfees:
        index !== 0
          ? [
              {
                description: subParticular.description,
                price: subParticular.amount,
              },
            ]
          : [],
    };

    if (checked) {
      // Save expense when checked
      axios
        .post(`${baseUrl}/api/users/add_expense`, expenseData)
        .then((response) => {
          console.log('Expense saved successfully ✅', response.data);
        })
        .catch((error) => {
          console.error('Error saving expense:', error);
        });
    } else {
      // Remove expense when unchecked
      axios
        .post(`${baseUrl}/api/users/remove_expense`, expenseData)
        .then((response) => {
          console.log('Expense removed successfully 🔴', response.data);
        })
        .catch((error) => {
          console.error('Error removing expense:', error);
        });
    }
  };

  useEffect(() => {
    axios
      .get(`${baseUrl}/api/users/fees`)
      .then((response) => {
        setProfessionalFees(response.data.professionalFees || []);
        setReimbursementFees(response.data.reimbursementFees || []);
      })
      .catch((error) => {
        console.error('Error fetching predefined fees:', error);
      });
  }, []);

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    setFormData((prevState) => ({
      ...prevState,
      invoiceDate: currentDate,
    }));

    axios
      .get(`${baseUrl}/api/companies/`)
      .then((response) => {
        console.log('Fetched companies:', response.data); // Debug response
        setCompanies(response.data);
      })
      .catch((error) => console.error('Error fetching companies:', error));
  }, []);

  useEffect(() => {
    // Fetch the next invoice number
    axios
      .get(`${baseUrl}/api/invoice-number`)
      .then((response) => {
        setFormData((prevState) => ({
          ...prevState,
          invoiceid: response.data.invoiceNumber, // Set the invoice number in the form
        }));
      })
      .catch((error) => console.error('Error fetching invoice number:', error));
  }, []);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedCompanyDetails(null); // Reset details when changing company
    if (companyId) {
      axios
        .get(`${baseUrl}/api/companies/${companyId}`)
        .then((response) => {
          const { company, dueAmount, totalPayableAmount, totalInvoices } =
            response.data;

          setSelectedCompanyDetails({
            ...company,
            dueAmount,
            totalPayableAmount,
            totalInvoices,
          });

          setFormData((prevState) => ({
            ...prevState,
            company: company.companyName,
          }));

          axios
            .get(`${baseUrl}/api/next-invoice/${companyId}`)
            .then((response) => {
              setFormData((prevState) => ({
                ...prevState,
                invoiceNo: response.data.nextInvoiceNumber,
              }));
            })
            .catch((error) =>
              console.error('Error fetching next invoice number:', error),
            );
        })
        .catch((error) =>
          console.error('Error fetching company details:', error),
        );
    } else {
      setSelectedCompanyDetails(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubParticularChange = (
    particularIndex: number,
    subIndex: number,
    field: keyof SubParticular,
    value: string,
  ) => {
    const updatedParticulars = [...formData.particulars];
    const subParticular =
      updatedParticulars[particularIndex].subParticulars[subIndex];

    subParticular[field] = value;

    // Check if both fields are filled
    subParticular.isChecked =
      subParticular.description.trim() !== '' &&
      subParticular.amount.trim() !== '';

    // Calculate total
    const subTotal = updatedParticulars[particularIndex].subParticulars.reduce(
      (acc, sub) => acc + parseFloat(sub.amount || '0'),
      0,
    );

    updatedParticulars[particularIndex].total = subTotal.toFixed(2);
    setFormData({ ...formData, particulars: updatedParticulars });
  };

  const calculateTotal = (updatedParticulars: Particular[]) => {
    const total = updatedParticulars.reduce(
      (acc, particular) => acc + parseFloat(particular.total || '0'),
      0,
    );
    setFormData((prevState) => ({ ...prevState, total: total.toFixed(2) }));
  };
  const [dropdownSelection, setDropdownSelection] = useState<{
    [key: number]: string;
  }>({});

  const handleDropdownChange = (
    particularIndex: number,
    selectedWork: string,
  ) => {
    const updatedParticulars = [...formData.particulars];

    const work = (
      particularIndex === 0 ? professionalFees : reimbursementFees
    ).find((work) => work.description === selectedWork);

    if (work) {
      updatedParticulars[particularIndex].subParticulars.push({
        description: work.description,
        amount: work.price.toString(),
      });

      // Calculate subtotal for the specific particular
      const subTotal = updatedParticulars[
        particularIndex
      ].subParticulars.reduce(
        (acc, subParticular) => acc + parseFloat(subParticular.amount || '0'),
        0,
      );
      updatedParticulars[particularIndex].total = subTotal.toFixed(2);

      // Calculate total for all particulars
      const totalAmount = updatedParticulars.reduce(
        (acc, particular) => acc + parseFloat(particular.total || '0'),
        0,
      );

      // Update formData state
      setFormData({
        ...formData,
        particulars: updatedParticulars,
        total: totalAmount.toFixed(2),
      });

      // Reset dropdown selection
      setDropdownSelection((prev) => ({ ...prev, [particularIndex]: '' }));
    }
  };

  const addCustomSubParticular = (particularIndex: number) => {
    const updatedParticulars = [...formData.particulars];
    updatedParticulars[particularIndex].subParticulars.push({
      description: '',
      amount: '',
      isCustom: true, // Ensures the checkbox is shown
    });
    setFormData({ ...formData, particulars: updatedParticulars });
  };

  const removeSubParticular = (particularIndex: number, subIndex: number) => {
    const updatedParticulars = [...formData.particulars];
    updatedParticulars[particularIndex].subParticulars.splice(subIndex, 1);

    const subTotal = updatedParticulars[particularIndex].subParticulars.reduce(
      (acc, subParticular) => acc + parseFloat(subParticular.amount || '0'),
      0,
    );

    updatedParticulars[particularIndex].total = subTotal.toFixed(2);
    setFormData({ ...formData, particulars: updatedParticulars });
    calculateTotal(updatedParticulars);
  };

  const handlePDFDownload = async () => {
    if (
      !selectedCompanyId ||
      !formData.invoiceNo ||
      !formData.invoiceid ||
      !formData.invoiceDate
    ) {
      return;
    }

    const transformedData = {
      invoiceid: formData.invoiceid,
      invoice_date: formData.invoiceDate,
      invoice_number: parseInt(formData.invoiceNo, 10),
      company_id: selectedCompanyId,
      company_name: formData.company,
      ProfessionalFees: formData.particulars[0]?.subParticulars || [],
      ReimbursementExpenses: formData.particulars[1]?.subParticulars || [],
      ProfessionalFees_total: parseFloat(formData.particulars[0]?.total || '0'),
      ReimbursementExpenses_total: parseFloat(
        formData.particulars[1]?.total || '0',
      ),
      TotalAmount: parseFloat(formData.total || '0'),
    };

    try {
      await axios.post(`${baseUrl}/api/add_invoice`, transformedData, {
        responseType: 'blob',
      });

      // Reset form state
      setFormData({
        ...initialFormState,
        invoiceDate: new Date().toISOString().split('T')[0], // Reset date
      });
      setSelectedCompanyId('');
      setSelectedCompanyDetails(null);

      // Fetch a new invoice ID
      axios
        .get(`${baseUrl}/api/invoice-number`)
        .then((response) => {
          setFormData((prevState) => ({
            ...prevState,
            invoiceid: response.data.invoiceNumber,
          }));
        })
        .catch((error) =>
          console.error('Error fetching invoice number:', error),
        );
    } catch (error) {
      console.error('Error posting invoice data:', error);
    }
  };

  const [showSummary, setShowSummary] = useState(false); // State to control summary visibility

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  return (
    <>
      <Breadcrump pageName="invoice form" />
      <br />
      <div
        className={`grid gap-8 ${
          showSummary ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg relative">
            {/* Sticky Invoice Heading */}
            <div className="sticky top-0  rounded-t-2xl border border-[#3c4fe01d] bg-white z-20 shadow-md w-full px-3 py-4">
              <h2 className="text-3xl font-bold text-black text-left p-3">
                Invoice Form
              </h2>
            </div>

            {/* Scrollable Form Content */}
            <div
              className="overflow-y-auto h-[calc(100vh-100px)] mt-4 hide-scrollbar"
              style={{
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // Internet Explorer 10+
              }}
            >
              {/* Unpaid Balance Notification */}
              {selectedCompanyDetails &&
                selectedCompanyDetails.dueAmount > 0 && (
                  <div
                    className="bg-[#ff0e0e07] w-[500px] rounded-r-lg border-t-4 border-meta-1 rounded-b-md text-teal-900 px-4 py-3 shadow-md"
                    role="alert"
                  >
                    <div className="flex">
                      <div className="py-1">
                        <svg
                          className="fill-current h-6 w-6 text-teal-500 mr-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold">
                          {selectedCompanyDetails.companyName} currently has an
                          unpaid balance of ₹{selectedCompanyDetails.dueAmount}.
                        </p>
                        <p className="text-sm">
                          If payment has been received, please{' '}
                          <a
                            href=""
                            className="underline text-blue-600 hover:text-blue-800"
                          >
                            update the due amount
                          </a>{' '}
                          to reflect the cleared balance.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              <div className={`grid gap-8 ${'grid-cols-1'}`}>
                {/* Left Section - Form */}
                <div
                  className={`text-[#272727] p-6 rounded-lg ${
                    showSummary ? 'pr-screen pl-screen' : 'pr-5 pl-5'
                  }`}
                >
                  <form className="space-y-6">
                    <div className="mt-6 justify-end text-left mb-6">
                      <button
                        type="button"
                        onClick={toggleSummary}
                        className="border-2 border-[#3c50e0] text-[#3c50e0] rounded-lg shadow-md hover:bg-[#3c50e0]  hover:text-white hover:border-[#ffffff] transition duration-300"
                      >
                        {showSummary ? (
                          <div className="flex gap-2 items-center p-3">
                            <div className="leading-3">
                              <FaEyeSlash />
                            </div>
                            <div className="leading-3 tracking-wider">Hide</div>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center p-3">
                            <div className="leading-3">
                              <FaEye />
                            </div>
                            <div className="leading-3 tracking-wider">
                              Preview
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                    {/* Company Field */}
                    <div>
                      <label
                        htmlFor="company"
                        className="block text-[15px] font-semibold mb-2 tracking-wider"
                      >
                        Company
                      </label>
                      <select
                        className="mt-1 p-2 w-full text-sm bg-[#edf6ff] tracking-wider text-black-2 border border-[#e6e9ee] rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => handleCompanyChange(e.target.value)}
                        value={selectedCompanyId}
                      >
                        <option value="">Select Company</option>
                        {companies && companies.length > 0 ? (
                          companies.map((company) => (
                            <option key={company._id} value={company._id}>
                              {company.companyName}
                            </option>
                          ))
                        ) : (
                          <option disabled>No Companies Available</option>
                        )}
                      </select>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="invoiceNo"
                          className="block text-[15px] font-semibold mb-2 tracking-wider mb-1"
                        >
                          Invoice Number
                        </label>
                        <input
                          type="text"
                          id="invoiceNo"
                          name="invoiceNo"
                          value={formData.invoiceNo}
                          onChange={handleChange}
                          className="p-2 w-full text-sm bg-[#edf6ff] tracking-wider text-black-2 border border-[#e6e9ee] rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="invoiceDate"
                          className="block text-[15px] font-semibold mb-2 tracking-wider mb-1"
                        >
                          Invoice Date
                        </label>
                        <input
                          type="date"
                          id="invoiceDate"
                          name="invoiceDate"
                          value={formData.invoiceDate}
                          onChange={handleChange}
                          className="p-2 w-full text-sm bg-[#edf6ff] tracking-wider text-black-2 border border-[#e6e9ee] rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={!selectedCompanyId}
                        />
                      </div>
                    </div>
                  </form>

                  {/* Particulars */}
                  <div className="mt-9 space-y-9">
                    {formData.particulars.map((particular, index) => (
                      <div
                        key={index}
                        className="border border-[#3c4fe01d] bg-white rounded-md shadow-lg"
                      >
                        <label className="block text-[18px] text-[#3c50e0] rounded-t-lg bg--white p-4 py-3 mt-2 font-semibold tracking-wider">
                          <div className="flex items-center gap-2">
                            <BsCashCoin className="w-5.5 h-5.5" />
                            <div className="leading-3 -mt-1">
                              {particular.description}
                            </div>
                          </div>
                        </label>

                        <div className="p-4 py-5">
                          <select
                            disabled={!selectedCompanyId}
                            value={dropdownSelection[index] || ''}
                            onChange={(e) => {
                              setDropdownSelection((prev) => ({
                                ...prev,
                                [index]: e.target.value,
                              })); // Update selected value
                              handleDropdownChange(index, e.target.value);
                            }}
                            className="p-3 w-full text-sm bg-[#edf6ff] tracking-wider text-black-2 border border-[#e6e9ee] rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Work</option>
                            {(index === 0
                              ? professionalFees
                              : reimbursementFees
                            ).map((work, i) => (
                              <option key={i} value={work.description}>
                                {work.description} - ₹{work.price}
                              </option>
                            ))}
                          </select>

                          <div className="space-y-3 mt-4">
                            {particular.subParticulars.map(
                              (subParticular, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="flex gap-4 items-start relative"
                                >
                                  {/* Description Field */}
                                  <div className="group relative w-full">
                                    <textarea
                                      placeholder="Description"
                                      value={subParticular.description}
                                      onChange={(e) =>
                                        handleSubParticularChange(
                                          index,
                                          subIndex,
                                          'description',
                                          e.target.value,
                                        )
                                      }
                                      className="p-3 w-full text-sm bg-[#edf6ff] tracking-wider text-black-2 border border-[#e6e9ee] rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeSubParticular(index, subIndex)
                                      }
                                      className="text-danger text-xl hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity absolute left-[-40px] top-1/2 transform -translate-y-1/2"
                                    >
                                      <MdDelete />
                                    </button>
                                  </div>

                                  {/* Amount Field */}
                                  <div className="flex flex-col">
                                    <div className="group flex items-center relative bg-[#edf6ff] border rounded-l-md border-[#e6e9ee] rounded-sm">
                                      <div className="p-2.5 text-white bg-[#3c50e0] rounded-l-md">
                                        <MdCurrencyRupee className="text-lg" />
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Amount"
                                        value={subParticular.amount}
                                        onChange={(e) =>
                                          handleSubParticularChange(
                                            index,
                                            subIndex,
                                            'amount',
                                            e.target.value,
                                          )
                                        }
                                        className="p-2 w-20 text-sm bg-[#edf6ff] text-black-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeSubParticular(index, subIndex)
                                        }
                                        className="text-danger text-xl hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity absolute right-[-40px] top-1/2 transform -translate-y-1/2"
                                      >
                                        <MdDelete />
                                      </button>
                                    </div>
                                    {subParticular.isCustom && (
                                      <div className="flex items-center mt-2">
                                        <input
                                          type="checkbox"
                                          onChange={(e) =>
                                            handleCheckboxChange(
                                              index,
                                              subIndex,
                                              e.target.checked,
                                            )
                                          }
                                          disabled={
                                            !subParticular.description.trim() ||
                                            !subParticular.amount.trim()
                                          } // Disable if empty
                                          className="mr-2 text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <label className="text-md text-primary font-bold tracking-wider">
                                          Save
                                        </label>
                                      </div>
                                    )}
                                  </div>

                                  {/* Display Checkbox only for Custom Sub-Particulars */}
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between p-4 -mt-3">
                          <button
                            disabled={!selectedCompanyId}
                            type="button"
                            onClick={() => addCustomSubParticular(index)}
                            className="h-10 w-10 border-2 flex items-center justify-center border-[#3c50e0] text-[#3c50e0] rounded-full shadow-md hover:bg-[#3c50e0] hover:text-white transition duration-300"
                          >
                            <FaPlus />
                          </button>

                          <p className="text-right tracking-wider text-lg font-semibold mt-4">
                            Subtotal: ₹{particular.total}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 mb-7 flex items-center justify-between text-lg font-bold">
                    {/* Left-Aligned Button */}

                    <PDFDownloadLink
                      document={<InvoicePDF formData={formData} />}
                      fileName={`${formData.company}_${formData.invoiceNo}.pdf`}
                      className="border-2 p-2 border-[#3c50e0] text-[#3c50e0] rounded-lg shadow-md hover:bg-[#3c50e0] hover:text-white hover:border-[#ffffff] transition duration-300"
                    >
                      <button onClick={handlePDFDownload}>
                        Generate PDF 📄
                      </button>
                    </PDFDownloadLink>

                    {/* Right-Aligned Total */}
                    <p className="text-right">
                      Total Amount: ₹{formData.total}
                    </p>
                  </div>

                  {/* <div className="mt-6">
       
              <br />
              <br /> */}

                  {/* <button
            onClick={handlePDFDownload}
            className="w-full py-2 px-4 bg-green-500 text-black border-2 border-success rounded-lg hover:bg-success dark:text-white"
          >
            Save
              </button> */}

                  {/* </div> */}
                </div>

                {/* Right Section - Summary */}
              </div>
            </div>
          </div>
        </div>

        {showSummary && (
         <div className="h-screen w-full max-w-[650px] mt-5 flex items-center justify-center">
         <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg relative flex flex-col overflow-hidden">
           
    {/* Sticky Invoice Heading */}
    <div className="sticky top-0 rounded-t-2xl border border-[#3c4fe01d] bg-white z-20 shadow-md w-full px-3 py-4">
      <h2 className="text-3xl font-bold text-black text-left p-3">
        Invoice Summary
      </h2>
    </div>

    {/* Scrollable Content */}
    <div className="flex-grow overflow-y-auto h-[calc(100vh-70px)] p-6 hide-scrollbar">
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        showSummary ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {selectedCompanyDetails ? (
          <div className="rounded-lg shadow-md overflow-y-auto h-[calc(100vh-100px)] mt-4 hide-scrollbar">
            {/* Company Header */}
            <h3 className="text-3xl font-bold text-primary mb-4">
              {selectedCompanyDetails.companyName}
            </h3>
            {/* Company Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black mb-6">
              <p><span className="font-medium">CIN:</span> {selectedCompanyDetails.cinNumber}</p>
              <p><span className="font-medium">GST:</span> {selectedCompanyDetails.gstNumber}</p>
              <p><span className="font-medium">Contact:</span> {selectedCompanyDetails.contactNumber}</p>
              <p><span className="font-medium">Address:</span> {selectedCompanyDetails.address}</p>
            </div>

            {/* Invoice Summary */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center md:text-left">
                Invoice Summary
              </h3>

              <div className="space-y-4">
                {formData.particulars.map((particular, index) => (
                  <div key={index} className="bg-[#edf6ff] p-4 rounded-lg border border-[#daecff] shadow-sm">
                    <p className="font-semibold text-gray-800">{particular.description}</p>
                    <ul className="mt-3 space-y-2 text-gray-700">
                      {particular.subParticulars.map((subParticular, subIndex) => (
                        <li key={subIndex} className="flex justify-between items-center text-sm  pb-2">
                          <span>{subParticular.description}</span>
                          <span className="font-medium text-gray-900">₹{subParticular.amount}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-right font-medium text-gray-900 mt-2">
                      Subtotal: ₹{particular.total}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-right font-bold text-xl mt-6 mb-50 text-gray-900">
                <p>Total Amount: ₹{formData.total}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-bold text-black mb-2">
              No Company Selected
            </h3>
            <p className="text-black">
              Please select a company to view its details.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

        )}
      </div>
    </>
  );
}

export default Form;
