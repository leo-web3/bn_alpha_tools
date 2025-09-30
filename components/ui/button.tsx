import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:opacity-90",
        destructive: "hover:opacity-90",
        outline: "border hover:opacity-90",
        secondary: "hover:opacity-80",
        ghost: "hover:opacity-90",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, style, ...props }, ref) => {
    const getVariantStyle = () => {
      switch (variant) {
        case 'destructive':
          return {
            backgroundColor: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive-foreground))'
          };
        case 'outline':
          return {
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))'
          };
        case 'secondary':
          return {
            backgroundColor: 'hsl(var(--secondary))',
            color: 'hsl(var(--secondary-foreground))'
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent'
          };
        case 'link':
          return {
            backgroundColor: 'transparent',
            color: 'hsl(var(--primary))'
          };
        default:
          return {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))'
          };
      }
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        style={{ ...getVariantStyle(), ...style }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
