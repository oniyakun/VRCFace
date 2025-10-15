import { ButtonHTMLAttributes, forwardRef } from 'react'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'default'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  asChild?: boolean
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 border-2 border-transparent',
      secondary: 'bg-secondary-200 hover:bg-secondary-300 text-secondary-800 focus:ring-secondary-500 border-2 border-transparent',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500 bg-transparent',
      ghost: 'text-secondary-600 hover:bg-secondary-100 focus:ring-secondary-500 border-2 border-transparent',
      destructive: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 border-2 border-transparent',
      default: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500 border-2 border-transparent'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      icon: 'h-10 w-10 p-0'
    }

    // If asChild is true, we should render the children directly with the styles
    // This is a simplified implementation - in a full implementation you'd use Slot from @radix-ui/react-slot
    if (asChild) {
      // For now, we'll just apply the classes to the first child if it's a valid React element
      if (typeof children === 'object' && children !== null && 'props' in children) {
        const childElement = children as React.ReactElement
        return React.cloneElement(childElement, {
          className: cn(baseStyles, variants[variant], sizes[size], className, childElement.props.className),
          ref,
          ...props
        })
      }
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export default Button