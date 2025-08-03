import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { postDataAPI } from "../../utils/api"

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [message, setMessage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    // Get token and email from URL parameters
    const tokenParam = searchParams.get("token")
    const emailParam = searchParams.get("email")
    
    if (!tokenParam || !emailParam) {
      setStatus("error")
      setMessage("Invalid reset link. Please request a new password reset.")
      return
    }
    
    // Decode the token in case it's URL encoded
    setToken(decodeURIComponent(tokenParam))
    setEmail(decodeURIComponent(emailParam))
  }, [searchParams])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validatePasswords = () => {
    // Enhanced password validation to match ASP.NET Identity requirements
    if (formData.password.length < 6) {
      setStatus("error")
      setMessage("Password must be at least 6 characters long.")
      return false
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(formData.password)) {
      setStatus("error")
      setMessage("Password must contain at least one uppercase letter.")
      return false
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(formData.password)) {
      setStatus("error")
      setMessage("Password must contain at least one lowercase letter.")
      return false
    }

    // Check for at least one digit
    if (!/\d/.test(formData.password)) {
      setStatus("error")
      setMessage("Password must contain at least one number.")
      return false
    }

    // Check for at least one special character
    if (!/[^a-zA-Z0-9]/.test(formData.password)) {
      setStatus("error")
      setMessage("Password must contain at least one special character.")
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setStatus("error")
      setMessage("Passwords do not match.")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setStatus(null)
    
    if (!validatePasswords()) {
      setIsLoading(false)
      return
    }

    // Match the ResetPasswordModel structure from your API
    const data = {
      Email: email,
      Token: token,
      Password: formData.password
    }
    
    try {
      console.log('Sending reset password request:', { email, token: token.substring(0, 20) + '...', passwordLength: formData.password.length })
      
      const response = await postDataAPI('/Account/reset-password', data);

      console.log('Response:', response)
      
      if (response) {
        const result = response
        setStatus("success")
        setMessage(result.message || "Your password has been reset successfully. You can now login with your new password.")
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } else {
        const error = await response.json()
        setStatus("error")
        
        // Handle validation errors from ModelState
        if (error.errors) {
          const errorMessages = Object.values(error.errors).flat()
          setMessage(errorMessages.join(' '))
        } else {
          setMessage(error.message || "Failed to reset password. Please try again or request a new reset link.")
        }
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setStatus("error")
      
      // Handle the specific error structure you're seeing
      if (error && typeof error === 'object') {
        // Check if it's the validation error structure with empty string key
        if (error[""] && Array.isArray(error[""])) {
          setMessage(error[""].join(' '))
        }
        // Check if it has errors property (ModelState errors)
        else if (error.errors) {
          const errorMessages = Object.values(error.errors).flat()
          setMessage(errorMessages.join(' '))
        }
        // Check if it has a message property
        else if (error.message) {
          setMessage(error.message)
        }
        // Check if it's a string
        else if (typeof error === 'string') {
          setMessage(error)
        }
        // Fallback for other object structures
        else {
          // Try to extract all array values from the error object
          const allErrors = []
          Object.keys(error).forEach(key => {
            if (Array.isArray(error[key])) {
              allErrors.push(...error[key])
            }
          })
          
          if (allErrors.length > 0) {
            setMessage(allErrors.join(' '))
          } else {
            setMessage("Failed to reset password. Please try again or request a new reset link.")
          }
        }
      } else {
        setMessage("An unexpected error occurred. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }

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
          <CardTitle className="text-2xl text-center mt-4">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below to complete the reset process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
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
          )}
          
          {!status || status === "error" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Password must be at least 6 characters with uppercase, lowercase, number, and special character.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !token || !email}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Remember your password?{" "}
            <Link to='/login' className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ResetPassword