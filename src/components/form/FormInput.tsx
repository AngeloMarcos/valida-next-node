import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  helperText?: string;
  containerClassName?: string;
  valueAsNumber?: boolean;
  valueAsDate?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ name, label, helperText, containerClassName, className, valueAsNumber, valueAsDate, ...props }, ref) => {
    const {
      register,
      formState: { errors },
    } = useFormContext();

    const registerOptions: any = {};
    if (valueAsNumber) registerOptions.valueAsNumber = true;
    if (valueAsDate) registerOptions.valueAsDate = true;
    
    const { ref: rhfRef, ...rest } = register(name, registerOptions);
    const error = errors[name];
    const errorMessage = error?.message as string | undefined;

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && <Label htmlFor={name}>{label}</Label>}
        <Input
          id={name}
          {...rest}
          {...props}
          ref={(el) => {
            rhfRef(el);
            if (typeof ref === 'function') {
              ref(el);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }
          }}
          className={cn(error && "border-destructive", className)}
        />
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {errorMessage && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
