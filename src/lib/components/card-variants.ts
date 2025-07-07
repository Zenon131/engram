import { cva, type VariantProps } from 'class-variance-authority';

export const cardVariants = cva(
	'rounded-xl border bg-card text-card-foreground shadow',
	{
		variants: {
			variant: {
				default: 'border-border',
				destructive: 'border-destructive/50 text-destructive dark:border-destructive',
				outline: 'border-input',
				secondary: 'border-transparent bg-secondary text-secondary-foreground',
				ghost: 'border-transparent shadow-none',
			},
			size: {
				default: 'p-6',
				sm: 'p-4',
				lg: 'p-8',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

export type CardProps = VariantProps<typeof cardVariants>;
