"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, UserCog } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["CUSTOMER", "ADMIN"], {
    required_error: "Please select a role",
  }),
  adminCode: z.string().optional(),
})
.refine((data) => {
  // If role is ADMIN, adminCode is required and must match the expected value
  if (data.role === "ADMIN") {
    return data.adminCode === process.env.NEXT_PUBLIC_ADMIN_CODE || "Pis@faGift25";
  }
  return true;
}, {
  message: "Invalid admin code",
  path: ["adminCode"],
});

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register: registerForm,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CUSTOMER",
      adminCode: "",
    },
  })

  const selectedRole = watch("role")

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Remove adminCode if role is CUSTOMER
      if (data.role === "CUSTOMER") {
        delete data.adminCode;
      }
      
      const result = await register(data.email, data.password, data.name, data.role)

      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. Please log in to continue.",
        })
        // Redirect to login page with the selected role
        router.push(`/auth/login?role=${data.role}`)
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-16rem)] max-w-md flex-col justify-center mt-20 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-lg border bg-card p-8 shadow-sm"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-sm text-muted-foreground">Sign up to get started with Pisafa Gifts Shop</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="name" placeholder="John Doe" className="pl-10" {...registerForm("name")} />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...registerForm("email")} />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10"
                {...registerForm("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <RadioGroup 
              value={selectedRole}
              onValueChange={(value) => setValue("role", value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CUSTOMER" id="customer" />
                <Label htmlFor="customer" className="cursor-pointer">Customer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ADMIN" id="admin" />
                <Label htmlFor="admin" className="cursor-pointer">Administrator</Label>
              </div>
            </RadioGroup>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          {selectedRole === "ADMIN" && (
            <div className="space-y-2">
              <Label htmlFor="adminCode">Admin Code</Label>
              <div className="relative">
                <UserCog className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="adminCode"
                  type="password"
                  placeholder="Enter admin code"
                  className="pl-10"
                  {...registerForm("adminCode")}
                />
              </div>
              {errors.adminCode && <p className="text-xs text-destructive">{errors.adminCode.message}</p>}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
