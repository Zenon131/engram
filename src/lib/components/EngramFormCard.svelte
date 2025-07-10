<script lang="ts">
  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '$lib/components/index.js';
  import { cn } from '$lib/utils.js';

  let cluster = $state('general');
  
  const clusters = [
    { id: 'general', name: 'General' },
    { id: 'upenn', name: 'UPenn' },
  ];
  
  // Props for the component
  let { 
    onSubmit, 
    class: className 
  }: {
    onSubmit: (title: string, content: string, cluster?: string) => void;
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
        onSubmit(title, content, cluster);
        
        // Clear the form after successful submission
        title = '';
        content = '';
        cluster = 'general';
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  }
</script>

<Card class={cn('w-full', className)}>
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <CardHeader>
      <CardTitle>
        <input
          type="text"
          placeholder="Enter post title..."
          bind:value={title}
          class="w-full bg-transparent border-none text-xl font-semibold focus:outline-none focus:ring-0"
        />
      </CardTitle>
    </CardHeader>
    
    <CardContent>
      <textarea
        placeholder="Enter post content..."
        bind:value={content}
        class="w-full min-h-24 bg-transparent border-none resize-none focus:outline-none focus:ring-0"
      ></textarea>
    </CardContent>
    
    <CardFooter class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <label for="cluster" class="text-sm text-muted-foreground">Category:</label>
        <div class="relative inline-block">
          <div class="flex items-center">
            <span class="mr-1">{clusters.find(c => c.id === cluster)?.name || 'General'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
          <select 
            id="cluster" 
            bind:value={cluster}
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Select category"
          >
            {#each clusters as clusterOption}
              <option value={clusterOption.id}>{clusterOption.name}</option>
            {/each}
          </select>
        </div>
      </div>
      
      <button
        type="submit"
        class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Add Post
      </button>
    </CardFooter>
  </form>
</Card>