import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';



interface ChartTwoProps {
  data: {
    totalPaidAmount: number;
    totalDueAmount: number;
    companyDueAmounts: { companyName: string; dueAmount: number }[];
  };
}

const options: ApexOptions = {
  colors: ['#7DDA58', '#E15858'], // Green for Paid Amount and Red for Due Amount
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    type: 'bar',
    height: 335,
    stacked: true, // Stacked bars
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  responsive: [
    {
      breakpoint: 1536,
      options: {
        plotOptions: {
          bar: {
            borderRadius: 0,
            columnWidth: '25%',
          },
        },
      },
    },
  ],
  plotOptions: {
    bar: {
      horizontal: true, // To make the bars horizontal
      borderRadius: 0,
      columnWidth: '25%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ['All Over'], // Static category for the chart
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    fontFamily: 'Satoshi',
    fontWeight: 500,
    fontSize: '14px',
  },
  fill: {
    opacity: 1,
  },
};

interface ChartTwoState {
  series: {
    name: string;
    data: number[];
  }[];
  selectedCompany: string;
}

const ChartTwo: React.FC<ChartTwoProps> = ({ data }) => {
  const [state, setState] = useState<ChartTwoState>({
    series: [
      { name: 'Paid Amount', data: [data.totalPaidAmount] },
      { name: 'Due Amount', data: [data.totalDueAmount] },
    ],
    selectedCompany: 'All Over', // Default to 'All Over'
  });

  // Set the initial state when the component mounts
  useEffect(() => {
    setState({
      ...state,
      series: [
        { name: 'Paid Amount', data: [data.totalPaidAmount] },
        { name: 'Due Amount', data: [data.totalDueAmount] },
      ],
    });
  }, [data]);

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCompany = e.target.value;

    if (selectedCompany === 'All Over') {
      // Show both paid and due amounts for "All Over"
      setState({
        ...state,
        series: [
          { name: 'Paid Amount', data: [data.totalPaidAmount] },
          { name: 'Due Amount', data: [data.totalDueAmount] },
        ],
        selectedCompany,
      });
    } else {
      // Only show due amount for the selected company
      const companyDue = data.companyDueAmounts.find(
        (company) => company.companyName === selectedCompany
      );

      setState({
        ...state,
        series: [
          { name: 'Paid Amount', data: [] }, // No paid amount for selected company
          { name: 'Due Amount', data: [companyDue?.dueAmount || 0] }, // Only due amount
        ],
        selectedCompany,
      });
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Due Statistics
          </h4>
        </div>
        <div>
          <div className="relative z-20 inline-block">
            <select
              name="company"
              id="company-select"
              value={state.selectedCompany}
              onChange={handleDropdownChange}
              className="relative z-20  text-black inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
            >
              <option value="All Over">Select 🔽</option>
              <option value="All Over">All Over</option>
              {data.companyDueAmounts.map((company, index) => (
                <option key={index} value={company.companyName}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-ml-5 -mb-9">
          <ReactApexChart
            options={options}
            series={state.series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;
