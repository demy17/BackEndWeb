import useUser from "../services/hooks/useUser";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgetPassword from "../pages/ForgetPassword";

import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import ConfirmEmail from "../components/Auth/ConfirmEmail";
import { AdminPatientsPage } from "../components/Admin/AdminPatientsPage";
import AdminAppointments from "../components/Admin/AdminAppointments";
import AdminDashBoard from "../pages/Admin/DashBoard";
import UserDashBoard from "../pages/User/DashBoard";
import DoctorDashBoard from "../pages/Doctor/DashBoard";
import { AdminDoctorsPage } from "../components/Admin/AdminDoctorsPage";
import { AdminPrescriptionsPage } from "../components/Prescription/AdminPrescriptionsPage";
import { PatientAppointmentsPage } from "../components/Patients/PatientAppointmentsPage";
import { PatientPrescriptionsPage } from "../components/Patients/PatientPrescriptionsPage";
import { PatientPrescriptionDetails } from "../components/Patients/PatientPrescriptionDetails";
import { UserProfile } from "../pages/UserProfile";
import { DoctorAppointmentsPage } from "../components/Doctors/DoctorAppointmentsPage";
import { DoctorPrescriptionsPage } from "../components/Doctors/DoctorPrescriptionsPage";
import DoctorAddPrescription from "../components/Doctors/DoctorAddPrescription";
import ResetPassword from "../components/Auth/ResetPassword";
import RegSuccess from "../components/Auth/Reg-success";

const UserRoutes = () => {
  const [loading, setLoading] = useState(true);
  const { currentUser, isAuthenticated, fetchAuthUser } = useUser();

  const fetchUser = async () => {
    try {
      setLoading(true);
      await fetchAuthUser();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async() => {
      if (isAuthenticated) await fetchUser();
      else setLoading(false);
    }

    loadUser();
  }, [isAuthenticated]);

  if (loading) return <h1>Loading...</h1>;
  if (!isAuthenticated) return <Login />;
  if (currentUser) {
    if (currentUser.isEmaiConfirmed) return <ConfirmEmail />;
    return <Outlet />;
  }
  return <Login />;
};
const DoctorRoutes = () => {
  const [loading, setLoading] = useState(true);
  const { currentUser, isAuthenticated, fetchAuthUser } = useUser();

  const fetchUser = async () => {
    try {
      setLoading(true);
      await fetchAuthUser();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated) await fetchUser();
      else setLoading(false);
    };

    loadUser();
  }, [isAuthenticated]);

  if (loading) return <h1>Loading...</h1>;
  if (!isAuthenticated) return <Login />;
  if (currentUser) {
    if (currentUser.isEmaiConfirmed) return <ConfirmEmail />;
    if (!currentUser?.roles?.includes("Doctor")) return <Login />;
    return <Outlet />;
  }
  return <Login />;
};

const AdminRoutes = () => {
  const [loading, setLoading] = useState(true);
  const { currentUser, isAuthenticated, fetchAuthUser } = useUser();

  const fetchUser = async () => {
    try {
      setLoading(true);
      await fetchAuthUser();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated) await fetchUser();
      else setLoading(false);
    };

    loadUser();
  }, [isAuthenticated]);

  if (loading) return <h1>Loading...</h1>;
  if (!isAuthenticated) return <Login />;
  if (currentUser) {
    if (currentUser.isEmaiConfirmed) return <ConfirmEmail />;
    if (!currentUser?.roles?.includes("Admin")) return <Login />;
    return <Outlet />;
  }
  return <Login />;
};

const PublicRoutes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { currentUser, isAuthenticated, fetchAuthUser } = useUser();

  const fetchUser = async () => {
    try {
      setLoading(true);
      await fetchAuthUser();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated) await fetchUser();
      else setLoading(false);
      if (currentUser?.roles) {
        const roles = currentUser?.roles && currentUser?.roles;
        roles.includes("Doctor")
          ? navigate("/doctor/dashboard")
          : roles.includes("Patient")
          ? navigate("/dashboard")
          : navigate("/admin/dashboard");
      }
    };
    
    loadUser();
  }, [isAuthenticated, currentUser]);

  // if(!isAuthenticated) return <Login/>;
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    element: <UserRoutes />,
    children: [
      { path: "/dashboard", element: <UserDashBoard /> },
      { path: "/appointments", element: <PatientAppointmentsPage /> },
      { path: "/prescriptions", element: <PatientPrescriptionsPage /> },
      { path: "/prescriptions/:id", element: <PatientPrescriptionDetails /> },
      { path: "/profile/:id", element: <UserProfile /> },
    ],
  },
  {
    element: <DoctorRoutes />,
    children: [
      { path: "doctor/dashboard", element: <DoctorDashBoard /> },
      { path: "doctor/appointments", element: <DoctorAppointmentsPage /> },
      { path: "doctor/prescriptions", element: <DoctorPrescriptionsPage /> },
      { path: "doctor/prescriptions/add", element: <DoctorAddPrescription /> },
      // { path: "doctor/profile", element: <Appointments /> },
      // { path: "patient/profile/:refId", element: <Appointments /> },
    ],
  },
  {
    element: <AdminRoutes />,
    children: [
      { path: "admin/dashboard", element: <AdminDashBoard /> },
      { path: "admin/appointments", element: <AdminAppointments /> },
      { path: "admin/doctors", element: <AdminDoctorsPage /> },
      { path: "admin/users", element: <AdminPatientsPage /> },
      { path: "admin/prescriptions", element: <AdminPrescriptionsPage /> },
      { path: "admin/prescriptions/:id", element: <PatientPrescriptionDetails /> },
      { path: "admin/users/:id", element: <UserProfile /> },
    ],
  },
  {
    element: <PublicRoutes />,
    children: [
      { path: "/", element: <Navigate to="/login" /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgetPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/confirm-email", element: <ConfirmEmail /> },
      { path: "/reg/success", element: <RegSuccess /> },
    ],
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;