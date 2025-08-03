import { useEffect, useState } from "react";
import {
  setCurrentUser,
  updateUser,
  signOut,
  setIsAuthenticated,
} from "../redux/slice/authSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  fetchUser,
  signin,
  signup,
  logout,
} from "../../functions/userFunctions";
import { useNavigate } from "react-router-dom";

const useUser = () => {
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: undefined,
    address: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    password: "",
  });

  // useEffect(() => {
  //   console.log(currentUser);
  // },[currentUser]);

  const fetchAuthUser = async () => {
    try {
      setLoading(true);
      const res = await fetchUser();
      console.log("Res: ", res);
      dispatch(setCurrentUser(res));
      // await setTimeout(() => {
      //   // 
      // },2000)
      return res;
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userDet) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrors([]);

    try {
      let model = {
        Email: userDet.email,
        Password: userDet.password,
      };
      // console.log('Got submit', {model});
      // console.log('Current User 1: ', currentUser);
      setLoading(true);
      const res = await signin(model);
      // console.log(res);
      // If we have a token, consider it a success
      if (res?.token && res?.user) {
        dispatch(setCurrentUser(res.user));
        dispatch(setIsAuthenticated(true));
        // console.log('Login successful');
        // console.log('Current User 2: ', currentUser);
        alert("Login successful");
        // return console.log(res?.user?.roles);
        res?.user && res?.user?.roles.includes("Doctor")
          ? navigate("/doctor/dashboard")
          : res?.user?.roles.includes("Patient")
          ? navigate("/dashboard")
          : navigate("/admin/dashboard");
        return;
      }

      // If we get here, there was no token
      setErrors(res || { message: "An error occurred while logging in." });
    } catch (error) {
      console.log(error);
      setErrors(
        error || {
          message:
            "An error occurred while logging in. Please try again later.",
        }
      );
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const data = {
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email,
        Gender: formData.gender,
        PhoneNumber: formData.phoneNumber,
        DateOfBirth: formData.dateOfBirth,
        Address: formData.address,
        InsuranceProvider: formData.insuranceProvider,
        InsurancePolicyNumber: formData.insurancePolicyNumber,
        Password: formData.password,
      };
      // console.log(data);
      const res = await signup(data);
      // console.log("Registration successful:", res);
      if (res.message) {
        // alert(res.message);
        await localStorage.setItem('RegEmail', formData.email);
        return navigate("/reg/success");
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Handle the specific error format
      if (error && error[""] && Array.isArray(error[""])) {
        // Extract the error messages from the array
        const errorMessages = error[""];
        setErrors({ message: errorMessages.join(", ") });
        // You could also alert the first error message
        alert(errorMessages[0]);
      } else {
        // Handle other error formats
        setErrors(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMailLink = async () => {
    try {
      setLoading(true);
      // const res = await sendMailLink();
      // console.log(res);
      setTimeout(() => {
        alert("Email sent! Please check your email for the link.");
      }, 2000);
      // alert('Email sent! Please check your email for the link.');
    } catch (error) {
      console.log(error);
      alert(error?.message || "An error occurred. Try again!!");
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      const res = await logout();
      dispatch(signOut());
      navigate("/login");
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currentUser,
    formData,
    errors,
    isAuthenticated,
    setFormData,
    fetchAuthUser,
    handleLogin,
    handleRegister,
    sendMailLink,
    logoutUser,
  };
};

export default useUser;
