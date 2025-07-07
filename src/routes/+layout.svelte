<script lang="ts">
	import '../app.css';

	// Props for this layout component
	let { children, data } = $props();
	
	// Default title that can be overridden by individual pages
	let title = 'Engram | Memory Management System';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="A simple local memory management system built with SvelteKit" />
</svelte:head>

{@render children()}
