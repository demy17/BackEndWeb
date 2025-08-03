import { Link } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Icon } from "@iconify/react"
import { useFormStatus } from "react-dom"
import useUser from "../../services/hooks/useUser"

export function LoginForm({
  className,
  ...props
}) {
  const {handleLogin, loading, errors } = useUser();
  
  // console.log(errors?.errors);
  const onSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if(!e.target.email.value || !e.target.password.value) {
      console.log('Please fill in all fields');
      return;
    }

    let useDet = {
      email: e.target.email.value,
      password: e.target.password.value
    }
    // console.log(useDet);
    await handleLogin(useDet);
    // console.log({pending, data, method, action });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
                {errors && <div className="text-red-500 text-sm">{errors?.errors?.Email[0]}</div>}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to='/forgot-password'
                    className="ml-auto inline-block text-blue-500 text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
                <div>
                  <Input id="password" type="password" placeholder='Your Password' required />
                  {errors && <div className="text-red-500 text-sm">{errors?.errors?.Password[0]}</div>}
                  {errors && <div className="text-red-500 mt-2 text-center text-sm">{errors?.message}</div>}
                </div>
              </div>
              

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <Button variant="outline" className="w-full cursor-pointer" disabled={loading}>
                  {loading ? "Please wait..." : <span className="flex items-center justify-center">
                    <Icon icon={"mdi:google"} className="inline-block w-6 h-6" />
                    <span className="ml-2">Continue with Google</span>
                    </span>}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
