import React, { useState, useEffect } from "react";
import { NavLink , Link } from 'react-router-dom';
// Define the company type
interface Company {
  _id: string;
  companyName: string;
  email: string;
  contactNumber: string;
}
const baseUrl = import.meta.env.VITE_BASE_APP_BACKEND_BASEURL;
const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch companies from the API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/companies`);
        const data: Company[] = await response.json();
        setCompanies(data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };

    fetchCompanies();
  }, []);

  // Handle search filtering
  const filteredCompanies = companies.filter(
    (company) =>
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProfile = (companyId: string) => {
    window.location.href = `/company/${companyId}`;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-black">Company List</h2>

        {/* Search Bar */}
        <div className="flex">
      <span className="mr-3"></span>  
          <input
          type="text"
          placeholder="Search Compnay"
          className="border border-[#3c4fe01d] px-8 py-1 bg-[#3c4fe011] rounded-md shadow-sm focus:ring focus:ring-blue-200 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          />
          <React.Fragment>
        <NavLink to="/forms/AddCompnay">
              <button className="px-5 py-1 active:scale-95 border border-[#c9c9c9] text-black m-1 ml-5 rounded-md bg-[#e1f0fd]">Add Compnay</button>
            </NavLink>
        </React.Fragment>
       </div>
        
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-md mb-6">
        {/* <select className="border px-4 py-2 rounded-lg focus:ring focus:ring-blue-200">
          <option>Select Work Location</option>
        </select>
        <select className="border px-4 py-2 rounded-lg focus:ring focus:ring-blue-200">
          <option>Select Department</option>
        </select>
        <select className="border px-4 py-2 rounded-lg focus:ring focus:ring-blue-200">
          <option>Select Designation</option>
        </select>
        <button className="border px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition duration-300">
          More Filters
        </button> */}
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow-md border border-[#3c4fe01d] overflow-hidden">
  <table className="w-full table-auto table-fixed">
    <thead className="bg-[#eef7ff] text-black">
      <tr>
        <th className="text-center py-2 border-r border-[#3c4fe01d]">Company Name</th>
        <th className="text-center py-2 border-r border-[#3c4fe01d]">Work Email</th>
        <th className="text-center py-2 border-r border-[#3c4fe01d]">Status</th>
        <th className="text-center py-2 border-r border-[#3c4fe01d]">View Profile</th>
      </tr>
    </thead>
  </table>

  {/* Make the tbody scrollable */}
  <div className="max-h-[500px] overflow-y-auto">
    <table className="w-full table-auto table-fixed">
      <tbody className="text-center">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <tr
              key={company._id}
              className="border-t border-[#e2e2e2] hover:bg-gray transition duration-300"
            >
              <td className="px-4 py-4 flex items-center border-r border-[#3c4fe01d]">
                <div className="w-12 h-12 text-3xl rounded-full font-serif flex items-center justify-center bg-blue-500 text-primary font-bold mr-3">
                  {company.companyName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{company.companyName}</div>
                  <div className="text-sm text-gray-500">{company.contactNumber}</div>
                </div>
              </td>
              <td className="px-4 py-4 border-r border-[#3c4fe01d]">{company.email}</td>
              <td className="px-4 py-4 text-red-500 border-r border-[#3c4fe01d]">
                <span className="text-meta-8 mr-1">⚠</span>
                Profile incomplete.{" "}
                <a href="#" className="text-meta-5 underline">
                  Complete now
                </a>
              </td>
              <td className="px-4 py-4">
                <Link
                        to={`/company/${company._id}`}
                        className="text-primary ml-1 underline cursor-pointer"
                      >
                        View Company
                      </Link>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={4}
              className="text-center py-6 text-gray-500 italic"
            >
              No matching companies found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

    </div>
  );
};

export default CompanyList;
