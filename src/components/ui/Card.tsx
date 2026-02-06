import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered" | "elevated" | "gradient";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "default",
      hover = false,
      padding = "none",
      className = "",
      ...props
    },
    ref,
  ) => {
    const baseStyles = "rounded-2xl transition-all duration-300";

    const variants = {
      default: "bg-white border border-slate-200 shadow-soft",
      glass: "glass shadow-medium",
      bordered: "bg-white border-2 border-slate-200",
      elevated: "bg-white shadow-medium hover:shadow-strong",
      gradient:
        "bg-gradient-to-br from-white via-blue-50/30 to-white border border-slate-200 shadow-soft",
    };

    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    const hoverEffect = hover
      ? "hover:shadow-medium hover:-translate-y-1 cursor-pointer card-glow"
      : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverEffect} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

// CardHeader con estilos mejorados
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`px-6 py-4 border-b border-slate-200 ${className}`}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = "CardHeader";

// CardBody - mantiene compatibilidad
export const CardBody = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className = "", ...props }, ref) => (
  <div ref={ref} className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
));

CardBody.displayName = "CardBody";

// CardContent - alternativa moderna
export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className = "", ...props }, ref) => (
  <div ref={ref} className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
));

CardContent.displayName = "CardContent";

// CardTitle
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ children, className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-xl font-bold text-slate-900 ${className}`}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = "CardTitle";

// CardDescription
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ children, className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-slate-600 mt-1 ${className}`}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = "CardDescription";


export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`px-6 py-4 border-t border-slate-200 bg-slate-50/50 ${className}`}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = "CardFooter";
