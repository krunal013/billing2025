import { BsClockHistory } from "react-icons/bs";

interface CardThreeProps {
  totalDue: number | null;
}

const CardThree: React.FC<CardThreeProps> = ({ totalDue }) => {
  return (
    <div className="rounded-xl border border-stroke bg-white py-6 px-7.5  dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 font-semibold text-2xl text-danger items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        <BsClockHistory />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-meta-1 dark:text-white">
            ₹{totalDue !== null ? totalDue.toLocaleString() : "Loading..."}
          </h4>
          <span className="text-sm text-black font-medium">Total Due</span>
        </div>

        <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
        
         
        </span>
      </div>
    </div>
  );
};

export default CardThree;
