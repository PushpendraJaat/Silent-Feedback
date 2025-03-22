import React, { useState } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CustomPasswordFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  control: Control<T>;
  placeholder?: string;
}

export function CustomPasswordField<T extends FieldValues>({
  name,
  label = "Password",
  control,
  placeholder = "Enter your password",
}: CustomPasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                className="pr-10 dark:bg-gray-700 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </FormControl>
          <FormMessage className="text-red-500 dark:text-red-400">
            {fieldState.error?.message}
          </FormMessage>
        </FormItem>
      )}
    />
  );
}
