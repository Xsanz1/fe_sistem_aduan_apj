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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from "@windmill/react-ui";
import axios from "axios";
import React, { useEffect, useState } from "react";
import PageTitle from "../components/Typography/PageTitle";
import SectionTitle from "../components/Typography/SectionTitle";
import { EditIcon, TrashIcon } from "../icons";
import Swal from "sweetalert2";

function User() {
  // State management
  const [pageTable1, setPageTable1] = useState(1);
  const [dataTable1, setDataTable1] = useState([]);
  const resultsPerPage = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const token = localStorage.getItem("access_token");

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    role: "Admin", // Default role
    password: "",
    foto: null, // For storing file
  });

  // Fetch users function
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched users:", response.data);
      setDataTable1(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Failed to fetch users. Please try again later.",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Save or update user
  const handleSave = async () => {
    const dataToSubmit = new FormData();
    dataToSubmit.append("name", formData.name);
    dataToSubmit.append("email", formData.email);
    dataToSubmit.append("username", formData.username);
    dataToSubmit.append("password", formData.password);
    dataToSubmit.append("role", formData.role);

    if (formData.foto) {
      dataToSubmit.append("foto", formData.foto);
    }

    dataToSubmit.append("_method", "PUT");

    try {
      if (isEditMode) {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/users/${currentUserId}`,
          dataToSubmit,
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
          text: "User updated successfully.",
        });
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/users`,
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
          text: "User added successfully.",
        });
      }

      fetchUsers();
      closeModal();
    } catch (error) {
      console.error(
        "Error saving user:",
        error.response?.data || error.message
      );
      Swal.fire({
        icon: "waning",
        title: "Warning",
        text:
          error.response?.data?.message ||
          "Failed to save user. Please try again.",
      });
    }
  };

  // Delete user
  const handleDelete = async (id_user) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Kamu ingin menghapus user ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${process.env.REACT_APP_API_BASE_URL}/users/${id_user}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "User has been deleted.",
          });
          fetchUsers();
        } catch (error) {
          console.error(
            "Error deleting user:",
            error.response?.data || error.message
          );
          Swal.fire({
            icon: "warning",
            title: "Peringatan",
            text:
              error.response?.data?.message ||
              "Failed to delete user. Please try again.",
          });
        }
      }
    });
  };

  // Handle photo upload
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
    } else {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Tidak ada file yang di pilih",
      });
    }
  };

  // Open modal for adding or editing user
  const openModal = (user = null) => {
    if (user) {
      setIsEditMode(true);
      setFormData(user);
      setCurrentUserId(user.id_user);
    } else {
      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "Admin",
        foto: null,
      });
      setCurrentUserId(null); // Reset ID jika menambah pengguna baru
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "Admin",
      foto: null,
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle pagination
  const onPageChangeTable1 = (p) => {
    setPageTable1(p);
  };

  return (
    <>
      <PageTitle>Tabel User</PageTitle>

      <div className="flex justify-between items-center mb-4">
        <SectionTitle>Data User</SectionTitle>
        <Button onClick={() => openModal()}>Tambah User</Button>
      </div>

      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Nama</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Foto</TableCell>
              <TableCell>Aksi</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {dataTable1
              .slice(
                (pageTable1 - 1) * resultsPerPage,
                pageTable1 * resultsPerPage
              )
              .map((user) => (
                <TableRow key={user.id_user}>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <div>
                        <p className="font-semibold">{user.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.username}</span>
                  </TableCell>
                  <TableCell>
                    <Badge type={user.role}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.foto && (
                      <img
                        src={`http://localhost:8000/storage/${user.foto}`}
                        alt="Foto"
                        style={{ height: "auto", maxWidth: "100px" }} // Sesuaikan ukuran gambar
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => openModal(user)}
                      icon={EditIcon}
                      className="mr-2"
                    ></Button>
                    <Button
                      onClick={() => handleDelete(user.id_user)}
                      icon={TrashIcon}
                    ></Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            resultsPerPage={resultsPerPage}
            onChange={onPageChangeTable1}
            label="Table navigation"
            totalResults={dataTable1.length}
          />
        </TableFooter>
      </TableContainer>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader>{isEditMode ? "Edit User" : "Tambah User"}</ModalHeader>
        <ModalBody>
          <Label>
            <span>Nama</span>
            <Input
              className="mt-1"
              placeholder="Masukkan nama"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Label>
          <Label className="mt-4">
            <span>Email</span>
            <Input
              className="mt-1"
              placeholder="Masukkan email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Label>
          <Label className="mt-4">
            <span>Username</span>
            <Input
              className="mt-1"
              placeholder="Masukkan username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </Label>
          <Label className="mt-4">
            <span>Password</span>
            <Input
              className="mt-1"
              placeholder="Masukkan password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Label>
          <Label className="mt-4">
            <span>Role</span>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Admin">Admin</option>
              <option value="Dishub">Dishub</option>
              <option value="Superadmin">Superadmin</option>{" "}
              {/* Tambahkan jika perlu */}
            </select>
          </Label>
          <Label>
            <span>Foto</span>
            <Input
              type="file"
              className="mt-1"
              name="foto"
              onChange={handleFileChange}
            />
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

export default User;
