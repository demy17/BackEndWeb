import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";
import useUser from "../services/hooks/useUser";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

const Register = () => {
  const navigate = useNavigate();
  const {handleRegister, formData, setFormData, errors, loading} = useUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
  };

  const handleInsuranceChange = (value) => {
    setFormData((prev) => ({ ...prev, insuranceProvider: value }));
  };

  const handleGenderChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Register to book appointments and manage your health records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                { errors && errors.FirstName &&  <p className="text-red-500">{errors.FirstName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                { errors && errors.LastName &&  <p className="text-red-500">{errors.LastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              { errors && errors.Email &&  <p className="text-red-500">{errors.Email}</p>}
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup 
                value={formData.gender} 
                onValueChange={handleGenderChange}
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
              { errors && errors.Gender &&  <p className="text-red-500">{errors.Gender}</p>}
            </div>


            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              { errors && errors.PhoneNumber &&  <p className="text-red-500">{errors.PhoneNumber}</p>}
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
                    {formData.dateOfBirth ? (
                      format(formData.dateOfBirth, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              { errors && errors.DateOfBirth &&  <p className="text-red-500">{errors.DateOfBirth}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              { errors && errors.Address &&  <p className="text-red-500">{errors.Address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Select
                value={formData.insuranceProvider}
                onValueChange={handleInsuranceChange}
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
              { errors && errors.InsuranceProvider &&  <p className="text-red-500">{errors.InsuranceProvider}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
              <Input
                id="insurancePolicyNumber"
                name="insurancePolicyNumber"
                value={formData.insurancePolicyNumber}
                onChange={handleChange}
              />
              { errors && errors.InsurancePolicyNumber &&  <p className="text-red-500">{errors.InsurancePolicyNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              { errors && errors.Password &&  <p className="text-red-500">{errors.Password}</p>}
            </div>

            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link to='/login' className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
