import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

import ImageLight from '../assets/img/login-office.jpeg';
import ImageDark from '../assets/img/login-office-dark.jpeg';
import { Label, Input, Button } from '@windmill/react-ui';
import LoadingPage from '../components/LoadingPage'; // Import the LoadingPage component

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility toggle
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State to track loading
  const [loggedInUser, setLoggedInUser] = useState(null); // State to store the logged-in username
  const history = useHistory(); // Use useHistory for navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Start loading

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/login`, {
        username: username.trim(),
        password: password.trim(),
      });

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome back!',
        timer: 2000,
        showConfirmButton: false,
      });

      // Save token and role to localStorage
      localStorage.setItem('access_token', response.data.access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      localStorage.setItem('role', response.data.role);

      // Set the logged-in username
      setLoggedInUser(response.data.username); // Assuming the response contains the username

      // Redirect to dashboard after login
      setTimeout(() => {
        history.push('/app'); // Navigate to dashboard using useHistory
      }, 2000);
    } catch (err) {
      // Handle error response from server
      if (err.response) {
        const { status, data } = err.response;

        if (status === 401) {
          Swal.fire({
            icon: 'warning',
            title: 'Login Failed',
            text: data.error || 'Invalid username or password.',
          });
        } else if (status === 422) {
          Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please fill in all required fields.',
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Unexpected Error',
            text: 'An unexpected error occurred. Please try again.',
          });
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Network Error',
          text: 'Network error. Please check your internet connection.',
        });
      }
      // Show error alert
      Swal.fire({
        icon: 'warning',
        title: 'Login Failed',
        text: err.response?.data?.error || 'Failed to log in. Please try again.',
      });
    } finally {
      setLoading(false); // Stop loading once request is completed (success or failure)
    }
  };

  return (
    <>
      {loading && <LoadingPage />} {/* Show LoadingPage when loading is true */}

      {!loading && !loggedInUser && ( // Show login form if not logged in
        <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
          <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
            <div className="flex flex-col overflow-y-auto md:flex-row">
              <div className="h-32 md:h-auto md:w-1/2">
                <img
                  aria-hidden="true"
                  className="object-cover w-full h-full dark:hidden"
                  src={ImageLight}
                  alt="Office"
                />
                <img
                  aria-hidden="true"
                  className="hidden object-cover w-full h-full dark:block"
                  src={ImageDark}
                  alt="Office"
                />
              </div>
              <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
                <div className="w-full">
                  <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Login</h1>

                  {error && <p className="text-red-500 mb-4">{error}</p>}

                  <form onSubmit={handleLogin}>
                    <Label>
                      <span>Username</span>
                      <Input
                        className="mt-1"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </Label>

                    <Label className="mt-4">
                      <span>Password</span>
                      <div className="relative">
                        <Input
                          className="mt-1 pr-10"
                          type={showPassword ? 'text' : 'password'} // Control input type
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                          onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                        >
                          {showPassword ? (
                            <i className="fas fa-eye-slash"></i> // Eye icon for hidden password
                          ) : (
                            <i className="fas fa-eye"></i> // Eye icon for visible password
                          )}
                        </button>
                      </div>
                    </Label>

                    <Button type="submit" className="mt-4" block disabled={loading}>
                      {loading ? "Logging in..." : "Log in"} {/* Show "Logging in..." while loading */}
                    </Button>
                  </form>

                  <hr className="my-8" />

                  <p className="mt-4">
                    <Link
                      className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                      to="/forgot-password"
                    >
                      Forgot your password?
                    </Link>
                  </p>
                </div>
              </main>
            </div>
          </div>
        </div>
      )}

      {/* Show username if logged in */}
      {loggedInUser && !loading && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Welcome, {loggedInUser}!
          </h1>
          <Button className="mt-4" onClick={() => history.push('/app')}>
            Go to Dashboard
          </Button>
        </div>
      )}
    </>
  );
}

export default Login;