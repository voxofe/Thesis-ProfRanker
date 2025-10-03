import axios from "axios";
import { createContext, useState, useContext, useEffect, useRef } from "react";
import { legacyUser } from "../dummyApplicantData";

const AuthContext = createContext({
  currentUser: {
    id: 1,
    firstName: "Admin",
    lastName: "User",
    role: "applicant",
    email: "admin@patras.gr",
    name: "Admin User",
  },
  login: () => {},
  register: () => {},
  registerAdmin: () => {},
  logout: () => {},
  isLoggedIn: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Start as guest (null)
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [hasInitialized, setHasInitialized] = useState(false); // Prevent double initialization

  useEffect(() => {
    if (!hasInitialized) {
      getUser();
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  
  const getUser = () => {
    const token = localStorage.getItem("token");

    if (token === "legacy-token") {
      setCurrentUser(legacyUser);
      setIsLoading(false);
      return;
    }

    if (!token) {
      setIsLoading(false);
      return;
    }

    return axios({
      method: "GET",
      url: "http://127.0.0.1:8000/api/users/getByToken",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setCurrentUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        // Clear invalid token
        localStorage.removeItem("token");
        setCurrentUser(null);
      })
      .finally(() => setIsLoading(false));
  };

  /**
   * @param {string} email
   * @param {string} password
   */

  const refreshUser = () => getUser();
  
  const login = async (email, password) => {
    setIsLoading(true);

    if (email === "a" && password === "a") {
      const token = "legacy-token";
      localStorage.setItem("token", token);
      return getUser();
    }

    return axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/user/login",
      data: { email, password },
    })
      .then((response) => {
        const token = response.data.token;
        localStorage.setItem("token", token);
        getUser();
      })
      .catch((error) => {
        setIsLoading(false);
        return Promise.reject(error);
      });
  };

  /**
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} email
   * @param {string} password
   */
  const register = async (firstName, lastName, email, password) => {
    return axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/user/register",
      data: { firstName, lastName, email, password },
    })
      .then((response) => {
        // Return success response - navigation will be handled by the calling component
        return response;
      })
      .catch((error) => Promise.reject(error));
  };

  /**
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} email
   * @param {string} password
   */
  const registerAdmin = async (firstName, lastName, email, password) => {
    const token = localStorage.getItem("token");
    return axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/user/register-admin",
      data: { firstName, lastName, email, password },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        // Return success response - navigation will be handled by the calling component
        return response;
      })
      .catch((error) => Promise.reject(error));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        registerAdmin,
        logout,
        refreshUser,
        isLoggedIn: !!currentUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
