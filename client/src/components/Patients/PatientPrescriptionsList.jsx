import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  getPrescriptions,
  deletePrescription,
  getPrescriptionsByDoctor,
  getPrescriptionsByPatient,
} from "../../functions/allFunctions";
import { format } from "date-fns";
import useUser from "../../services/hooks/useUser";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Pill, 
  Calendar, 
  User, 
  Clock,
  FileText,
  Stethoscope,
  Eye,
  Download,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

export const PatientPrescriptionsList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterId, setFilterId] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [activePresc, setActive] = useState([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        let data = await getPrescriptionsByPatient(currentUser?.refId);
        console.log(data);
        setPrescriptions(data?.items || []);
        setFilteredPrescriptions(data?.items || []);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        toast.error("Failed to load prescriptions");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.refId) {
      fetchPrescriptions();
    }
  }, [currentUser]);

  // Filter prescriptions
  useEffect(() => {
    let filtered = prescriptions;

    if (searchTerm) {
      filtered = filtered.filter(prescription => 
        prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.instructions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `Dr. ${prescription.doctor?.firstName} ${prescription.doctor?.lastName}`
          .toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrescriptions(filtered);
  }, [prescriptions, searchTerm]);

  const handleDelete = async (prescriptionId) => {
    try {
      await deletePrescription(prescriptionId);
      setPrescriptions(prescriptions.filter((p) => p.id !== prescriptionId));
      toast.success("Prescription deleted successfully");
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast.error("Failed to delete prescription");
    }
  };

  const handleViewPrescription = (prescriptionId) => {
    navigate(`/prescriptions/${prescriptionId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600 text-lg">Loading your prescriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <Pill className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Prescriptions</h2>
            <p className="text-gray-600">View and manage your medical prescriptions</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Medications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activePresc.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Pill className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prescriptions.filter(p => {
                    const prescribedDate = new Date(p.prescribedDate);
                    const now = new Date();
                    return prescribedDate.getMonth() === now.getMonth() && 
                           prescribedDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search medications, instructions, or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredPrescriptions.length} of {prescriptions.length} prescriptions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Medication
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">Dosage</TableHead>
              <TableHead className="font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Prescribed By
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((prescription) => {
                const prescribedDate = new Date(prescription.prescribedDate);
                const endDate = new Date(prescribedDate.getTime() + (prescription.duration * 24 * 60 * 60 * 1000));
                const isActive = endDate > new Date();
                isActive && setActive(activePresc.push(prescription));
                
                return (
                  <TableRow 
                    key={prescription.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewPrescription(prescription.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Pill className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{prescription.medication}</p>
                          {prescription.instructions && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {prescription.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {prescription.dosage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                          </p>
                          {prescription.doctor?.specialization && (
                            <p className="text-xs text-gray-500">
                              {prescription.doctor.specialization}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {format(prescribedDate, "MMM dd, yyyy")}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(prescribedDate, "h:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{prescription.duration} days</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={isActive ? "default" : "secondary"}
                        className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {isActive ? "Active" : "Completed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPrescription(prescription.id);
                          }}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add download functionality here
                            toast.info("Download feature coming soon");
                          }}
                          className="text-gray-600 hover:bg-gray-50"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Pill className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-900">No prescriptions found</p>
                      <p className="text-gray-500 mt-1">
                        {searchTerm 
                          ? "Try adjusting your search criteria"
                          : "You don't have any prescriptions yet"
                        }
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
