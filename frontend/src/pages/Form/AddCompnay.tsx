import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa6";
import Breadcrumb from "../../components/Breadcrumb";
const baseUrl = import.meta.env.VITE_BASE_APP_BACKEND_BASEURL;
const AddCompnay: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    gstNumber: "",
    cinNumber: "",
    panNumber: "",
    contactPerson: "",
    contactNumber: "",
    alternateNumber: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    companyName: "",
    gstNumber: "",
    cinNumber: "",
    panNumber: "",
    email: "",
    contactPerson: "",
    contactNumber: "",
    alternateNumber: "",
    address: "",
  });
    
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
  
    if (currentStep === 1) {
      // Validate only fields in the first section (Basic Details)
      if (!formData.companyName) newErrors.companyName = "Company Name is required.";
    }
    if (currentStep === 2) {
      // Validate only fields in the second section (Personal Details)
      if (!formData.gstNumber.match(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/)) {
        newErrors.gstNumber = "Invalid GST Number.";
      }
      if (!formData.cinNumber) newErrors.cinNumber = "CIN Number is required.";
      if (!formData.panNumber) newErrors.panNumber = "PAN Number is required.";
    }
    if (currentStep === 3) {
      // Validate only fields in the third section (Contact Details)
      if (!formData.email) newErrors.email = "Email is required.";
      if (!formData.contactPerson) newErrors.contactPerson = "Contact Person is required.";
      if (!formData.contactNumber) newErrors.contactNumber = "Contact Number is required.";
      if (!formData.alternateNumber) newErrors.alternateNumber = "Alternate Number is required.";
      if (!formData.address) newErrors.address = "Address is required.";
    }
  
    setErrors(newErrors);
  
    // Return true if no errors, false otherwise
    return Object.keys(newErrors).length === 0;
  };
  
  
  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();  // Prevent form submission
    if (validateForm()) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  

  const handlePrev = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      handleNext(e);
      return;
    }
  
    try {
      const response = await axios.post(`${baseUrl}/api/companies/add`, formData);
  
      if (response.data && response.data._id) {
        const newCompanyId = response.data._id;
  
        // Show success toast
        toast.success(
          <>
            <div>Company added successfully!</div>
            <div className="flex">
              <button
                onClick={() => navigate(`/company/${newCompanyId}`)}
                className="text-primary ml-1 underline cursor-pointer"
              >
                View Company
              </button>
              <FaArrowRight className="mt-1 ml-2" />
            </div>
          </>,
          { position: toast.POSITION.BOTTOM_RIGHT, autoClose: 3000 }
        );
  
        // Delay navigation until after the toast disappears (5 seconds)
        setTimeout(() => {
          navigate(`/company/${newCompanyId}`);
        }, 3000);
  
        // Reset form after successful submission
        setFormData({
          companyName: "",
          address: "",
          gstNumber: "",
          cinNumber: "",
          panNumber: "",
          contactPerson: "",
          contactNumber: "",
          alternateNumber: "",
          email: "",
        });
  
        setCurrentStep(1);
      } else {
        console.error("Invalid response: Company ID not found");
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Failed to add company. Please check your inputs.");
    }
  };
  

    return (
        <>
            <Breadcrumb pageName="Add Compnay"/>
    <div className="bg-white max-h-screen flex items-center justify-center">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg  p-6 md:p-10  max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-left mb-8">Details</h1>
                
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {['Compnay Name', 'Compnay Details', 'Compnay Contact'].map((step, index) => (
                <span
                  key={index}
                  className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#3c50e0] bg-[#edf6ff] ${
                    currentStep > index ? "opacity-100 scale-125 transition duration-500 ease-in-out" : "opacity-50"
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#edf6ff]">
              <div
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#3c50e0] transition-all duration-1000"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
          <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}>
          {currentStep === 1 && (
              <div>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                  className={`w-full p-3 bg-[#edf6ff] tracking-wider text-black-2 border ${errors.companyName ? "border-meta-1" : "border-[#e6e9ee]"} focus:outline-none focus:ring-4 focus:ring-[#b1ceffbd] rounded-md shadow-sm transition duration-500 hover:scale-105`}
                />
                {errors.companyName && <p className="text-meta-1 text-sm transition duration-500">{errors.companyName}</p>}
              </div>
            )}
            {currentStep === 2 && (
                          <>
                              <div className="flex flex-col gap-y-8">
                                  <div>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        placeholder="Enter GST number"
                                        required
                                        pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$"
                                        title="Enter a valid GST number."
                                        className={`w-full p-3 bg-[#edf6ff] tracking-wider text-black-2 border ${errors.gstNumber ? "border-meta-1" : "border-[#e6e9ee]"} rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-[#b1ceffbd] transition duration-300 hover:scale-105`}
                                        />
                                  {errors.gstNumber && <p className="text-meta-1 text-sm">{errors.gstNumber}</p>}
                                  </div>
                                  <div>
                                       <input
                                        type="text"
                                        name="cinNumber"
                                        value={formData.cinNumber}
                                        onChange={handleChange}
                                        placeholder="Enter CIN number"
                                        className={`w-full p-3 bg-[#edf6ff] tracking-wider text-black-2 border ${errors.cinNumber ? "border-meta-1" : "border-[#e6e9ee]"} rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-[#b1ceffbd] transition duration-300 hover:scale-105`}
                                      />
                                      {errors.cinNumber && <p className="text-meta-1 text-sm">{errors.cinNumber}</p>}
                                  </div>

                                  <div>
                                        <input
                                            type="text"
                                            name="panNumber"
                                            value={formData.panNumber}
                                            onChange={handleChange}
                                            placeholder="Enter PAN number"
                                            pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                                            title="Enter a valid PAN number."
                                            className={`w-full p-3 bg-[#edf6ff] tracking-wider text-black-2 border ${errors.panNumber ? "border-meta-1" : "border-[#e6e9ee]"} rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-[#b1ceffbd] transition duration-300 hover:scale-105`}
                                      />
                                      {errors.panNumber && <p className="text-meta-1 text-sm">{errors.panNumber}</p>}
                                  </div>
              
              
                                  </div>
              </>
            )}
            {currentStep === 3 && (
            <>
                
                <div className="flex flex-col gap-y-8">
                                  
                <div><input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className={`w-full p-3 bg-[#edf6ff] tracking-wider text-black-2 border ${errors.email ? "border-meta-1" : "border-[#e6e9ee]"} rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-[#b1ceffbd] transition duration-300 hover:scale-105`}
                                  />
                                  {errors.email && <p className="text-meta-1 text-sm">{errors.email}</p>}
                                  </div>
                <div><input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact Person"
                  required
                  className={`w-full p-3 bg-[#edf6ff] tracking-wider text-black-2 border ${errors.contactPerson ? "border-meta-1" : "border-[#e6e9ee]"} rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-[#b1ceffbd] transition duration-300 hover:scale-105`}
                                  />
                                  {errors.contactPerson && <p className="text-meta-1 text-sm">{errors.contactPerson}</p>}
                                  </div>
                <div> <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  required
                  className={`w-full p-3 bg-[#edf6ff] tracking-wider text-black-2 border ${errors.contactNumber ? "border-meta-1" : "border-[#e6e9ee]"} rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-[#b1ceffbd] transition duration-300 hover:scale-105`}
                                  />
                                  {errors.contactNumber && <p className="text-meta-1 text-sm">{errors.contactNumber}</p>}
                                  </div>
                <div> <input
                  type="text"
                  name="alternateNumber"
                  value={formData.alternateNumber}
                  onChange={handleChange}
                  placeholder="Alt. Number"
                  required
                  className={`w-full p-3 bg-[#edf6ff] tracking-wider text-black-2 border ${errors.alternateNumber ? "border-meta-1" : "border-[#e6e9ee]"} rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-[#b1ceffbd] transition duration-300 hover:scale-105`}
                                  />
                                  {errors.alternateNumber && <p className="text-meta-1 text-sm">{errors.alternateNumber}</p>}
                                  </div>
                <div>
                       <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Company Address"
                  required
                  className={`w-full p-3 bg-[#edf6ff] tracking-wider text-black-2 border  rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-[#b1ceffbd] transition duration-300 hover:scale-105`}
                                      />              
                                  {errors.address && <p className="text-meta-1 text-sm">{errors.address}</p>}    
                </div>
                
                                  

             </div>
            </>
            )}
            <div className="flex justify-between mt-8">
            {currentStep > 1 && (
                <button type="button" onClick={handlePrev} className="px-4 py-2 transform transition duration-200 ease-in-out active:scale-110  bg-gray rounded">
                  Previous
                </button>
              )}
              {currentStep < 3 ? (
              <button type="button" onClick={handleNext} className="px-4 py-2 transform transition duration-200 ease-in-out active:scale-110 bg-success text-white rounded">
              Next
            </button>
            
              ) : (
                <button type="submit" className="px-4 py-2 bg-success transform transition duration-200 ease-in-out active:scale-110 text-white rounded">
                  Submit
                </button>
              )}
            </div>
          </form>
        </div>
          </div>
          <ToastContainer position="bottom-right" autoClose={5000} />
            </div>
    </>
  );
};

export default AddCompnay;