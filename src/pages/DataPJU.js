import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import PageTitle from "../components/Typography/PageTitle";
import SectionTitle from "../components/Typography/SectionTitle";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableFooter,
  TableContainer,
  Badge,
  Pagination,
  Button,
  Select,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
} from "@windmill/react-ui";
import axios from "axios";
import Swal from "sweetalert2";
import LoadingPage from "../components/LoadingPage";

function DataPJU() {
  const history = useHistory();
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);

  // Fetch data APJ
  const fetchData = () => {
    setLoading(true); // Tampilkan spinner
    setError(null);

    const token = localStorage.getItem("access_token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Access token is missing. Please log in again.",
      });
      setLoading(false); // Sembunyikan spinner jika error
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/pjus`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setAllData(response.data);
        setFilteredData(response.data);
        setLoading(false); // Sembunyikan spinner setelah fetch selesai
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch data. Please try again later.",
        });
        setLoading(false); // Sembunyikan spinner jika error
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi pencarian
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = allData.filter(
      (item) =>
        item.No_App?.toString().toLowerCase().includes(query) ||
        item.Nama_Jalan?.toLowerCase().includes(query) ||
        item.kecamatan?.toLowerCase().includes(query) ||
        item.Status_Jalan?.toLowerCase().includes(query)
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Fungsi paginasi
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Fungsi impor data
  const openModalForImport = () => {
    setIsImportModalOpen(true);
  };

  const closeModalForImport = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
  };

  // Fungsi impor data
  const handleImport = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Access token is missing. Please log in again.",
      });
      return;
    }

    if (!importFile) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Pilih file untuk di-import",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/import-pju`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Data berhasil di-import.",
      });
      closeModalForImport();
      fetchData(); // Refresh data setelah impor
    } catch (error) {
      console.error("Error importing data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal meng-import data.",
      });
    }
  };

  // Fungsi edit dan delete
 // Fungsi edit dan delete
const handleEdit = (id) => {
  history.push(`/EditAduan/${id}`);
};

const handleDelete = async (id) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Access token is missing. Please log in again.",
    });
    return;
  }

  const confirmResult = await Swal.fire({
    icon: "warning",
    title: "Konfirmasi",
    text: "Apakah Anda yakin ingin menghapus data ini?",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
  });

  if (!confirmResult.isConfirmed) return;

  try {
    await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/pjus/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setAllData(allData.filter((item) => item.id_pju !== id));
    setFilteredData(filteredData.filter((item) => item.id_pju !== id));
    Swal.fire({
      icon: "success",
      title: "Deleted",
      text: "Data berhasil dihapus.",
    });
  } catch (err) {
    console.error("Error deleting data:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Gagal menghapus data.",
    });
  }
};

  return (
    <>
      <PageTitle>Data APJ</PageTitle>

      {loading && <LoadingPage />}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
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

          <TableContainer className="mb-8">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>No</TableCell>
                  <TableCell>No. App</TableCell>
                  <TableCell>No. Tiang Lama</TableCell>
                  <TableCell>No. Tiang Baru</TableCell>
                  <TableCell>Nama Jalan</TableCell>
                  <TableCell>Kecamatan</TableCell>
                  <TableCell>Tinggi Tiang (m)</TableCell>
                  <TableCell>Jenis Tiang</TableCell>
                  <TableCell>Daya Lampu</TableCell>
                  <TableCell>Status Jalan</TableCell>
                  <TableCell>Longitude</TableCell>
                  <TableCell>Latitude</TableCell>
                  <TableCell>Actions</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {currentItems.map((pjus, index) => (
                  <TableRow key={pjus.id_pju}>
                    <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                    <TableCell>{pjus.panel_id}</TableCell>
                    <TableCell>{pjus.no_tiang_lama}</TableCell>
                    <TableCell>{pjus.no_tiang_baru}</TableCell>
                    <TableCell>{pjus.nama_jalan}</TableCell>
                    <TableCell>{pjus.kecamatan}</TableCell>
                    <TableCell>{pjus.tinggi_tiang}</TableCell>
                    <TableCell>{pjus.jenis_tiang}</TableCell>
                    <TableCell>{pjus.daya_lampu}</TableCell>
                    <TableCell>
                      <Badge
                        type={
                          pjus.status_jalan === "Jalan_Nasional"
                            ? "danger"
                            : pjus.status_jalan === "Jalan_Kabupaten"
                            ? "primary"
                            : "success"
                        }
                      >
                        {pjus.status_jalan}
                      </Badge>
                    </TableCell>
                    <TableCell>{pjus.longitude}</TableCell>
                    <TableCell>{pjus.latitude}</TableCell>
                    <TableCell>
                      <Button
                        layout="link"
                        size="small"
                        onClick={() => handleEdit(pjus.id_pju)}
                      >
                        Edit
                      </Button>
                      <Button
                        layout="link"
                        size="small"
                        onClick={() => handleDelete(pjus.id_pju)}
                        className="text-red-600"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TableFooter>
              <Pagination
                totalResults={filteredData.length}
                resultsPerPage={itemsPerPage}
                onChange={handlePageChange}
                label="Table navigation"
                currentPage={currentPage}
              />
            </TableFooter>
          </TableContainer>
        </>
      )}

      {/* Modal Import Excel */}
      <Modal isOpen={isImportModalOpen} onClose={closeModalForImport}>
        <ModalHeader>Import Data dari Excel</ModalHeader>
        <ModalBody>
          <Label>
            <span>Upload File Excel</span>
            <Input
              type="file"
              className="mt-1"
              accept=".xlsx, .xls"
              onChange={(e) => setImportFile(e.target.files[0])}
            />
          </Label>
        </ModalBody>
        <ModalFooter>
          <Button layout="outline" onClick={closeModalForImport}>
            Batal
          </Button>
          <Button onClick={handleImport} className="bg-blue-500 text-white">
            Import
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default DataPJU;
