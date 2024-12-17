import React, { useState, useEffect } from 'react';
import InfoCard from '../components/Cards/InfoCard';
import ChartCard from '../components/Chart/ChartCard';
import { Doughnut, Line } from 'react-chartjs-2';
import ChartLegend from '../components/Chart/ChartLegend';
import PageTitle from '../components/Typography/PageTitle';
import { ChatIcon, CartIcon, MoneyIcon, PeopleIcon } from '../icons';
import RoundIcon from '../components/RoundIcon';
import LoadingPage from '../components/LoadingPage';
import axiosInstance from '../utils/axiosInstance'; // Menggunakan axiosInstance

const doughnutLegends = [
  { title: 'Total APJ', color: 'bg-blue-500' },
  { title: 'Total Pengaduan', color: 'bg-teal-600' },
  { title: 'Pengaduan Yang Terselesaikan', color: 'bg-purple-600' },
];

const lineLegends = [
  { title: 'Pengaduan Terselesaikan', color: 'bg-teal-600' },
  { title: 'Pengaduan Belum Terselesaikan', color: 'bg-purple-600' },
];

function Dashboard() {
  const [totalAPJ, setTotalAPJ] = useState(0);
  const [totalPengaduan, setTotalPengaduan] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  const [doughnutData, setDoughnutData] = useState({
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#0694a2', '#1c64f2', '#7e3af2'],
      },
    ],
    labels: ['Total APJ', 'Total Pengaduan', 'Pengaduan Yang Terselesaikan'],
  });

  const [lineData, setLineData] = useState({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Pengaduan Terselesaikan',
        backgroundColor: '#0694a2',
        borderColor: '#0694a2',
        data: [0, 0, 0, 0, 0, 0, 0],
        fill: false,
      },
      {
        label: 'Pengaduan Belum Terselesaikan',
        backgroundColor: '#7e3af2',
        borderColor: '#7e3af2',
        data: [0, 0, 0, 0, 0, 0, 0],
        fill: false,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Total APJ
        const pjuResponse = await axiosInstance.get('/pjus/count');
        setTotalAPJ(pjuResponse.data?.total_pju || 0);

        // Fetch Pengaduan Count
        const pengaduanResponse = await axiosInstance.get('/pengaduan/count');
        setTotalPengaduan(pengaduanResponse.data?.total_pengaduan || 0);
        setTotalCompleted(pengaduanResponse.data?.total_completed || 0);
        setTotalPending(pengaduanResponse.data?.total_pending || 0);

        // Update Doughnut Data
        setDoughnutData({
          datasets: [
            {
              data: [
                pjuResponse.data?.total_pju || 0,
                pengaduanResponse.data?.total_pengaduan || 0,
                pengaduanResponse.data?.total_completed || 0,
              ],
              backgroundColor: ['#0694a2', '#1c64f2', '#7e3af2'],
            },
          ],
          labels: ['Total APJ', 'Total Pengaduan', 'Pengaduan Yang Terselesaikan'],
        });

        // Fetch Monthly Data for Line Chart
        const monthlyResponse = await axiosInstance.get('/pengaduan/monthlycount');
        setLineData({
          labels: monthlyResponse.data.months || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Pengaduan Terselesaikan',
              backgroundColor: '#0694a2',
              borderColor: '#0694a2',
              data: monthlyResponse.data.completedMonthly || [],
              fill: false,
            },
            {
              label: 'Pengaduan Belum Terselesaikan',
              backgroundColor: '#7e3af2',
              borderColor: '#7e3af2',
              data: monthlyResponse.data.pendingMonthly || [],
              fill: false,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <>
      <PageTitle>Dashboard</PageTitle>
  
      {loading ? (
        <LoadingPage /> // Gunakan LoadingPage untuk loading state
      ) : (
        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard title="Total APJ" value={totalAPJ}>
            <RoundIcon
              icon={PeopleIcon}
              iconColorClass="text-orange-500 dark:text-orange-100"
              bgColorClass="bg-orange-100 dark:bg-orange-500"
              className="mr-4"
            />
          </InfoCard>

          <InfoCard title="Total Pengaduan" value={totalPengaduan}>
            <RoundIcon
              icon={MoneyIcon}
              iconColorClass="text-green-500 dark:text-green-100"
              bgColorClass="bg-green-100 dark:bg-green-500"
              className="mr-4"
            />
          </InfoCard>

          <InfoCard title="Total Pengaduan Yang Sudah Terselesaikan" value={totalCompleted}>
            <RoundIcon
              icon={CartIcon}
              iconColorClass="text-blue-500 dark:text-blue-100"
              bgColorClass="bg-blue-100 dark:bg-blue-500"
              className="mr-4"
            />
          </InfoCard>

          <InfoCard title="Total Pengaduan Yang Belum Terselesaikan" value={totalPending}>
            <RoundIcon
              icon={ChatIcon}
              iconColorClass="text-teal-500 dark:text-teal-100"
              bgColorClass="bg-teal-100 dark:bg-teal-500"
              className="mr-4"
            />
          </InfoCard>
        </div>
      )}

      <PageTitle>Charts</PageTitle>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <ChartCard title="Distribution of APJ and Pengaduan">
            <Doughnut data={doughnutData} options={{ responsive: true, cutoutPercentage: 80 }} />
            <ChartLegend legends={doughnutLegends} />
          </ChartCard>

          <ChartCard title="Monthly Pengaduan Status">
            <Line
              data={lineData}
              options={{
                responsive: true,
                scales: {
                  x: { display: true },
                  y: { display: true },
                },
              }}
            />
            <ChartLegend legends={lineLegends} />
          </ChartCard>
        </div>
      )}
    </>
  );
}

export default Dashboard;
