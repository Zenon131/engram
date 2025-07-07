<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '$lib/components/index.js';
  import { cn } from '$lib/utils.js';
  
  // Props for the component
  let { 
    onSubmit, 
    class: className 
  }: {
    onSubmit: (title: string, content: string) => void;
    class?: string;
  } = $props();
  
  // Local state for form fields using $state for Svelte 5 reactivity
  let title = $state('');
  let content = $state('');
  
  // Handle form submission
  function handleSubmit() {
    if (title.trim() && content.trim()) {
      try {
        // Call the parent's onSubmit handler
        onSubmit(title, content);
        
        // Clear the form after successful submission
        title = '';
        content = '';
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  }
</script>

<Card class={cn('w-full', className)}>
  <form on:submit|preventDefault={handleSubmit}>
    <CardHeader>
      <CardTitle>
        <input
          type="text"
          placeholder="Enter card title..."
          bind:value={title}
          class="w-full bg-transparent border-none text-xl font-semibold focus:outline-none focus:ring-0"
        />
      </CardTitle>
    </CardHeader>
    
    <CardContent>
      <textarea
        placeholder="Enter card content..."
        bind:value={content}
        class="w-full min-h-24 bg-transparent border-none resize-none focus:outline-none focus:ring-0"
      ></textarea>
    </CardContent>
    
    <CardFooter class="flex justify-between">
      <button
        type="submit"
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Add Card
      </button>
    </CardFooter>
  </form>
</Card>