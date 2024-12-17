import React, { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';

export const doughnutLegends = [
  { title: 'Total PJU', color: 'bg-blue-500' },
  { title: 'Total Pengaduan', color: 'bg-teal-600' },
  { title: 'Pengaduan Yang Terselesaikan', color: 'bg-purple-600' },
];

export const lineLegends = [
  { title: 'Pengaduan Terselesaikan', color: 'bg-teal-600' },
  { title: 'Pengaduan Belum Terselesaikan', color: 'bg-purple-600' },
];

function DashboardCharts() {
  const [doughnutData, setDoughnutData] = useState({
    datasets: [
      {
        data: [0, 0, 0], // Default values
        backgroundColor: ['#0694a2', '#1c64f2', '#7e3af2'],
      },
    ],
    labels: ['Total PJU', 'Total Pengaduan', 'Pengaduan Yang Terselesaikan'],
  });

  const [lineData, setLineData] = useState({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [
      {
        label: 'Pengaduan Terselesaikan',
        backgroundColor: '#0694a2',
        borderColor: '#0694a2',
        data: new Array(12).fill(0), // Initialize with zeros
        fill: false,
      },
      {
        label: 'Pengaduan Belum Terselesaikan',
        backgroundColor: '#7e3af2',
        borderColor: '#7e3af2',
        data: new Array(12).fill(0), // Initialize with zeros
        fill: false,
      },
    ],
  });

  useEffect(() => {
    // Fetch counts for Doughnut chart
    const fetchDoughnutData = async () => {
      try {
        const pjuResponse = await axios.get('http://localhost:8000/api/pju/count');
        const pengaduanResponse = await axios.get('http://localhost:8000/api/pengaduan/count');
        setDoughnutData({
          datasets: [
            {
              data: [
                pjuResponse.data.total_pju,
                pengaduanResponse.data.total_pengaduan,
                pengaduanResponse.data.pengaduan_selesai,
              ],
              backgroundColor: ['#0694a2', '#1c64f2', '#7e3af2'],
            },
          ],
          labels: ['Total PJU', 'Total Pengaduan', 'Pengaduan Yang Terselesaikan'],
        });
      } catch (error) {
        console.error('Error fetching doughnut chart data:', error);
      }
    };

    // Fetch monthly data for Line chart (resolved and unresolved)
    const fetchMonthlyData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/pengaduan/monthlycount');
        
        // Update lineData with backend response
        setLineData({
          labels: response.data.months,
          datasets: [
            {
              label: 'Pengaduan Terselesaikan',
              backgroundColor: '#0694a2',
              borderColor: '#0694a2',
              data: response.data.resolvedData,
              fill: false,
            },
            {
              label: 'Pengaduan Belum Terselesaikan',
              backgroundColor: '#7e3af2',
              borderColor: '#7e3af2',
              data: response.data.unresolvedData,
              fill: false,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching line chart data:', error);
      }
    };

    fetchDoughnutData();
    fetchMonthlyData();
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Dashboard Charts</h2>
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div>
          <Doughnut data={doughnutData} options={{ responsive: true, cutoutPercentage: 80 }} />
          {/* Render Doughnut chart legends */}
          <div className="mt-4 flex justify-center space-x-4">
            {doughnutLegends.map((legend, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className={`inline-block w-3 h-3 rounded-full ${legend.color}`} />
                <span>{legend.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Line data={lineData} options={{ responsive: true, scales: { x: { display: true }, y: { display: true } } }} />
          {/* Render Line chart legends */}
          <div className="mt-4 flex justify-center space-x-4">
            {lineLegends.map((legend, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className={`inline-block w-3 h-3 rounded-full ${legend.color}`} />
                <span>{legend.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;
