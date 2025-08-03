import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  createPrescription,
  updatePrescription,
} from "../../functions/allFunctions";

export const AdminPrescriptionForm = ({ prescription, onSuccess }) => {
  const [formData, setFormData] = useState({
    appointmentId: prescription?.appointmentId || "",
    doctorId: prescription?.doctorId || "",
    patientId: prescription?.patientId || "",
    medication: prescription?.medication || "",
    dosage: prescription?.dosage || "",
    instructions: prescription?.instructions || "",
    durationDays: prescription?.duration?.days || 30,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        duration: { days: parseInt(formData.durationDays) },
      };

      if (prescription) {
        await updatePrescription(prescription.id, data);
      } else {
        await createPrescription(data);
      }
      onSuccess();
    } catch (error) {
      alert(`${error}! Please try again later.`);
      console.error("Error saving prescription:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="patientId">Patient ID</Label>
        <Input
          id="patientId"
          type="number"
          value={formData.patientId}
          onChange={(e) =>
            setFormData({ ...formData, patientId: e.target.value })
          }
          required
        />
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
