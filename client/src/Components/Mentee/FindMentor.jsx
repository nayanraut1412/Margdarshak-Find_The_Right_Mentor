import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import Navbar from './MenteeNavbar';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MenteeBooking = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const handleChange = (slot) => {
    if (slot) {
      localStorage.setItem('mentorId', slot.mentorId._id);
      console.log(slot.mentorId._id);

      navigate('/mentorprofilebymentee');
    } else {
      console.error('Slot or mentorId is undefined');
    }
  };

  const fetchAvailableSlots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      const response = await axios.get('/api/availability/mentor', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        // Add some console logging for debugging
        console.log('Fetched slots:', response.data);
        setAvailableSlots(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error details:', error.response || error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load available slots';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const bookSlot = async (slotId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to book a slot');
        return;
      }

      const response = await axios.post(
        '/api/availability/book',
        { slotId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success('Slot booked successfully!');
        // Refresh the available slots after booking
        await fetchAvailableSlots();
      }
    } catch (error) {
      console.error('Booking error:', error.response || error);
      const errorMessage = error.response?.data?.error || 'Failed to book slot';
      toast.error(errorMessage);
    }
  };

  const formatTime = (time) => {
    try {
      if (!time) return 'Not specified';
      // Use the time string directly as it's already in HH:mm format
      return time;
    } catch (error) {
      console.error('Time formatting error:', error);
      return 'Invalid time';
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        transition={Slide}
        className="mt-14"
      />

      <div className="container mx-auto px-4 mt-5">
        <h1 className="text-2xl font-semibold text-center mb-6 text-[#3B50D5]">
          Available Slots for Mentoring
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSlots.length > 0 ? (
            availableSlots.map((slot) => (
              <div

                key={slot._id}
                className="bg-white shadow-lg rounded-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300"
              >
                {/* <p>Slot ID: {slot.mentorId._id}</p> */}
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {slot.mentorId?.firstName || 'Not specified'}
                      {slot.mentorId?.lastName ? ` ${slot.mentorId.lastName}` : ''}
                    </p>
                    <p className="text-gray-600">
                      Expertise: {slot.mentorId?.industrywork || 'Not specified'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleChange(slot)}
                    className=" bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition duration-300 transform hover:-translate-y-1"
                  >
                    View Profile
                  </button>
                </div>


                <div className="mb-4 space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Date:</span> {slot.formattedDate || new Date(slot.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Time:</span> {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </p>
                </div>

                {slot.status === 'available' && (
                  <button
                    onClick={() => bookSlot(slot._id)}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 transform hover:-translate-y-1"
                  >
                    Book Slot
                  </button>

                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-xl text-gray-600">No available slots at the moment</p>
              <p className="text-gray-500 mt-2">Please check back later for new openings</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MenteeBooking;