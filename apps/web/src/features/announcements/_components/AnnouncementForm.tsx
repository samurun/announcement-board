import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Controller, useForm } from "react-hook-form"
import {
  createAnnouncementSchema,
  type CreateAnnouncementInput,
} from "../schemas"

interface AnnouncementFormProps {
  defaultValues?: Partial<CreateAnnouncementInput>
  onSubmit: (data: CreateAnnouncementInput) => void
  isLoading?: boolean
  submitLabel?: string
  formId?: string
}

export function AnnouncementForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "Create",
  formId = "announcement-form",
}: AnnouncementFormProps) {
  const { control, handleSubmit } = useForm<CreateAnnouncementInput>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      title: "",
      body: "",
      pinned: false,
      ...defaultValues,
    },
  })

  return (
    <form id={formId} className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Please input title"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="body"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Body</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Please input body"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="pinned"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                <Field orientation="horizontal">
                  <Checkbox
                    id={field.name}
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  <FieldContent>
                    <FieldTitle>Pin</FieldTitle>
                    <FieldDescription>
                      You can pin this announcement to keep it at the top.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </Field>
          )}
        />
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : submitLabel}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
