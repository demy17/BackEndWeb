import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { createDoctor, updateDoctor } from "../../functions/allFunctions";

export const AdminDoctorForm = ({ doctor, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: doctor?.id || null,
    firstName: doctor?.firstName || "",
    lastName: doctor?.lastName || "",
    email: doctor?.email || "",
    phoneNumber: doctor?.phoneNumber || "",
    specialization: doctor?.specialization?.toLowerCase() || "",
    licenseNumber: doctor?.licenseNumber || "",
    gender: doctor?.gender?.toLowerCase() || "",
    dateOfBirth: doctor?.dateOfBirth || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  // console.log(doctor);

  const specializations = [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Urology",
  ];

  const genders = ["Male", "Female", "Other", "Prefer not to say"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (doctor) {
        // return console.log(formData);
        await updateDoctor(doctor.id, formData);
      } else {
        await createDoctor(formData);
      }
      onSuccess();
    } catch (error) {
      alert(`${error}! Please try again later.`);
      console.error("Error saving doctor:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) =>
              setFormData({ ...formData, gender: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((gender) => (
                <SelectItem key={gender} value={gender.toLowerCase()}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialization">Specialization</Label>
        <Select
          value={formData.specialization}
          onValueChange={(value) =>
            setFormData({ ...formData, specialization: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select specialization" />
          </SelectTrigger>
          <SelectContent>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec.toLowerCase()}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="licenseNumber">License Number</Label>
        <Input
          id="licenseNumber"
          value={formData.licenseNumber}
          onChange={(e) =>
            setFormData({ ...formData, licenseNumber: e.target.value })
          }
          required
        />
      </div>

      {!doctor && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Save Doctor"}
      </Button>
    </form>
  );
};
