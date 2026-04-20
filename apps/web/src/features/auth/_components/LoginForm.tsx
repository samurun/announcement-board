import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext.js"
import { loginSchema, type LoginInput as LoginT } from "../schemas.js"

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginT>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginT) => {
    setSubmitError(null)
    try {
      await login(data.email, data.password)
      navigate("/announcements", { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FieldGroup>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Please input email"
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    {...field}
                    type="password"
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Please input password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {submitError && (
              <div
                role="alert"
                className="rounded bg-red-50 p-3 text-sm text-red-600"
              >
                {submitError}
              </div>
            )}
            <Field>
              <Button type="submit" form="login-form" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="underline">
                  Sign up
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
