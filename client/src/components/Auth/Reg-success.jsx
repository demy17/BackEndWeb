import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";

const RegSuccess = () => {
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleResend = async () => {
    setResending(true);
    setResendMsg("");
    // You may want to get the email from props, context, or prompt the user
    const email = window.prompt("Enter your email to resend confirmation:");
    if (!email) {
      setResending(false);
      return;
    }
    try {
      const response = await axios.post(
        "/api/Account/resend-confirmation",
        email,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setResendMsg(response.data.message || "Confirmation email resent.");
    } catch (error) {
      setResendMsg(
        error?.response?.data?.message || "Failed to resend confirmation email."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <CardTitle className="text-2xl text-center mt-2">
            Registration Successful
          </CardTitle>
          <CardDescription className="text-center">
            An email has been sent to your address. Please check your inbox and
            follow the instructions to confirm your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full mt-4" onClick={() => navigate("/login")}>
            Back to Login
          </Button>
          {resending && (
            <div className="flex justify-center mt-2">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            </div>
          )}
          {resendMsg && (
            <p className="text-sm text-center text-gray-600 mt-2">
              {resendMsg}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500 text-center">
            Didn&apos;t receive the email? Check your spam folder or&nbsp;
            <span
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={handleResend}
            >
              resend confirmation
            </span>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegSuccess;
