import {
  Badge,
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from "@windmill/react-ui";
import axios from "axios";
import Compressor from "compressorjs";
import $, { data } from "jquery";
import React, { useEffect, useState } from "react";
import "select2/dist/css/select2.min.css";
import "select2/dist/js/select2.min.js";
import Swal from "sweetalert2";
import PageTitle from "../components/Typography/PageTitle";
import SectionTitle from "../components/Typography/SectionTitle";
import { EditIcon, TrashIcon } from "../icons";
import LoadingPage from "../components/LoadingPage";

function Tables() {
  const [pageTable1, setPageTable1] = useState(1);
  const [dataTable1, setDataTable1] = useState([]);
  const resultsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [role, setRole] = useState("");
  const [jamAduan, setJamAduan] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Set bulan default ke bulan saat ini
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Set tahun default ke tahun saat ini
  const [pengaduan, setPengaduan] = useState([]);
  const [uploadMethod, setUploadMethod] = useState("file"); // Default pilihan adalah 'file'

  const [optionsTiang, setOptionsTiang] = useState([]);
  const [optionsPanel, setOptionsPanel] = useState([]);
  const [loading, setLoading] = useState(true); // Set loading state to true initially
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    pelapor: "",
    kondisi_masalah: "",
    panel_id: "",
    pju_id: [],
    lokasi: "",
    foto_pengaduan: null,
    tanggal_pengaduan: "",
    jam_aduan: "",
    jam_penginformasian: "",
    keterangan_masalah: "",
    foto_penanganan: null,
    uraian_masalah: "",
    tanggal_penyelesaian: "",
    jam_penyelesaian: "",
    durasi_penyelesaian: "",
    penyelesaian_masalah: "",
    pencegahan_masalah: "",
    pengelompokan_masalah: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchData();
    const userRole = localStorage.getItem("role");
    setRole(userRole);
  }, []);

  // Mendapatkan bulan dan tahun saat ini
  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1; // +1 karena getMonth() mengembalikan bulan dengan index 0 untuk Januari
    const currentYear = new Date().getFullYear(); // Tahun saat ini

    setSelectedMonth(currentMonth); // Set bulan saat ini
    setSelectedYear(currentYear); // Set tahun saat ini
  }, []);

  const token = localStorage.getItem("access_token");

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/pengaduan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDataTable1(response.data);
      fetchDropdownData();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Set loading to false after data fetching is done
    }
  };

  const fetchDropdownData = async () => {
    try {
      const panelResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/panels/no-app`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOptionsPanel(panelResponse.data.datas || []);

      console.log("Panel Response:", panelResponse.data);

      const tiangResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/pjus/no-tiang-baru`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Tiang Response:", tiangResponse.data);

      setOptionsTiang(tiangResponse.data.datas || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handlePanelChange = async (panelId) => {
    try {
      setLoading(true); // Mulai loading
      console.log("Fetching APJ for panel ID:", panelId);

      // Validasi Panel
      const validationResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/panel/${panelId}/validate`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Validation Response:", validationResponse.data);

      if (validationResponse.data.message === "Panel tersedia untuk dipilih.") {
        console.log("Panel is available");

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/pjus/by-panel/${panelId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("APJ Data for Panel:", response.data.datas);

        setOptionsTiang(response.data.datas || []); // Memperbarui opsi APJ
        setFormData((prevState) => ({
          ...prevState,
          panel_id: panelId,
          pju_id: [], // Reset APJ ID saat panel diubah
        }));
      } else {
        Swal.fire({
          title: "Panel Tidak Tersedia",
          text: "Panel ini tidak dapat dipilih karena sedang terhubung dengan pengaduan yang belum selesai.",
          icon: "warning",
        });

        setFormData((prevState) => ({
          ...prevState,
          panel_id: "",
          pju_id: [], // Reset APJ ID jika panel tidak tersedia
        }));
      }
    } catch (error) {
      console.error("Error fetching APJ data or validating panel:", error);
      Swal.fire({
        title: "Warning",
        text: "Panel ini tidak dapat dipilih karena sedang terhubung dengan pengaduan yang belum selesai.",
        icon: "warning",
      });
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  // Mengambil data pengaduan pertama kali ketika komponen dimuat
  useEffect(() => {
    handleFilterChange(selectedMonth, selectedYear);
  }, []); // Empty dependency array, hanya dijalankan sekali saat komponen dimuat

  const openModalForAdd = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.toTimeString().split(" ")[0];

    setIsEditMode(false);
    setIsModalOpen(true);
    setFormData({
      pelapor: "",
      kondisi_masalah: "",
      panel_id: [],
      pju_id: [],
      lokasi: "",
      foto_pengaduan: null,
      tanggal_pengaduan: formattedDate,
      jam_aduan: "",
      jam_penginformasian: formattedTime,
      keterangan_masalah: "",
      foto_penanganan: null,
      uraian_masalah: "",
      tanggal_penyelesaian: "",
      jam_penyelesaian: "",
      durasi_penyelesaian: "",
      penyelesaian_masalah: "",
      pencegahan_masalah: "",
      penngelompokan_masalah: "",
      status: "Pending",
    });
  };

  const openModalForEdit = (pengaduan) => {
    console.log("Pengaduan Data:", pengaduan); // Debugging

    setIsEditMode(true);
    setEditId(pengaduan.id_pengaduan);
    setFormData({
      pelapor: pengaduan.pelapor,
      kondisi_masalah: pengaduan.kondisi_masalah,
      panel_id: pengaduan.detail_pengaduans
        ? pengaduan.detail_pengaduans.map((detail) => detail.panel_id)
        : [],
      pju_id: pengaduan.detail_pengaduans
        ? pengaduan.detail_pengaduans.map((detail) => detail.pju_id)
        : [],
      lokasi: pengaduan.lokasi,
      foto_pengaduan: pengaduan.foto_pengaduan,
      tanggal_pengaduan: pengaduan.tanggal_pengaduan,
      jam_aduan: pengaduan.jam_aduan,
      jam_penginformasian: pengaduan.jam_penginformasian,
      keterangan_masalah: pengaduan.keterangan_masalah,
      foto_penanganan: pengaduan.foto_penanganan || null,
      uraian_masalah: pengaduan.uraian_masalah || "",
      tanggal_penyelesaian: pengaduan.tanggal_penyelesaian || "",
      jam_penyelesaian: pengaduan.jam_penyelesaian || "",
      durasi_penyelesaian: pengaduan.durasi_penyelesaian || "",
      penyelesaian_masalah: pengaduan.penyelesaian_masalah || "",
      pencegahan_masalah: pengaduan.pencegahan_masalah || "",
      pengelompokan_masalah: pengaduan.pengelompokan_masalah || "",

      status: pengaduan.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    setLoading(true); // Menandakan proses penyimpanan sedang berlangsung

    try {
      // Membuat FormData untuk mengirim data melalui POST/PUT request
      const payload = new FormData();

      // Iterasi data formData dan menambahkan ke payload
      for (const key in formData) {
        if (
          (key === "foto_pengaduan" || key === "foto_penanganan") &&
          formData[key]
        ) {
          payload.append(key, formData[key]); // Menambahkan file gambar
        } else if (Array.isArray(formData[key])) {
          formData[key].forEach((item) => payload.append(`${key}[]`, item)); // Handle array
        } else {
          payload.append(key, formData[key]); // Tambahkan field lain
        }
      }

      if (isEditMode) {
        payload.append("_method", "PUT"); // Laravel membutuhkan ini untuk metode PUT melalui FormData
      }

      const url = `${process.env.REACT_APP_API_BASE_URL}/pengaduan${
        isEditMode ? `/${editId}` : ""
      }`;

      // Tampilkan loading SweetAlert2
      Swal.fire({
        title: isEditMode ? "Memperbarui Data..." : "Menyimpan Data...",
        text: "Harap tunggu, data sedang diproses.",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        // Tampilkan pesan sukses
        Swal.fire({
          title: isEditMode ? "Berhasil Diperbarui!" : "Berhasil Disimpan!",
          text: `Pengaduan berhasil ${isEditMode ? "diperbarui" : "disimpan"}.`,
          icon: "success",
          confirmButtonText: "OK",
        });

        await fetchData(); // Memuat ulang data pengaduan setelah disimpan
        window.location.reload();
        closeModal(); // Menutup modal setelah data disimpan
      } else {
        // Tampilkan pesan peringatan jika status bukan 200
        Swal.fire({
          title: "Peringatan",
          text: "Terjadi kesalahan saat menyimpan data.",
          icon: "warning",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error saving pengaduan:", error);

      // Tangani error dari server
      const errorMessage =
        error.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.";

      // Tampilkan pesan error
      Swal.fire({
        title: "Gagal!",
        text: errorMessage,
        icon: "warning",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false); // Menghentikan status loading
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      $("#panel_id")
        .select2({
          placeholder: "--- Pilih Nomor Panel ---",
          allowClear: true,
        })
        .on("change", async (e) => {
          const selectedValues = $(e.target).val();
          console.log("Selected Panel ID (select2):", selectedValues);

          setFormData((prevState) => ({
            ...prevState,
            panel_id: selectedValues || [],
          }));

          // Panggil handlePanelChange untuk memfilter APJ ID
          if (selectedValues && selectedValues.length > 0) {
            await handlePanelChange(selectedValues[0]); // Panggil fungsi dengan panel ID yang dipilih
          }
        })
        .val(formData.panel_id || [])
        .trigger("change");

      return () => {
        $("#panel_id").select2("destroy");
      };
    }
  }, [isModalOpen, optionsPanel]);

  useEffect(() => {
    if (isModalOpen) {
      $("#pju_id")
        .select2({
          placeholder: "--- Pilih Nomor Tiang ---",
          allowClear: true,
          multiple: true,
        })
        .on("change", (e) => {
          const selectedValues = $(e.target).val(); // Dapatkan nilai sebagai array
          console.log("Selected APJ IDs (Select2):", selectedValues);

          setFormData((prevState) => ({
            ...prevState,
            pju_id: selectedValues || [], // Update state
          }));
        })
        .val(formData.pju_id || [])
        .trigger("change"); // Sinkronkan nilai awal

      return () => {
        $("#pju_id").select2("destroy"); // Hancurkan select2 saat modal ditutup
      };
    }
  }, [isModalOpen, optionsTiang]);

  const handleExportWord = async () => {
    try {
      // Tampilkan loading alert
      Swal.fire({
        title: "Mengekspor Data",
        text: "Mohon tunggu, file sedang diproses...",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Lakukan fetch ke API
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/pengaduan/exportWord`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, // Tambahkan token di header Authorization
          },
        }
      );

      // Cek apakah respons berhasil
      if (!response.ok) {
        throw new Error("Gagal mengekspor data. Silakan coba lagi.");
      }

      // Ambil file blob dari respons
      const blob = await response.blob();

      // Buat URL untuk mengunduh file
      const url = window.URL.createObjectURL(blob);

      // Buat elemen anchor untuk unduhan
      const a = document.createElement("a");
      a.href = url;

      // Nama file Word
      a.download = `Laporan_Pengaduan_${new Date()
        .toISOString()
        .slice(0, 10)}.docx`;
      a.click();

      // Hapus URL blob setelah selesai
      window.URL.revokeObjectURL(url);
      window.location.reload();

      // Tampilkan alert sukses
      Swal.fire({
        title: "Berhasil!",
        text: "File berhasil diunduh.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error saat mengekspor data:", error);

      // Tampilkan alert error
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat mengekspor file. Silakan coba lagi.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  const handleExport = async () => {
    if (!selectedMonth || !selectedYear) {
      // Tampilkan pesan error jika bulan dan tahun belum dipilih
      Swal.fire({
        title: "Warning!",
        text: "Pilih bulan dan tahun terlebih dahulu.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      // Tampilkan loading sebelum proses berjalan
      Swal.fire({
        title: "Sedang memproses...",
        text: "Harap tunggu sementara data sedang diekspor.",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Lakukan request ke API
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/pengaduan/export_excel?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Token autentikasi
          },
          responseType: "blob", // Mendapatkan file dalam format biner
        }
      );

      // Membuat URL file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Nama file ekspor berdasarkan bulan dan tahun
      const fileName = `pengaduan_${selectedYear}-${selectedMonth
        .toString()
        .padStart(2, "0")}.xlsx`;
      link.setAttribute("download", fileName);

      // Tambahkan link ke dokumen dan klik untuk mengunduh
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Tampilkan pesan sukses setelah file diunduh
      Swal.fire({
        title: "Berhasil!",
        text: "File berhasil diunduh.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error saat mengekspor data:", error);

      // Tampilkan pesan error jika terjadi kesalahan
      Swal.fire({
        title: "Gagal!",
        text: "Tidak ada pengaduan untuk bulan dan tahun ini",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDelete = async (id_pengaduan) => {
    try {
      // Tampilkan konfirmasi sebelum menghapus
      const confirmation = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: "Apakah Anda yakin ingin menghapus pengaduan ini? Tindakan ini tidak dapat dibatalkan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33", // Warna tombol hapus (merah)
        cancelButtonColor: "#3085d6", // Warna tombol batal (biru)
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Tidak, batalkan",
      });

      // Jika pengguna mengonfirmasi penghapusan
      if (confirmation.isConfirmed) {
        // Tampilkan loading
        Swal.fire({
          title: "Menghapus...",
          text: "Harap tunggu sementara pengaduan sedang dihapus.",
          icon: "info",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Lakukan permintaan hapus ke server
        await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/pengaduan/${id_pengaduan}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Token autentikasi
            },
          }
        );

        // Tampilkan pesan sukses setelah berhasil menghapus
        Swal.fire({
          title: "Berhasil!",
          text: "Pengaduan berhasil dihapus.",
          icon: "success",
          confirmButtonText: "OK",
        });

        // Perbarui data setelah penghapusan
        fetchData();
        window.location.reload();
      } else {
        // Jika pengguna membatalkan
        Swal.fire({
          title: "Dibatalkan",
          text: "Penghapusan pengaduan dibatalkan.",
          icon: "info",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error deleting pengaduan:", error);

      // Tampilkan pesan error jika terjadi kesalahan
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menghapus pengaduan. Silakan coba lagi.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  // Menangani perubahan kondisi masalah dan memutuskan apakah pju_id wajib diisi
  const handleKondisiMasalahChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      kondisi_masalah: value,
      pju_id: value === "Panel" ? [] : prevState.pju_id, // Reset pju_id jika kondisi masalah adalah "Panel"
    }));
  };

  // Untuk memeriksa apakah kondisi masalah adalah "Panel" atau "Tiang" dan mengubah validitas pju_id
  const isPjuIdRequired = formData.kondisi_masalah !== "Panel";

  const openModalForImport = () => {
    setIsImportModalOpen(true);
  };

  const closeModalForImport = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
  };

  const handleImport = async () => {
    if (!importFile) {
      // Tampilkan pesan error jika file tidak dipilih
      Swal.fire({
        title: "Peringatan",
        text: "Pilih file untuk di-import terlebih dahulu.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      // Tampilkan loading saat proses impor dimulai
      Swal.fire({
        title: "Mengimpor Data...",
        text: "Harap tunggu, file sedang diproses.",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Kirim request impor ke server
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/import-pengaduan`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Token autentikasi
            "Content-Type": "multipart/form-data", // Header untuk file upload
          },
        }
      );

      // Tampilkan pesan sukses setelah impor berhasil
      Swal.fire({
        title: "Berhasil!",
        text: "Data berhasil di-import.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Tutup modal impor dan perbarui data
      closeModalForImport();
      fetchData();
      window.location.reload();
    } catch (error) {
      console.error("Error importing data:", error);

      // Tangani error dan tampilkan pesan yang sesuai
      Swal.fire({
        title: "Gagal!",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan saat mengimpor data. Pastikan file sesuai format.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Fungsi untuk menangani perubahan jam
  const handleJamChange = (event) => {
    setJamAduan(event.target.value);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    console.log(files); // Log untuk memverifikasi apakah file diambil dari kamera atau perangkat lain

    if (files && files.length > 0) {
      const file = files[0]; // Ambil file pertama

      // Gunakan Compressor.js untuk mengompresi gambar
      new Compressor(file, {
        quality: 0.6, // Kualitas gambar (0.0 - 1.0)
        maxWidth: 800, // Lebar maksimum gambar setelah kompresi
        maxHeight: 800, // Tinggi maksimum gambar setelah kompresi
        success(compressedFile) {
          // File berhasil dikompresi
          setFormData((prevState) => ({
            ...prevState,
            [name]: compressedFile, // Simpan file yang sudah dikompresi
          }));
          console.log("File berhasil dikompresi:", compressedFile);

          // Tampilkan pesan sukses dengan SweetAlert2
          Swal.fire({
            title: "Berhasil!",
            text: "Gambar berhasil dikompresi.",
            icon: "success",
            confirmButtonText: "OK",
          });
        },
        error(err) {
          console.error("Gagal mengompresi file:", err);

          // Tampilkan pesan error jika kompresi gagal
          Swal.fire({
            title: "Warning",
            text: "Gagal mengompresi gambar. Silakan coba lagi.",
            icon: "warning",
            confirmButtonText: "OK",
          });
        },
      });
    } else {
      // Tampilkan peringatan jika tidak ada file yang dipilih
      Swal.fire({
        title: "Peringatan",
        text: "Tidak ada file yang dipilih. Silakan pilih file terlebih dahulu.",
        icon: "warning",
        confirmButtonText: "OK",
      });
    }
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 2020; i--) {
    years.push(i);
  }

  // Fungsi untuk mengambil data pengaduan berdasarkan filter
  const handleFilterChange = (month, year) => {
    setLoading(true);
    setError(null);

    fetch(
      `${process.env.REACT_APP_API_BASE_URL}/pengaduan?month=${month}&year=${year}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setPengaduan(data); // Set data pengaduan ke state
        setLoading(false);
      })
      .catch((err) => {
        setError("Data tidak ditemukan atau terjadi kesalahan.");
        setLoading(false);
      });
  };

  useEffect(() => {
    console.log("Data pengaduan yang diterima di state:", dataTable1);
  }, [dataTable1]); // Memeriksa data setiap kali dataTable1 diperbarui

  useEffect(() => {
    handleFilterChange(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  return (
    <>
      <PageTitle>Tabel Pengaduan Masyarakat</PageTitle>

      {/* Display loading screen */}
      {loading && <LoadingPage />}

      {/* Show error if any */}
      {error && <p className="text-red-600">{error}</p>}

      {/* The main table after loading is complete */}
      {!loading && !error && (
        <div className="flex justify-between items-center mb-4">
          <SectionTitle>Data Pengaduan</SectionTitle>
          <div>
            {/* Tampilkan tombol "Tambah Aduan" hanya untuk dishub */}
            {role === "dishub" && (
              <Button onClick={openModalForAdd} className="mr-2">
                Tambah Aduan
              </Button>
            )}

            {/* Tampilkan tombol Export dan Import hanya untuk admin */}
            {role === "admin" && (
              <>
                <Button
                  onClick={handleExportWord}
                  className="bg-green-500 text-white mr-2"
                >
                  Export ke word
                </Button>
                <Button
                  onClick={handleExport}
                  className="bg-green-500 text-white mr-2"
                >
                  Export ke Excel
                </Button>
                <Button
                  onClick={openModalForImport}
                  className="bg-blue-500 text-white"
                >
                  Import dari Excel
                </Button>
              </>
            )}
          </div>
          {/* Dropdown untuk memilih bulan */}
          <div className="flex items-center">
            <label htmlFor="month-select" className="mr-2">
              Bulan:
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="form-select"
            >
              {[...Array(12)].map((_, index) => (
                <option key={index} value={index + 1}>
                  {new Date(0, index).toLocaleString("id-ID", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown untuk memilih tahun */}
          <div className="flex items-center">
            <label htmlFor="year-select" className="mr-2">
              Tahun:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="form-select"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {/* Tabel data pengaduan */}
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>No</TableCell>
              <TableCell>Nomor Pengaduan</TableCell>
              <TableCell>Pelapor</TableCell>
              <TableCell>Kondisi Masalah</TableCell>
              <TableCell>Id Panel</TableCell>
              <TableCell>Id Tiang</TableCell>
              <TableCell>Lokasi</TableCell>
              <TableCell>Foto Pengaduan</TableCell>
              <TableCell>Tanggal Pengaduan</TableCell>
              <TableCell>Jam Aduan</TableCell>
              <TableCell>Jam Penginformasian</TableCell>
              <TableCell>Keterangan Masalah</TableCell>
              <TableCell>Foto Penanganan</TableCell>
              <TableCell>Uraian Masalah</TableCell>
              <TableCell>Tanggal Penyelesaian</TableCell>
              <TableCell>Jam Penyelesaian</TableCell>
              <TableCell>Durasi Penyelesaian</TableCell>
              <TableCell>Penyelesaian Masalah</TableCell>
              <TableCell>Pencegahan Masalah</TableCell>
              <TableCell>Pengelompokan Masalah</TableCell>
              <TableCell>Status</TableCell>
              {role === "admin" && <TableCell>Aksi</TableCell>}
            </tr>
          </TableHeader>
          <TableBody>
            {pengaduan.length > 0 ? (
              pengaduan
                .slice(
                  (pageTable1 - 1) * resultsPerPage,
                  pageTable1 * resultsPerPage
                )
                .map((pengaduan, index) => (
                  <TableRow key={pengaduan.id_pengaduan}>
                    <TableCell>
                      <span className="text-sm">
                        {index + 1 + (pageTable1 - 1) * resultsPerPage}
                      </span>
                    </TableCell>
                    <TableCell>{pengaduan.nomor_pengaduan}</TableCell>
                    <TableCell>{pengaduan.pelapor || "-"}</TableCell>
                    <TableCell>{pengaduan.kondisi_masalah || "-"}</TableCell>
                    <TableCell>
                      {pengaduan.detail_pengaduans.length > 0
                        ? pengaduan.detail_pengaduans[0].panel?.no_app || "-"
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {pengaduan.detail_pengaduans.map((detail, index) => (
                        <React.Fragment key={index}>
                          {detail.pju?.no_tiang_baru || "-"}{" "}
                          {/* Gunakan optional chaining */}
                          <br /> {/* Tambahkan elemen <br> untuk baris baru */}
                        </React.Fragment>
                      ))}
                    </TableCell>
                    <TableCell>{pengaduan.lokasi || "-"}</TableCell>
                    <TableCell>
                      {pengaduan.foto_pengaduan && (
                        <img
                          src={`http://localhost:8000/storage/${pengaduan.foto_pengaduan}`}
                          alt="Foto Pengaduan"
                          style={{ height: "50px" }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{pengaduan.tanggal_pengaduan || "-"}</TableCell>
                    <TableCell>{pengaduan.jam_aduan || "-"}</TableCell>
                    <TableCell>
                      {pengaduan.jam_penginformasian || "-"}
                    </TableCell>
                    <TableCell>{pengaduan.keterangan_masalah || "-"}</TableCell>
                    <TableCell>
                      {pengaduan.foto_penanganan && (
                        <img
                          src={`http://localhost:8000/storage/${pengaduan.foto_penanganan}`}
                          alt="foto Penanganan"
                          style={{ height: "50px" }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{pengaduan.uraian_masalah || "-"}</TableCell>
                    <TableCell>
                      {pengaduan.tanggal_penyelesaian || "-"}
                    </TableCell>
                    <TableCell>{pengaduan.jam_penyelesaian || "-"}</TableCell>
                    <TableCell>
                      {pengaduan.durasi_penyelesaian || "-"}
                    </TableCell>
                    <TableCell>
                      {pengaduan.penyelesaian_masalah || "-"}
                    </TableCell>
                    <TableCell>{pengaduan.pencegahan_masalah || "-"}</TableCell>
                    <TableCell>
                      {pengaduan.pengelompokan_masalah || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        type={
                          pengaduan.status === "Selesai"
                            ? "success"
                            : pengaduan.status === "Proses"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {pengaduan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {role === "admin" && (
                        <>
                          <Button
                            icon={EditIcon}
                            onClick={() => openModalForEdit(pengaduan)}
                            className="mr-2"
                          ></Button>
                          <Button
                            icon={TrashIcon}
                            onClick={() => handleDelete(pengaduan.id_pengaduan)}
                          ></Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={18}>
                  Tidak ada data yang ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            resultsPerPage={resultsPerPage}
            onChange={setPageTable1}
            label="Table navigation"
            totalResults={pengaduan.length}
          />
        </TableFooter>
      </TableContainer>

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

          {/* Tambahkan tombol unduh template */}
          <div className="mt-4">
            <button
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              onClick={async () => {
                try {
                  // Ambil token dari localStorage
                  const token = localStorage.getItem("access_token");

                  // Panggil API untuk mendapatkan template
                  const response = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/export-template`,
                    {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${token}`, // Token autentikasi
                      },
                    }
                  );

                  if (!response.ok) {
                    throw new Error("Gagal mengunduh template");
                  }

                  // Ambil file sebagai blob
                  const blob = await response.blob();

                  // Buat link download
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "Template_Pengaduan.xlsx";
                  link.click();

                  // Hapus URL blob
                  window.URL.revokeObjectURL(url);

                  // Tampilkan SweetAlert2 untuk sukses
                  Swal.fire({
                    icon: "success",
                    title: "Unduhan Sukses",
                    text: "Template Pengaduan berhasil diunduh!",
                  });
                } catch (error) {
                  console.error("Error downloading template:", error);

                  // Tampilkan SweetAlert2 untuk error
                  Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Gagal mengunduh template. Silakan coba lagi.",
                  });
                }
              }}
            >
              Unduh Template
            </button>
          </div>
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
      {/* Modal Tambah/Edit Aduan */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader>
          {isEditMode ? "Edit Pengaduan" : "Tambah Pengaduan"}
        </ModalHeader>
        <ModalBody style={{ maxHeight: "400px", overflowY: "auto" }}>
          <Label>
            <span>Pelapor</span>
            <Input
              className="mt-1"
              placeholder="Masukkan nama pelapor"
              name="pelapor"
              value={formData.pelapor}
              onChange={handleChange}
            />
          </Label>

          <Label className="mt-4">
            <span>Kondisi Masalah</span>
            <Select
              className="mt-1"
              name="kondisi_masalah"
              value={formData.kondisi_masalah}
              onChange={handleKondisiMasalahChange}
            >
              <option value="Tiang">Tiang</option>
              <option value="Panel">Panel</option>
              <option value="1 Line">1 Line</option>{" "}
            </Select>
          </Label>

          <Label className="mt-4">
            <span>Id Panel</span>
            <Select
              name="panel_id"
              id="panel_id"
              onChange={(e) => handlePanelChange(e.target.value)}
            >
              <option value="" disabled>
                -- Pilih Nomor Panel --
              </option>
              {optionsPanel.length > 0 ? (
                optionsPanel.map((item) => (
                  <option key={item.panel_id} value={item.panel_id}>
                    {item.no_app}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Tidak ada data
                </option>
              )}
            </Select>
          </Label>

          {formData.kondisi_masalah !== "Panel" && (
            <Label className="mt-4">
              <span>Id Tiang</span>
              <Select
                name="pju_id"
                id="pju_id"
                multiple
                onChange={(e) => {
                  const selectedValues = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  console.log("Selected APJ IDs:", selectedValues);
                  setFormData((prevState) => ({
                    ...prevState,
                    pju_id: selectedValues,
                  }));
                }}
              >
                <option value="" disabled>
                  -- Pilih Nomor Tiang --
                </option>
                {optionsTiang.length > 0 ? (
                  optionsTiang.map((item) => (
                    <option key={item.id_pju} value={item.id_pju}>
                      {item.no_tiang_baru}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Tidak ada data
                  </option>
                )}
              </Select>
            </Label>
          )}

          <Label className="mt-4">
            <span>Lokasi</span>
            <Input
              className="mt-1"
              placeholder="Masukkan lokasi"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
            />
          </Label>

          <Label className="mt-4">
            <span>Foto Pengaduan</span>

            {/* Pilihan untuk upload file */}
            <div>
              <input
                type="radio"
                id="fileUpload"
                name="uploadMethod"
                value="file"
                checked={uploadMethod === "file"}
                onChange={() => setUploadMethod("file")}
              />
              <label htmlFor="fileUpload">Pilih dari File</label>
            </div>

            {/* Pilihan untuk menggunakan kamera */}
            <div>
              <input
                type="radio"
                id="cameraUpload"
                name="uploadMethod"
                value="camera"
                checked={uploadMethod === "camera"}
                onChange={() => setUploadMethod("camera")}
              />
              <label htmlFor="cameraUpload">Gunakan Kamera</label>
            </div>

            {/* Input untuk memilih file */}
            {uploadMethod === "file" && (
              <Input
                type="file"
                className="mt-1"
                name="foto_pengaduan"
                accept="image/*"
                onChange={handleFileChange}
              />
            )}

            {/* Input untuk membuka kamera */}
            {uploadMethod === "camera" && (
              <Input
                type="file"
                className="mt-1"
                name="foto_pengaduan"
                accept="image/*"
                capture="camera"
                onChange={handleFileChange}
              />
            )}
          </Label>

          <Label className="mt-4">
            <span>Jam Aduan</span>
          </Label>
          <input
            type="time"
            className="mt-2 p-2 border border-gray-300 rounded"
            name="jam_aduan"
            value={formData.jam_aduan}
            onChange={handleChange}
          />

          <Label className="mt-4">
            <span>Keterangan Masalah</span>
            <Select
              className="mt-1"
              name="keterangan_masalah"
              value={formData.keterangan_masalah}
              onChange={handleChange}
              placeholder="Masukkan keterangan masalah"
            >
              <option value="">Pilih Keterangan Masalah</option>
              <option value="Mati 1 panel">Mati 1 panel</option>
              <option value="Mati 3 tiang">Mati 3 tiang</option>
              <option value="Mati 1 tiang">Mati 1 tiang</option>
              <option value="Apj mati 1 line">Apj mati 1 line</option>
              <option value="Mati 1 line">Mati 1 line</option>
              <option value="Mati 4 titik">Mati 4 titik</option>
              <option value="Mati lagi">Mati lagi</option>
              <option value="Mati 1 jalur">Mati 1 jalur</option>
              <option value="Mati 5">Mati 5</option>
              <option value="Mati 1 line">Mati 1 line</option>
              <option value="Tiang bengkok">Tiang bengkok</option>
              <option value="Mati semua">Mati semua</option>
              <option value="Mati satu deret">Mati satu deret</option>
              <option value="Mati satu lampu">Mati satu lampu</option>
              <option value="Mati 2 titik lampu">Mati 2 titik lampu</option>
            </Select>
          </Label>

          {isEditMode && (
            <>
              <Label className="mt-4">
                <span>Foto Penanganan</span>

                {/* Pilihan untuk upload file */}
                <div>
                  <input
                    type="radio"
                    id="fileUpload"
                    name="uploadMethod"
                    value="file"
                    checked={uploadMethod === "file"}
                    onChange={() => setUploadMethod("file")}
                  />
                  <label htmlFor="fileUpload">Pilih dari File</label>
                </div>

                {/* Pilihan untuk menggunakan kamera */}
                <div>
                  <input
                    type="radio"
                    id="cameraUpload"
                    name="uploadMethod"
                    value="camera"
                    checked={uploadMethod === "camera"}
                    onChange={() => setUploadMethod("camera")}
                  />
                  <label htmlFor="cameraUpload">Gunakan Kamera</label>
                </div>

                {/* Input untuk memilih file */}
                {uploadMethod === "file" && (
                  <Input
                    type="file"
                    className="mt-1"
                    name="foto_penanganan"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                )}

                {/* Input untuk membuka kamera */}
                {uploadMethod === "camera" && (
                  <Input
                    type="file"
                    className="mt-1"
                    name="foto_penanganan"
                    accept="image/*"
                    capture="camera"
                    onChange={handleFileChange}
                  />
                )}
              </Label>

              <Label className="mt-4">
                <span>Uraian Masalah</span>
                <Input
                  className="mt-1"
                  placeholder="Masukkan uraian masalah"
                  name="uraian_masalah"
                  value={formData.uraian_masalah}
                  onChange={handleChange}
                />
              </Label>

              <Label className="mt-4">
                <span>Penyelesaian Masalah</span>
                <Input
                  className="mt-1"
                  placeholder="Masukkan penyelesaian masalah"
                  name="penyelesaian_masalah"
                  value={formData.penyelesaian_masalah}
                  onChange={handleChange}
                />
              </Label>

              <Label className="mt-4">
                <span>Pencegahan Masalah</span>
                <Input
                  className="mt-1"
                  placeholder="Masukkan pencegahan masalah"
                  name="pencegahan_masalah"
                  value={formData.pencegahan_masalah}
                  onChange={handleChange}
                />
              </Label>

              <Label className="mt-4">
                <span>Pengelompokan Masalah</span>
                <Select
                  className="mt-1"
                  name="pengelompokan_masalah" // Pastikan nama ini sama dengan yang di formData
                  value={formData.pengelompokan_masalah}
                  onChange={handleChange}
                  disabled={role === "dishub"}
                >
                  <option value="Eksternal">Eksternal</option>
                  <option value="Internal">Internal</option>
                </Select>
              </Label>
            </>
          )}

          <Label className="mt-4">
            <span>Status</span>
            <Select
              className="mt-1"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={role === "dishub"}
            >
              <option value="Pending">Pending</option>
              <option value="Selesai">Selesai</option>
              <option value="Proses">Proses</option>
            </Select>
          </Label>
        </ModalBody>
        <ModalFooter>
          <Button layout="outline" onClick={closeModal}>
            Batal
          </Button>
          <Button onClick={handleSave}>
            {isEditMode ? "Update" : "Simpan"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default Tables;
