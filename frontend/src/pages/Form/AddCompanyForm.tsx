import React, { ChangeEvent, FormEvent, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
  
const baseUrl = import.meta.env.VITE_BASE_APP_BACKEND_BASEURL;
interface FormData {
  companyName: string;
  address: string;
  gstNumber: string;
  cinNumber: string;
  panNumber: string;
  contactPerson: string;
  contactNumber: string;
  alternateNumber: string;
  email: string;
}


const AddCompanyForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    address: '',
    gstNumber: '',
    cinNumber: '',
    panNumber: '',
    contactPerson: '',
    contactNumber: '',
    alternateNumber: '',
    email: '',
  });



  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };




  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`${baseUrl}/api/companies/add`, formData);
     
      setFormData({
        companyName: '',
        address: '',
        gstNumber: '',
        cinNumber: '',
        panNumber: '',
        contactPerson: '',
        contactNumber: '',
        alternateNumber: '',
        email: '',
      });
      navigate('/CompanyList');
    } catch (error) {
      console.error(error);
    
    }
  };


  

  return (
    <>
       <Breadcrumb pageName="Add Compnay" />

      



      
   <form
      onSubmit={handleSubmit}
      className="bg-gray p-8 rounded-2xl shadow-lg max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <h2 className="text-3xl font-semibold mb-6 col-span-1 md:col-span-2 text-center text-gray-800">
        Add Company
      </h2>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          Company Name
        </label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
          required
          placeholder="Enter company name"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
          required
          placeholder="Enter company address"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          GST Number
        </label>
        <input
          type="text"
          name="gstNumber"
          value={formData.gstNumber}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
          required
          placeholder="Enter GST number"
          pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$"
          title="Enter a valid GST number."
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          CIN Number
        </label>
        <input
          type="text"
          name="cinNumber"
          value={formData.cinNumber}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
          required
          placeholder="Enter CIN number"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          PAN Number
        </label>
        <input
          type="text"
          name="panNumber"
          value={formData.panNumber}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
          required
          placeholder="Enter PAN number"
          pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
          title="Enter a valid PAN number."
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          Contact Person
        </label>
        <input
          type="text"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
          required
          placeholder="Enter contact person name"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          Contact Number
        </label>
        <input
          type="text"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
          required
          placeholder="Enter contact number"
          pattern="^[0-9]{10}$"
          title="Enter a valid 10-digit phone number."
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          Alternate Number
        </label>
        <input
          type="text"
          name="alternateNumber"
          value={formData.alternateNumber}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
          placeholder="Enter alternate contact number"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3"
          required
          placeholder="Enter email address"
        />
      </div>

      <button
        type="submit"
        className="col-span-1 md:col-span-2 bg-meta-4 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 transition duration-200"
      >
        Save
      </button>
   </form>

      
      
    </>
  
  );
};

export default AddCompanyForm;
