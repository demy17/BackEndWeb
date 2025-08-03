import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { createPatient, updatePatient } from '../../functions/allFunctions';

export const PatientForm = ({ patient, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    email: patient?.email || '',
    phoneNumber: patient?.phoneNumber || '',
    gender: patient?.gender || 'male',
    dateOfBirth: patient?.dateOfBirth ? new Date(patient.dateOfBirth) : new Date(),
    address: patient?.address || '',
    insuranceProvider: patient?.insuranceProvider || '',
    insurancePolicyNumber: patient?.insurancePolicyNumber || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (patient) {
        await updatePatient(patient.id, formData);
      } else {
        await createPatient(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving patient:', error);
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
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Gender</Label>
        <RadioGroup 
          value={formData.gender} 
          onValueChange={(value) => setFormData({...formData, gender: value})}
          className="flex space-x-8"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.dateOfBirth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.dateOfBirth}
              onSelect={(date) => setFormData({...formData, dateOfBirth: date})}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="insuranceProvider">Insurance Provider</Label>
        <Select
          value={formData.insuranceProvider}
          onValueChange={(value) => setFormData({...formData, insuranceProvider: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select insurance provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aetna">Aetna</SelectItem>
            <SelectItem value="bluecross">Blue Cross Blue Shield</SelectItem>
            <SelectItem value="cigna">Cigna</SelectItem>
            <SelectItem value="humana">Humana</SelectItem>
            <SelectItem value="kaiser">Kaiser Permanente</SelectItem>
            <SelectItem value="medicare">Medicare</SelectItem>
            <SelectItem value="medicaid">Medicaid</SelectItem>
            <SelectItem value="unitedhealth">UnitedHealthcare</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
        <Input
          id="insurancePolicyNumber"
          value={formData.insurancePolicyNumber}
          onChange={(e) => setFormData({...formData, insurancePolicyNumber: e.target.value})}
        />
      </div>

      {!patient && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Save Patient'}
      </Button>
    </form>
  );
};