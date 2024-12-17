import React, { useState, useEffect } from 'react';
import { Input, Button, Label, Avatar } from '@windmill/react-ui';
import axios from 'axios';
import Swal from 'sweetalert2';

function Profile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    foto: '',
  });

  const [previewFoto, setPreviewFoto] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch user profile data based on the logged-in user
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        Swal.fire('Error', 'No access token found. Please log in.', 'error');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      setPreviewFoto(response.data.foto);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Swal.fire('Error', 'Could not fetch profile data. Please try again later.', 'error');
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Handle file upload for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUser({ ...user, foto: file });
    setPreviewFoto(URL.createObjectURL(file));
  };

  // Save changes to user profile
  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('username', user.username);
    formData.append('role', user.role);
    if (user.foto instanceof File) {
      formData.append('foto', user.foto);
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://localhost:8000/api/users/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire('Success', 'Profile updated successfully!', 'success');
      setIsEditing(false);
      fetchUserProfile(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire('Error', 'Could not update profile. Please try again later.', 'error');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Profile</h2>
      <div className="mt-4">
        {/* Display Profile Picture */}
        <div className="mb-4 flex justify-center">
          <Avatar className="w-32 h-32" src={previewFoto ? `http://localhost:8000/storage/${previewFoto}` : ''} alt="User Foto" />
        </div>
        
        {/* Upload New Profile Picture */}
        {isEditing && (
          <Label>
            <span>Profile Picture</span>
            <Input type="file" name="foto" onChange={handleFileChange} className="mt-2" />
          </Label>
        )}
        
        {/* Display and Edit Profile Fields */}
        <Label className="mt-4">
          <span>Name</span>
          <Input className="mt-1" name="name" value={user.name} onChange={handleChange} disabled={!isEditing} />
        </Label>

        <Label className="mt-4">
          <span>Email</span>
          <Input className="mt-1" name="email" value={user.email} onChange={handleChange} disabled={!isEditing} />
        </Label>

        <Label className="mt-4">
          <span>Username</span>
          <Input className="mt-1" name="username" value={user.username} onChange={handleChange} disabled={!isEditing} />
        </Label>

        <Label className="mt-4">
          <span>Role</span>
          <Input className="mt-1" name="role" value={user.role} disabled />
        </Label>

        {/* Edit and Save Buttons */}
        <div className="mt-6 flex justify-end">
          {isEditing ? (
            <Button onClick={handleSave}>Save</Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          )}
          {isEditing && (
            <Button className="ml-2" layout="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
