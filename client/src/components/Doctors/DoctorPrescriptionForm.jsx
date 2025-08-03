import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  createPrescription,
  getAllPatients,
  updatePrescription,
} from "../../functions/allFunctions";
import useUser from "../../services/hooks/useUser";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const DoctorPrescriptionForm = ({ prescription, onSuccess }) => {
  const { currentUser } = useUser();
  // console.log(currentUser);
  const [formData, setFormData] = useState({
    doctorId: prescription?.doctorId || currentUser?.refId,
    patientId: prescription?.patientId || "",
    medication: prescription?.medication || "",
    dosage: prescription?.dosage || "",
    instructions: prescription?.instructions || "",
    durationDays: prescription?.duration?.days || 30,
  });
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData] = await Promise.all([getAllPatients()]);
        setPatients(patientsData);

        if (prescription?.patientId) {
          const patient = patientsData.find(
            (p) => p.id === prescription.patientId
          );
          setSelectedPatient(patient);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load patients");
      }
    };
    fetchData();
  }, [prescription?.patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientId || formData.patientId === "") {
      toast.error("Please select a patient");
      alert("Please select a patient");
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        duration: `${parseInt(formData.durationDays)}.00:00:00`, // e.g. "7.00:00:00" for 7 days
      };

      if (prescription) {
        await updatePrescription(prescription.id, data);
        toast.success("Prescription updated successfully");
      } else {
        await createPrescription(data);
        toast.success("Medication prescribed successfully");
      }
      onSuccess();
    } catch (error) {
      // Show main error message from API if available
      let msg = "Failed to save prescription! Please try again later.";
      if (error?.response?.data?.title) {
        msg = error.response.data.title;
      } else if (error?.response?.data?.errors) {
        msg = Object.values(error.response.data.errors)
          .map((arr) => arr.join(" "))
          .join(" ");
      }
      toast.error(msg);
      alert(msg);
      console.error("Error saving prescription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setFormData((prev) => ({
        ...prev,
        patientId: patient.id,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appointmentId">Appointment ID</Label>
          <Input
            id="appointmentId"
            type="number"
            value={formData.appointmentId}
            onChange={(e) =>
              setFormData({ ...formData, appointmentId: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doctorId">Doctor ID</Label>
          <Input
            id="doctorId"
            type="number"
            value={formData.doctorId}
            onChange={(e) =>
              setFormData({ ...formData, doctorId: e.target.value })
            }
            required
          />
        </div>
      </div> */}

      <div className="space-y-2">
        <Label htmlFor="patientId">Patient ID</Label>
        <Select value={formData.patientId} onValueChange={handlePatientSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select patient">
              {selectedPatient
                ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                : "Select patient"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medication">Medication</Label>
        <Input
          id="medication"
          value={formData.medication}
          onChange={(e) =>
            setFormData({ ...formData, medication: e.target.value })
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage</Label>
          <Input
            id="dosage"
            value={formData.dosage}
            onChange={(e) =>
              setFormData({ ...formData, dosage: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationDays">Duration (days)</Label>
          <Input
            id="durationDays"
            type="number"
            value={formData.durationDays}
            onChange={(e) =>
              setFormData({ ...formData, durationDays: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Input
          id="instructions"
          value={formData.instructions}
          onChange={(e) =>
            setFormData({ ...formData, instructions: e.target.value })
          }
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Save Prescription"}
      </Button>
    </form>
  );
};
