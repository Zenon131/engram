<script lang="ts">
	import '../app.css';

	// Props for this layout component
	let { children, data } = $props();
	
	// Default title that can be overridden by individual pages
	let title = 'Bulletin';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content="Share your thoughts with the community!" />
</svelte:head>

{@render children()}
