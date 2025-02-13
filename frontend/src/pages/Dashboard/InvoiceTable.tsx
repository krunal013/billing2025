import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaSort } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';
import Breadcrumb from '../../components/Breadcrumb';
import { TbFilterPlus } from 'react-icons/tb';

const baseUrl = import.meta.env.VITE_BASE_APP_BACKEND_BASEURL;
interface Invoices {
  _id: string;
  invoiceid: String;
  invoice_number: string;
  company: {
    companyName: string;
  };
  invoice_date: string;
  TotalAmount: string;
  isPaid: boolean;
  ProfessionalFees: Array<{
    description: string;
    amount: number;
  }>;
  ReimbursementExpenses: Array<{
    description: string;
    amount: number;
  }>;
  ProfessionalFees_total: number;
  ReimbursementExpenses_total: number;
  unpaid_ProfessionalFees: number;
  unpaid_ReimbursementExpenses: number;
  due_amount: number;
}

const InvoiceTable: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoices[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoices[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [paidFilter, setPaidFilter] = useState<string>(''); // 'Yes', 'No', or ''
  const [amountFilter, setAmountFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoices | null>(null);
  const [isUnpaidSectionVisible, setIsUnpaidSectionVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [TopbarOpen, setTopbarOpen] = useState(false);

  const [editableInvoices, setEditableInvoices] = useState<{
    [key: string]: boolean;
  }>({});
  // const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceForDelete, setSelectedInvoiceForDelete] = useState<
    string | null
  >(null);

  const handleEyeClick = (invoice: Invoices) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleEditDueClick = (invoiceId: string) => {
    setEditableInvoices((prev) => ({
      ...prev,
      [invoiceId]: !prev[invoiceId],
    }));
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false); // Close the delete modal
    console.log('Modal Closed, State: ', isDeleteModalOpen);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInvoiceForDelete) return;

    try {
      const invoiceToDelete = invoices.find(
        (invoice) => invoice._id === selectedInvoiceForDelete,
      );
      if (!invoiceToDelete) return;

      await axios.delete(`${baseUrl}/api/invoices/${selectedInvoiceForDelete}`);

      setInvoices((prevInvoices) =>
        prevInvoices.filter(
          (invoice) => invoice._id !== selectedInvoiceForDelete,
        ),
      );
      setFilteredInvoices((prevInvoices) =>
        prevInvoices.filter(
          (invoice) => invoice._id !== selectedInvoiceForDelete,
        ),
      );

      toast.success(
        `Invoice from ${invoiceToDelete.company.companyName} has been deleted!`,
        {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        },
      );

      setIsDeleteModalOpen(false); // Close delete modal after deletion
      setSelectedInvoiceForDelete(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleDeleteClick = (invoiceId: string) => {
    setSelectedInvoiceForDelete(invoiceId); // Set the invoice ID to be deleted
    setIsDeleteModalOpen(true); // Open the delete confirmation modal
  };
  // function for copy both p and r fees value in unpaid section

  const handleCheckboxChange = async (invoiceId: string, checked: boolean) => {
    // Find the current invoice
    const currentInvoice = invoices.find(
      (invoice) => invoice._id === invoiceId,
    );
    if (!currentInvoice) return;

    // Optimistically update the state
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice._id === invoiceId ? { ...invoice, isPaid: checked } : invoice,
      ),
    );

    const updatedData = {
      isPaid: checked,
      unpaid_ProfessionalFees: checked
        ? currentInvoice.ProfessionalFees_total
        : 0,
      unpaid_ReimbursementExpenses: checked
        ? currentInvoice.ReimbursementExpenses_total
        : 0,
    };

    try {
      // Make API call to update the backend
      const response = await fetch(`${baseUrl}/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.statusText}`);
      }

      const updatedInvoice = await response.json();

      // Update state with the response from the server, preserving the company field
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice._id === invoiceId
            ? {
                ...invoice, // Keep existing fields
                ...updatedInvoice, // Merge updated fields from the server
                company: invoice.company, // Ensure the company field remains unchanged
              }
            : invoice,
        ),
      );
    } catch (error) {
      console.error('Error updating invoice:', error);

      // Revert the optimistic update on error
      setInvoices((prevInvoices) =>
        prevInvoices.map((invoice) =>
          invoice._id === invoiceId
            ? { ...invoice, isPaid: !checked }
            : invoice,
        ),
      );
    }
  };

  // State to manage visible columns
  const [visibleColumns, setVisibleColumns] = useState({
    invoiceid: true,
    invoice_number: true,
    company: true,
    amount: true,
    date: true,
    paid: true,
    ProfessionalFees: true,
    ReimbursementExpenses: true,
    ProfessionalFees_total: true,
    ReimbursementExpenses_total: true,
    unpaid_ProfessionalFees: true,
    unpaid_ReimbursementExpenses: true,
    due_amount: true,
    unpaidSection: false,
    action: true,
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/get_invoice`);
        setInvoices(response.data.invoices);
        setFilteredInvoices(response.data.invoices); // Initialize filtered list
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    let filtered = invoices;

    if (companyFilter) {
      filtered = filtered.filter((invoice) =>
        invoice.company.companyName
          .toLowerCase()
          .includes(companyFilter.toLowerCase()),
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(
        (invoice) => formatDate(invoice.invoice_date) === dateFilter,
      );
    }

    if (paidFilter) {
      filtered = filtered.filter(
        (invoice) => (invoice.isPaid ? 'Yes' : 'No') === paidFilter,
      );
    }

    if (amountFilter) {
      const [min, max] = amountFilter.split('-').map(Number);
      filtered = filtered.filter((invoice) => {
        const amount = parseFloat(invoice.TotalAmount);
        return amount >= min && amount <= max;
      });
    }

    setFilteredInvoices(filtered);
  }, [companyFilter, dateFilter, paidFilter, amountFilter, invoices]);

  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = formattedDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toggleColumnVisibility = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const InvoiceModal: React.FC<{
    invoice: Invoices | null;
    onClose: () => void;
  }> = ({ invoice, onClose }) => {
    if (!invoice) return null;

    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editableInvoice, setEditableInvoice] = useState<Invoices | null>(
      null,
    );

    useEffect(() => {
      // Initialize the editable invoice with the current invoice data
      if (invoice) {
        setEditableInvoice({
          ...invoice,
          // You can modify this based on what you want to allow editing
        });
      }
    }, [invoice]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditableInvoice((prevState) => ({
        ...prevState!,
        [name]: value,
      }));
    };

    const handleUpdate = async () => {
      if (!editableInvoice) return;

      try {
        await axios.put(
          `${baseUrl}/api/update_invoice/${invoice._id}`,
          editableInvoice,
        );
        onClose(); // Close the modal after the update

        toast.success(`Invoice has been Updated!`, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000, // 5 seconds
        });
      } catch (error) {
        console.error('Error updating invoice:', error);
      }
    };

    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 text-black overflow-y-auto">
          <div className="modal-header">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white text-lg"
            >
              X
            </button>
          </div>

          <div className="modal-body space-y-4">
            <p className="text-5xl">
              <strong>{editableInvoice?.company?.companyName}</strong>
            </p>

            {/* Invoice Number */}
            {isEditMode ? (
              <div>
                <label>Invoice Number</label>
                <input
                  type="text"
                  name="invoice_number"
                  value={editableInvoice?.invoice_number}
                  onChange={handleInputChange}
                  className="border p-2 w-full"
                />
              </div>
            ) : (
              <p>
                <strong>Invoice Number:</strong>{' '}
                {editableInvoice?.invoice_number}
              </p>
            )}

            {/* Invoice Date */}
            {isEditMode ? (
              <div>
                <label>Invoice Date</label>
                <input
                  type="date"
                  name="invoice_date"
                  value={editableInvoice?.invoice_date || ''}
                  onChange={handleInputChange}
                  className="border p-2 w-full"
                />
              </div>
            ) : (
              <p>
                <strong>Invoice Date:</strong> {editableInvoice?.invoice_date}
              </p>
            )}

            {/* Total Amount */}
            {isEditMode ? (
              <div>
                <label>Total Amount</label>
                <input
                  type="number"
                  name="TotalAmount"
                  value={editableInvoice?.TotalAmount || ''}
                  onChange={handleInputChange}
                  className="border p-2 w-full"
                />
              </div>
            ) : (
              <p>
                <strong>Total Amount:</strong> ₹ {editableInvoice?.TotalAmount}
              </p>
            )}

            <hr className="border-primary my-4" />

            <div>
              <h4 className="font-semibold">Professional Fees</h4>
              <ul>
                {editableInvoice &&
                  editableInvoice.ProfessionalFees.map((fee, index) => (
                    <li className="ml-5" key={index}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={fee.description}
                          onChange={(e) => {
                            const updatedFees = [
                              ...editableInvoice.ProfessionalFees,
                            ];
                            updatedFees[index].description = e.target.value;
                            setEditableInvoice({
                              ...editableInvoice,
                              ProfessionalFees: updatedFees,
                            });
                          }}
                          className="border p-2 w-full"
                        />
                      ) : (
                        `${fee.description} : ₹ ${fee.amount}`
                      )}
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Reimbursement Expenses</h4>
              <ul>
                {editableInvoice &&
                  editableInvoice.ReimbursementExpenses.map(
                    (expense, index) => (
                      <li className="ml-5" key={index}>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={expense.description}
                            onChange={(e) => {
                              const updatedExpenses = [
                                ...editableInvoice.ReimbursementExpenses,
                              ];
                              updatedExpenses[index].description =
                                e.target.value;
                              setEditableInvoice({
                                ...editableInvoice,
                                ReimbursementExpenses: updatedExpenses,
                              });
                            }}
                            className="border p-2 w-full"
                          />
                        ) : (
                          `${expense.description} : ₹ ${expense.amount}`
                        )}
                      </li>
                    ),
                  )}
              </ul>
            </div>

            <hr className="border-primary my-4" />
            <p>
              <strong>Status:</strong>{' '}
              {editableInvoice && editableInvoice.isPaid ? 'Paid' : 'Unpaid'}
            </p>
          </div>

          <div className="modal-footer mt-4 flex justify-end space-x-4">
            {isEditMode ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-success text-white px-4 py-2 rounded-lg hover:scale-105  active:scale-110 transition duration-300"
                >
                  Update
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="bg-gray text-black px-4 py-2 rounded-lg hover:scale-105  active:scale-110 transition duration-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="bg-primary text-white tracking-widest items-center px-4 flex py-1 rounded-lg hover:scale-105  active:scale-110 transition duration-300"
              >
                Edit
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-black text-white tracking-widest px-4 py-2 rounded-lg hover:scale-105  active:scale-110 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white px-5 pt-6 pb-2.5 dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      {/* <Breadcrumb pageName="Invoices" /> */}
      <ToastContainer />
      <div className="flex justify-between items-center mb-10">
        <h4 className="mb-6 justify-start text-xl font-semibold text-black dark:text-white">
          Invoices
        </h4>
        <button
          className="text-primary font-semibold text-lg flex justify-center hover:underline"
          onClick={() => setTopbarOpen(!TopbarOpen)}
        >
          <FaEye /> Visibility
        </button>
      </div>

      {/* Topbar for Checkboxes */}
      <div
        className={`fixed top-20 left-10  xl:w-[95%] rounded-b-lg bg-white dark:bg-meta-4 shadow-md duration-300 transition-transform transform ${
          TopbarOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-[#23232325] dark:border-gray-600">
          <h3 className="text-black text-lg font-semibold">Column Visibility</h3>
          <button
            onClick={() => setTopbarOpen(false)}
            className="text-black text-2xl font-bold hover:text-primary"
          >
            &times;
          </button>
        </div>
        <div className="p-4 flex text-center flex-wrap gap-8">
          {[
            { key: 'invoice_number', label: 'Invoice Number' },
            { key: 'company', label: 'Company' },
            { key: 'amount', label: 'Amount' },
            { key: 'date', label: 'Date' },
            { key: 'paid', label: 'Paid' },
            { key: 'ProfessionalFees_total', label: 'P Fees' },
            { key: 'ReimbursementExpenses_total', label: 'R Fees' },
            { key: 'unpaidSection', label: 'Due Section' },
            { key: 'action', label: 'Action' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center cursor-pointer gap-2">
              <input
                type="checkbox"
                checked={visibleColumns[key as keyof typeof visibleColumns]}
                onChange={() =>
                  toggleColumnVisibility(key as keyof typeof visibleColumns)
                }
                className="accent-[#3c50e0]"
              />
              <span
                className={`font-semibold transition-colors duration-300 ${
                  visibleColumns[key as keyof typeof visibleColumns]
                    ? 'text-[#3c50e0]'
                    : 'text-[#b9b9b9]'
                }`}
              >
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter Panel */}
      <div className="flex flex-wrap gap-6 bg-gray-100 dark:bg-meta-4 rounded-lg items-center justify-start">
        {/* Company Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Company
          </label>
          <input
            type="text"
            placeholder="Ex. Oasis Finance"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="border border-[#e6e9ee] dark:border-gray-600 text-md bg-[#edf6ff] dark:bg-meta-4 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* More Filters Button */}
        <button
          className="text-primary flex justify-center gap-2 mt-5 hover:underline"
          onClick={() => setSidebarOpen(true)}
        >
          <TbFilterPlus className="text-2xl" /> More Filters
        </button>
      </div>

      {/* Sidebar for More Filters */}
      <div
        className={`fixed right-0 top-0 h-full w-80 mt-20 bg-white dark:bg-meta-4 duration-300 shadow-lg transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-[#53505057] dark:border-gray-600">
          <h3 className="text-lg text-black font-semibold">More Filters</h3>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-black text-3xl hover:text-primary"
          >
            &times;
          </button>
        </div>
        <div className="p-4 flex flex-col gap-4">
          {/* Date Picker Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-primary dark:text-gray-300">
              Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-[#e6e9ee] dark:border-gray-600 bg-[#edf6ff] dark:bg-meta-4 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Amount Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-primary dark:text-gray-300">
              Amount Range
            </label>
            <select
              onChange={(e) => setAmountFilter(e.target.value)}
              className="border border-[#e6e9ee] dark:border-gray-600 bg-[#edf6ff] dark:bg-meta-4 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ALL</option>
              <option value="1000-5000">1000 - 5000</option>
              <option value="5000-15000">5000 - 15,000</option>
              <option value="15000-30000">15,000 - 30,000</option>
              <option value="30000-50000">30,000 - 50,000</option>
              <option value="50000-100000">50,000 - 1,00,000</option>
            </select>
          </div>

          {/* Paid Filter (Radio Buttons) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-primary dark:text-gray-300">
              Paid Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="Yes"
                  checked={paidFilter === 'Yes'}
                  onChange={(e) => setPaidFilter(e.target.value)}
                  className="form-radio h-4 w-4 text-[#edf6ff]"
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="No"
                  checked={paidFilter === 'No'}
                  onChange={(e) => setPaidFilter(e.target.value)}
                  className="form-radio h-4 w-4 text-[#edf6ff]"
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#3c4fe01d] rounded-lg shadow-xl mt-6 overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] text-center font-semibold text-black items-center  shadow-md dark:border-strokedark">
          {visibleColumns.invoice_number && (
            <div className="border-r border-[#d6d6d6] p-3">Invoice No.</div>
          )}
          {visibleColumns.company && (
            <div className="border-r border-[#d6d6d6] p-3 flex ml-7">
              Company <FaSort className="mt-1 ml-2 text-xl" />
            </div>
          )}
          {visibleColumns.date && (
            <div className="border-r border-[#d6d6d6] p-3">Date</div>
          )}
          {visibleColumns.ProfessionalFees_total && (
            <div className="border-r  border-[#d6d6d6] p-3">Prof. Fees</div>
          )}
          {visibleColumns.ReimbursementExpenses_total && (
            <div className="border-r border-[#d6d6d6] p-3">Reimb. Fees</div>
          )}
          {visibleColumns.amount && (
            <div className="border-r border-[#d6d6d6] p-3">Total Amount</div>
          )}
          {visibleColumns.unpaidSection && (
            <div
              className={`border-r border-[#d6d6d6] p-3 ${
                editableInvoices[invoices[0]._id]
                  ? 'opacity-100'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Paid
            </div>
          )}

          {visibleColumns.unpaidSection && (
            <div
              className={`border-r border-[#d6d6d6] p-3 ${
                editableInvoices[invoices[0]._id]
                  ? 'opacity-100'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Pending P.
            </div>
          )}

          {visibleColumns.unpaidSection && (
            <div
              className={`border-r border-[#d6d6d6] p-3 ${
                editableInvoices[invoices[0]._id]
                  ? 'opacity-100'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Pending R.
            </div>
          )}

          {visibleColumns.due_amount && (
            <div className="border-r border-[#d6d6d6] p-3">Due Amount</div>
          )}
          {visibleColumns.action && <div className="p-2">Action</div>}
        </div>

        <div
          className="max-h-96 overflow-y-auto text-black hide-scrollbar"
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // Internet Explorer 10+
          }}
        >
          {filteredInvoices
            .slice()
            .reverse()
            .map((invoice) => (
              <div
                key={invoice._id}
                className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] text-center items-center border-b border-stroke dark:border-strokedark"
              >
                {visibleColumns.invoice_number && (
                  <div className="p-2 border-[#ebebeb] border-r">
                    {invoice.invoice_number} / 2025
                  </div>
                )}
                {visibleColumns.company && (
                  <div
                    className="p-1.5 text-xs text-black-2 font-semibold border-[#ebebeb] border-r"
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      display: 'inline-block',
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        transform: 'translateX(0)',
                        animation:
                          invoice.company?.companyName.length > 20
                            ? 'slideText 3s linear 2s 1'
                            : 'none',
                      }}
                    >
                      {invoice.company?.companyName}
                    </div>
                    <style>
                      {`
        @keyframes slideText {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}
                    </style>
                  </div>
                )}

                {visibleColumns.date && (
                  <div className="p-2 border-[#ebebeb] border-r">
                    {formatDate(invoice.invoice_date)}
                  </div>
                )}
                {visibleColumns.ProfessionalFees_total && (
                  <div className="p-2 bg-[#e6ccff3a] border-[#ebebeb] border-r">
                    {invoice.ProfessionalFees_total}
                  </div>
                )}
                {visibleColumns.ReimbursementExpenses_total && (
                  <div className="p-2 bg-[#ccfffb44] border-[#ebebeb] border-r">
                    {invoice.ReimbursementExpenses_total}
                  </div>
                )}
                {visibleColumns.amount && (
                  <div className="p-2 bg-[#ccffcf70] font-semibold border-[#ebebeb] border-r">
                    {invoice.TotalAmount}
                  </div>
                )}
                {visibleColumns.unpaidSection && (
                  <div className="p-2 bg-[] border-[#ebebeb] border-r">
                    <input
                      type="checkbox"
                      checked={invoice.isPaid}
                      disabled={!editableInvoices[invoice._id]}
                      className={`${
                        editableInvoices[invoice._id]
                          ? 'opacity-100'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const updatedProfessionalFees = isChecked
                          ? invoice.ProfessionalFees_total
                          : 0;
                        const updatedReimbursementExpenses = isChecked
                          ? invoice.ReimbursementExpenses_total
                          : 0;
                        const updatedDueAmount =
                          Number(invoice.TotalAmount || 0) -
                          (updatedProfessionalFees +
                            updatedReimbursementExpenses);

                        // Optimistically update the state
                        setInvoices((prevInvoices) =>
                          prevInvoices.map((inv) =>
                            inv._id === invoice._id
                              ? {
                                  ...inv,
                                  isPaid: isChecked,
                                  unpaid_ProfessionalFees:
                                    updatedProfessionalFees,
                                  unpaid_ReimbursementExpenses:
                                    updatedReimbursementExpenses,
                                  due_amount: updatedDueAmount,
                                }
                              : inv,
                          ),
                        );

                        // Update backend
                        handleCheckboxChange(invoice._id, isChecked);
                      }}
                    />
                  </div>
                )}
                {visibleColumns.unpaidSection && (
                  <div className="p-2 bg-[#e6ccff3a] border-[#ebebeb] border-r">
                    <input
                      type=""
                      className={`w-24 px-2 text-center bg-[#ccfffb44] border-[#ebebeb] border-r ${
                        editableInvoices[invoice._id]
                          ? 'opacity-100'
                          : 'opacity-25 cursor-not-allowed'
                      }`}
                      value={invoice.unpaid_ProfessionalFees}
                      disabled={!editableInvoices[invoice._id]}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        const updatedDueAmount =
                          Number(invoice.TotalAmount || 0) -
                          (newValue +
                            (invoice.unpaid_ReimbursementExpenses || 0));

                        setInvoices((prevInvoices) =>
                          prevInvoices.map((inv) =>
                            inv._id === invoice._id
                              ? {
                                  ...inv,
                                  unpaid_ProfessionalFees: newValue,
                                  due_amount: updatedDueAmount,
                                }
                              : inv,
                          ),
                        );
                      }}
                      onBlur={async (e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        try {
                          await axios.patch(
                            `${baseUrl}/api/invoices/${invoice._id}`,
                            {
                              unpaid_ProfessionalFees: newValue,
                            },
                          );
                        } catch (error) {
                          console.error(
                            'Failed to update unpaid professional fees:',
                            error,
                          );
                        }
                      }}
                    />
                  </div>
                )}

                {visibleColumns.unpaidSection && (
                  <div className="p-2 bg-[#ccfffb44] border-[#ebebeb] border-r">
                    <input
                      type=""
                      className={`w-20 bg-[#fbfdff66] rounded px-2 text-center ${
                        editableInvoices[invoice._id]
                          ? 'opacity-100'
                          : 'opacity-25 cursor-not-allowed'
                      }`}
                      value={invoice.unpaid_ReimbursementExpenses}
                      disabled={!editableInvoices[invoice._id]}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        const updatedDueAmount =
                          Number(invoice.TotalAmount || 0) -
                          ((invoice.unpaid_ProfessionalFees || 0) + newValue);

                        setInvoices((prevInvoices) =>
                          prevInvoices.map((inv) =>
                            inv._id === invoice._id
                              ? {
                                  ...inv,
                                  unpaid_ReimbursementExpenses: newValue,
                                  due_amount: updatedDueAmount,
                                }
                              : inv,
                          ),
                        );
                      }}
                      onBlur={async (e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        try {
                          await axios.patch(
                            `${baseUrl}/api/invoices/${invoice._id}`,
                            {
                              unpaid_ReimbursementExpenses: newValue,
                            },
                          );
                        } catch (error) {
                          console.error(
                            'Failed to update unpaid reimbursement expenses:',
                            error,
                          );
                        }
                      }}
                    />
                  </div>
                )}

                {visibleColumns.due_amount && (
                  <div className="border-[#ebebeb] bg-[#ccffcf70] border-r p-2">
                    <div
                      className={`font-bold w-16 mx-auto rounded-xl ${
                        invoice.due_amount === 0
                          ? 'text-success font-bold ' // Green background for zero due amount
                          : invoice.due_amount <=
                            parseFloat(invoice.TotalAmount)
                          ? 'text-danger font-bold' // Red background for due amount less or equal to TotalAmount
                          : 'bg-transparent' // Default style
                      }`}
                    >
                      {invoice.due_amount}
                    </div>
                  </div>
                )}
                {visibleColumns.action && (
                  <div className="flex items-center justify-center p-2">
                    {!visibleColumns.unpaidSection && (
                      <button
                        className="mr-2 rounded-full flex gap-10 text-xl px-3 text-md text-black"
                        onClick={() => setSelectedInvoiceForDelete(invoice._id)} // Open delete confirmation modal
                      >
                        {selectedInvoiceForDelete === invoice._id ? (
                          // Show the modal when selectedInvoiceIdForDelete is the same as invoice._id
                          <>
                            {isDeleteModalOpen &&
                              selectedInvoiceForDelete === invoice._id && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                                  <div className="bg-white p-6 rounded-lg shadow-lg text-black">
                                    <div className="text-sm text-center">
                                      <p className="tracking-wider">
                                        Are you sure you want to delete this
                                        invoice?
                                      </p>
                                      <div className="flex justify-around mt-4">
                                        <button
                                          className="bg-meta-1 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                          onClick={handleConfirmDelete}
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          className="bg-gray text-black px-4 py-2 rounded-lg hover:bg-gray-600"
                                          onClick={handleCancelDelete}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </>
                        ) : (
                          // Show Edit, View, and Delete icons when not in delete mode
                          <>
                            <FaEye
                              className="text-primary hover:scale-105 active:scale-110"
                              onClick={() => handleEyeClick(invoice)} // Open the modal on click
                            />
                            <MdDelete
                              className="text-meta-1 hover:scale-105 active:scale-110"
                              onClick={() => handleDeleteClick(invoice._id)} // Show delete confirmation modal
                            />
                          </>
                        )}
                      </button>
                    )}

                    {visibleColumns.unpaidSection && (
                      <button
                        className="rounded-full px-3 text-md text-warning hover:bg-[#232323] transition duration-300 active:scale-110"
                        onClick={() => handleEditDueClick(invoice._id)}
                      >
                        {editableInvoices[invoice._id] ? 'Finish' : 'Edit Due'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
      <style>
        {`
              .scroll-smooth::-webkit-scrollbar {
                width: 8px;
              }
              .scroll-smooth::-webkit-scrollbar-thumb {
                background-color: #4b5563;
                border-radius: 8px;
              }
              .scroll-smooth::-webkit-scrollbar-track {
                background-color: #cbd5e0;
                border-radius: 8px;
              }
            `}
      </style>
      {/* Modal */}
      {isModalOpen && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
};

export default InvoiceTable;
