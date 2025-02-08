import { MapPin, Globe, CheckCircle, Users, DollarSign, BarChart } from "lucide-react";


// type ContentItem = {
//     text: string;
//     className?: string;
//     icon?: React.FC<{ size: number }>;
//     link?: string;
//     linkText?: string;
//   };
  


export default function CompanyProfileNew() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-[#d1e2ff3d] shadow-sm text-black border border-[#d1e2ff] rounded-xl p-6 relative text-center">
        <div className="absolute top-4 right-4">
          <button className="bg-primary text-white px-4 py-2 rounded-lg">Edit</button>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <img src="/duolingo-logo.png" alt="Company Logo" className="rounded-full border border-[#d1e2ff]" />
          </div>
          <h1 className="text-2xl font-bold mt-2">Duolingo</h1>
          <p className="text-gray-500 flex items-center gap-2"><Globe size={16} /> Public Company &middot; Pittsburgh, KS</p>
          <p className="text-gray-500"><a href="mailto:info@duolingo.com">krunalmistry13000@gmail.com</a></p>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mt-6 text-center">
        {[{ value: "24ZZFBU9502G1Z6", label: "GST", icon: Users },
          { value: "ABCPS1234A", label: "CIN", icon: Globe },
          { value: "6353157921", label: "Revenue", icon: DollarSign },
          { value: "27", label: "Company Rank", icon: BarChart }].map((item, index) => (
          <div key={index} className="bg-white border border-[#d1e2ff] shadow-sm rounded-lg p-4">
            <h2 className="text-xl font-bold">{item.value}</h2>
            <p className="text-gray-500 flex items-center justify-center gap-1">
              {/* <item.icon size={16} /> {item.label} */}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        {[{
          title: "Highlights",
          content: [
            { text: "Locations: 79" },
            { text: "Founded: 2011" },
            { text: "Subscribed", className: "text-green-600 flex items-center gap-1", icon: CheckCircle },
            { text: "Area: Worldwide" },
            { text: "CEO: ", link: "#", linkText: "Luis von Ahn" },
            { text: "Sector: Online Education" }
          ]
        }, {
          title: "Company Profile",
          content: [
            { text: "Headquarter: 430 E 6th St, New York, 10009", icon: MapPin },
            { text: "https://duolingo.com", link: "https://duolingo.com" },
            { text: "duolingo-tuts", link: "#" },
            { text: "Phone: (31) 6-1235-4567" },
            { text: "Herengracht 501, 1017 BV Amsterdam, NL" }
          ]
        }].map((card, index) => (
          <div key={index} className="bg-white border border-[#d1e2ff] rounded-lg p-6">
            <h3 className="text-lg font-bold">{card.title}</h3>
            
          </div>
        ))}
      </div>
    </div>
  );
}
