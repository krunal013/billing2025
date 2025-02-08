// src/pages/Form/CompanyList.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Company {
  _id: string;
  companyName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
}
const baseUrl = import.meta.env.VITE_BASE_APP_BACKEND_BASEURL;
const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]); // State to store company list
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search input
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]); // State for filtered companies
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const navigate = useNavigate(); // Hook to navigate to other pages

  // Fetch the companies from the backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/companies`); // Fetch company data
        setCompanies(response.data); // Store companies in state
        setFilteredCompanies(response.data); // Initialize filtered companies
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching companies:', error);
        setLoading(false); // Set loading to false if there's an error
      }
    };

    fetchCompanies();
  }, []);

  // Update filtered companies when searchTerm changes
  useEffect(() => {
    const filtered = companies.filter((company) =>
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  // Handle "View Profile" button click
  const handleViewProfile = (companyId: string) => {
    navigate(`/company/${companyId}`); // Navigate to the profile page for the selected company
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {/* Search Box */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full rounded border border-gray-300 p-2 text-black focus:outline-none focus:ring focus:ring-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
          placeholder="Search by company name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Our Companies
      </h4>

      {loading ? (
        <p className="text-center text-black dark:text-white">Loading...</p>
      ) : filteredCompanies.length > 0 ? (
        <div className="flex flex-col">
          {/* Header Row */}
          <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
            <div className="p-2.5 xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Company</h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Person Name</h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Mobile Number</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Email</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Actions</h5>
            </div>
          </div>

          {/* Dynamic Rows */}
          {filteredCompanies.map((company) => (
            <div
              key={company._id}
              className="grid grid-cols-3 border-b border-stroke dark:border-strokedark sm:grid-cols-5"
            >
              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <p className="text-black dark:text-white font-bold">{company.companyName}</p>
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white">{company.contactPerson}</p>
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white">{company.contactNumber}</p>
              </div>
              <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                <p className="text-black dark:text-white">{company.email}</p>
              </div>
              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <button
                  className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                  onClick={() => handleViewProfile(company._id)}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-black dark:text-white">No companies found.</p>
      )}
    </div>
  );
};

export default CompanyList;