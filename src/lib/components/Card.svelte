<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { cardVariants, type CardProps } from './card-variants.js';

	interface Props extends CardProps {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { variant, size, class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn(cardVariants({ variant, size }), className)} {...restProps}>
	{@render children?.()}
</div>
