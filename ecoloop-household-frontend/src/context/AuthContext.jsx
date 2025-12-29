import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

  // Initialize axios with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [token])

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`)
          setUser(response.data.data.user)
          setError(null)
        } catch (err) {
          console.error('Failed to fetch user:', err)
          setUser(null)
          setToken(null)
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
        }
      }
      setLoading(false)
    }
    fetchUser()
  }, [token])

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData)
      const { token: newToken, user: userData_ } = response.data.data
      setToken(newToken)
      setUser(userData_)
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setError(null)
      return response.data
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed'
      setError(errMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password })
      const { token: newToken, user: userData_ } = response.data.data
      setToken(newToken)
      setUser(userData_)
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setError(null)
      return response.data
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed'
      setError(errMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setError(null)
  }

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
