import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import axios from "axios";
import { getDataAPI } from "../../utils/api";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // "success" | "error"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    if (!userId || !token) {
      setStatus("error");
      setMessage("Invalid confirmation link.");
      setLoading(false);
      return;
    }

    const confirmEmail = async () => {
      setLoading(true);
      try {
        console.log('Sending data: ', { userId, token });
        const response = await getDataAPI(
          `/Account/confirm-email?userId=${encodeURIComponent(
            userId
          )}&token=${encodeURIComponent(token)}`
        );
        console.log("Response: ", response);

        if (response && response.message) {
          setStatus("success");
          setMessage(response.message || "Email confirmed successfully!");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(response.data?.message || "Failed to confirm email.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "An error occurred while confirming your email. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          {loading ? (
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
          ) : status === "success" ? (
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
          ) : (
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          )}
          <CardTitle className="text-2xl text-center mt-2">
            {loading
              ? "Confirming Email"
              : status === "success"
              ? "Email Confirmed"
              : "Confirmation Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {loading
              ? "Please wait while we confirm your email address..."
              : status === "success"
              ? "Your email has been confirmed. You will be redirected shortly."
              : "We could not confirm your email. Please check your link or try again."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!loading && status === "success" && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
              <AlertDescription className="text-green-600">
                {message}
              </AlertDescription>
            </Alert>
          )}
          {!loading && status === "error" && (
            <Alert className="bg-red-50 border-red-200 mb-4">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Error</AlertTitle>
              <AlertDescription className="text-red-600">
                {message}
              </AlertDescription>
              <Button
                className="w-full mt-4 px-14"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500 text-center">
            Need help? Contact support.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmEmail;
