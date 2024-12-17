import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance"; // Gunakan axiosInstance
import PageTitle from "../components/Typography/PageTitle";
import SectionTitle from "../components/Typography/SectionTitle";
import {
  Table,
  TableFooter,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Select,
  Pagination,
  Input,
} from "@windmill/react-ui";
import Swal from "sweetalert2";
import LoadingPage from "../components/LoadingPage"; // Pastikan komponen LoadingPage diimport

const Panel = () => {
  const [panels, setPanels] = useState([]);
  const [filteredPanels, setFilteredPanels] = useState([]); // Filtered data
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  useEffect(() => {
    const fetchPanels = async () => {
      try {
        setLoading(true);
        setError(null);
  
        // Gunakan axiosInstance untuk permintaan API
        const response = await axiosInstance.get("/panels");
        setPanels(response.data);
        setFilteredPanels(response.data); // Initialize filtered data with all data
      } catch (error) {
        console.error("Error fetching panel data:", error);
  
        // Tampilkan pesan error menggunakan SweetAlert2
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch data. Please try again later.",
        });
  
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchPanels();
  }, []);
  
  // Handle search and filter data based on search query
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = panels.filter(
      (item) =>
        item.nama_jalan?.toLowerCase().includes(query) ||
        item.desa_kel?.toLowerCase().includes(query) ||
        item.kecamatan?.toLowerCase().includes(query)
    );

    setFilteredPanels(filtered);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Calculate the current items to display based on currentPage and itemsPerPage
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPanels.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to the first page whenever items per page changes
  };

  return (
    <>
      <PageTitle>Tabel Panel APJ KPBU</PageTitle>

      <div className="flex justify-between items-center mb-4">
        <SectionTitle>Data Panel</SectionTitle>
      </div>

      {/* Search input */}
      <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="mr-2">Cari:</span>
              <Input
                className="pl-8 text-gray-700"
                placeholder="Cari berdasarkan No. App, Nama Jalan, Kecamatan, atau Status Jalan"
                aria-label="Search"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center">
              <span className="mr-2">Tampilkan per halaman:</span>
              <Select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={20}>20</option>
                <option value={40}>40</option>
                <option value={60}>60</option>
                <option value={80}>80</option>
                <option value={100}>100</option>
              </Select>
            </div>
          </div>

      {/* Display loading or error message */}
      {loading ? (
        <LoadingPage /> // Use LoadingPage component while loading
      ) : error ? (
        <p className="text-red-600">{error}</p> // Display error message if any
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableCell>No</TableCell>
                <TableCell>Lapisan</TableCell>
                <TableCell>No APP</TableCell>
                <TableCell>Longitude</TableCell>
                <TableCell>Latitude</TableCell>
                <TableCell>ABD No</TableCell>
                <TableCell>No Pondasi Tiang</TableCell>
                <TableCell>Jumlah APJ</TableCell>
                <TableCell>Nama Jalan</TableCell>
                <TableCell>Desa/Kel</TableCell>
                <TableCell>Kecamatan</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {currentItems.map((panel, index) => (
                <TableRow key={index}>
                  <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                  <TableCell>{panel.lapisan}</TableCell>
                  <TableCell>{panel.no_app}</TableCell>
                  <TableCell>{panel.longitude}</TableCell>
                  <TableCell>{panel.latitude}</TableCell>
                  <TableCell>{panel.abd_no}</TableCell>
                  <TableCell>{panel.no_pondasi_tiang}</TableCell>
                  <TableCell>{panel.jumlah_pju}</TableCell>
                  <TableCell>{panel.nama_jalan}</TableCell>
                  <TableCell>{panel.desa_kel}</TableCell>
                  <TableCell>{panel.kecamatan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TableFooter>
            <Pagination
              totalResults={filteredPanels.length}
              resultsPerPage={itemsPerPage}
              onChange={handlePageChange}
              label="Table navigation"
              currentPage={currentPage}
            />
          </TableFooter>
        </TableContainer>
      )}
    </>
  );
};

export default Panel;
