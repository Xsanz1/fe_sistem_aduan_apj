import React, { useState, useEffect } from 'react'
import { Input, Label, Button, Textarea, Select } from '@windmill/react-ui'
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2';

function TambahAduan({ onSubmit }) {
  const [formData, setFormData] = useState({
    pelapor: '',
    nomorPengaduan: '',
    masalah: '',
    idTiang: '',
    idPanel: '',
    jamPengaduan: '',
    tanggalPengaduan: '',
    lokasi: '',
    foto: null,
    status: '',
  })
  const [tiangOptions, setTiangOptions] = useState([]);
  const [panelOptions, setPanelOptions] = useState([]);

  useEffect(() => {
    // Fetching data for No_Tiang_baru and No_App options
    async function fetchData() {
      try {
        const responseTiang = await fetch('API_URL_FOR_NO_TIANG'); // Replace with your API URL
        const dataTiang = await responseTiang.json();
        setTiangOptions(dataTiang);

        const responsePanel = await fetch('API_URL_FOR_NO_APP'); // Replace with your API URL
        const dataPanel = await responsePanel.json();
        setPanelOptions(dataPanel);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();

    // Initialize Select2
    $('#idTiang').select2({
      placeholder: 'Pilih ID Tiang',
      allowClear: true,
    }).on('change', function () {
      setFormData((prevData) => ({
        ...prevData,
        idTiang: $(this).val(),
      }));
    });

    $('#idPanel').select2({
      placeholder: 'Pilih ID Panel',
      allowClear: true,
    }).on('change', function () {
      setFormData((prevData) => ({
        ...prevData,
        idPanel: $(this).val(),
      }));
    });
    
  }, []);

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  function handleFileChange(e) {
    setFormData({
      ...formData,
      foto: e.target.files[0],
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(formData)
    console.log(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-lg max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Form Tambah Aduan Masyarakat</h1>
      
      <Label className="block mb-4">
        <span className="text-gray-700 font-semibold">Pelapor</span>
        <Input 
          className="mt-2 block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
          name="pelapor" 
          value={formData.pelapor} 
          onChange={handleChange} 
          required 
          placeholder="Masukkan nama pelapor"
        />
      </Label>

      <Label className="block mb-4">
        <span className="text-gray-700 font-semibold">Nomor Pengaduan</span>
        <Input 
          className="mt-2 block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
          name="nomorPengaduan" 
          value={formData.nomorPengaduan} 
          onChange={handleChange} 
          required 
          placeholder="Masukkan nomor pengaduan"
        />
      </Label>

      <Label className="block mb-4">
        <span className="text-gray-700 font-semibold">Masalah</span>
        <Textarea 
          className="mt-2 block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
          name="masalah" 
          value={formData.masalah} 
          onChange={handleChange} 
          required 
          placeholder="Jelaskan masalahnya"
        />
      </Label>

      <Label className="block mb-4">
        <span className="text-gray-700 font-semibold">Id Tiang</span>
        <select 
          id="idTiang" 
          name="idTiang" 
          className="mt-2 block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
        >
          <option value="" disabled>Pilih ID Tiang</option>
          {tiangOptions.map((tiang) => (
            <option key={tiang.id} value={tiang.No_Tiang_baru}>
              {tiang.No_Tiang_baru}
            </option>
          ))}
        </select>
      </Label>

      <Label className="block mb-4">
        <span className="text-gray-700 font-semibold">Id Panel</span>
        <select 
          id="idPanel" 
          name="idPanel" 
          className="mt-2 block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
        >
          <option value="" disabled>Pilih ID Panel</option>
          {panelOptions.map((panel) => (
            <option key={panel.id} value={panel.No_App}>
              {panel.No_App}
            </option>
          ))}
        </select>
      </Label>

      <div className="flex justify-between space-x-4">
        <Label className="block mb-4 w-1/2">
          <span className="text-gray-700 font-semibold">Jam Pengaduan</span>
          <Input 
            className="mt-2 block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
            name="jamPengaduan" 
            type="time" 
            value={formData.jamPengaduan} 
            onChange={handleChange} 
            required 
          />
        </Label>

        <Label className="block mb-4 w-1/2">
          <span className="text-gray-700 font-semibold">Tanggal Pengaduan</span>
          <Input 
            className="mt-2 block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
            name="tanggalPengaduan" 
            type="date" 
            value={formData.tanggalPengaduan} 
            onChange={handleChange} 
            required 
          />
        </Label>
      </div>

      <Label className="block mb-4">
        <span className="text-gray-700 font-semibold">Lokasi</span>
        <Input 
          className="mt-2 block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
          name="lokasi" 
          value={formData.lokasi} 
          onChange={handleChange} 
          required 
          placeholder="Masukkan lokasi aduan"
        />
      </Label>

      <Label className="block mb-4">
        <span className="text-gray-700 font-semibold">Foto</span>
        <Input 
          className="mt-2 block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
          type="file" 
          name="foto" 
          onChange={handleFileChange} 
          accept="image/*" 
          required 
        />
      </Label>

      <Label className="block mb-6">
        <span className="text-gray-700 font-semibold">Status</span>
        <Select 
          className="mt-2 block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
          name="status" 
          value={formData.status} 
          onChange={handleChange} 
          required
        >
          <option value="" disabled>Pilih Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </Select>
      </Label>

      <div className="flex justify-end">
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md px-6 py-2">
          Submit
        </Button>
      </div>
    </form>
  )
}

export default TambahAduan
