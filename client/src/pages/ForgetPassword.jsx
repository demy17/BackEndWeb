import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { postDataAPI } from "../utils/api";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      console.log("Sending forgot password request for:", email);
      
      const response = await postDataAPI("Account/forgot-password", {
        Email: email,
      });
      
      console.log("Response:", response);

      // Check if the response is successful
      if (response && response.message) {
        let result;
        try {
          result = response;
        } catch (jsonError) {
          // If response doesn't have JSON body but was successful
          console.log("No JSON response body, but request was successful");
          result = { message: "Password reset link has been sent to your email address." };
        }
        
        setStatus("success");
        setMessage(result.message || "Password reset link has been sent to your email address.");
      } else {
        // Handle error responses
        let error;
        try {
          error = await response.json();
        } catch (jsonError) {
          error = { message: "Failed to send password reset link. Please try again." };
        }
        
        setStatus("error");
        setMessage(
          error.message ||
            "Failed to send password reset link. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            className="absolute left-4 top-4 p-0 w-8 h-8"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl text-center mt-4">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            status === "success" ? (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success</AlertTitle>
                <AlertDescription className="text-green-600">
                  {message}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600">Error</AlertTitle>
                <AlertDescription className="text-red-600">
                  {message}
                </AlertDescription>
              </Alert>
            )
          ) : null}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Remember your password?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgetPassword;
