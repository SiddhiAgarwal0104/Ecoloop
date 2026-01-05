import { useState, useEffect, useRef } from 'react';
import { useContext } from 'react';
import axios from '../api/axios';

/**
 * Import RecyclerAuthContext hook for authentication
 */
import { RecyclerAuthContext } from '../context/RecyclerAuthContext';

/**
 * Custom hook for authentication
 * Alias for useRecyclerAuth for convenience
 */
export const useAuth = () => {
  const context = useContext(RecyclerAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within RecyclerAuthProvider');
  }
  return context;
};

/**
 * Custom hook for fetching request data
 * Handles loading, error states, and pagination
 */
export const useRequestData = (endpoint, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page,
        ...options.params
      });

      const response = await axios.get(`${endpoint}?${params}`);
      const newData = response.data.data?.requests || [];

      if (page === 1) {
        setData(newData);
      } else {
        setData((prevData) => [...prevData, ...newData]);
      }

      setHasMore(newData.length > 0);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, endpoint]);

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const refresh = () => {
    setPage(1);
    fetchData();
  };

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    loadMore,
    refresh
  };
};

/**
 * Custom hook for recycler location tracking
 * Gets and updates recycler's current location
 */
export const useRecyclerLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  /**
   * Get current location once
   */
  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
        console.log(`✅ Location obtained: ${latitude}, ${longitude}`);
      },
      (err) => {
        console.error('❌ Location error:', err);
        setError(err.message || 'Failed to get location');
        setLoading(false);
      }
    );
  };

  /**
   * Start watching location changes
   */
  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setError(null);
      },
      (err) => {
        console.error('❌ Location watch error:', err);
        setError(err.message || 'Failed to watch location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /**
   * Stop watching location
   */
  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, []);

  return {
    latitude: location?.latitude,
    longitude: location?.longitude,
    location,
    loading,
    error,
    getLocation,
    startWatching,
    stopWatching
  };
};

/**
 * Custom hook for form handling
 * Manages form state and validation
 */
export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('❌ Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const setFieldValue = (name, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value
    }));
  };

  const setFieldError = (name, error) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error
    }));
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError
  };
};

/**
 * Custom hook for API calls
 * Handles loading and error states
 */
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      console.error('❌ API call error:', err);
      const errorMessage = err.response?.data?.error || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute
  };
};
