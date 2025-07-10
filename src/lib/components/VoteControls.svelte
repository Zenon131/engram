<script lang="ts">
  import { cn } from '$lib/utils.js';
  
  interface Props {
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down' | null;
    onVote: (direction: 'up' | 'down') => void;
    class?: string;
  }
  
  let { upvotes, downvotes, userVote, onVote, class: className }: Props = $props();
  
  // Get the total votes (can be positive or negative)
  let totalScore = $state(upvotes - downvotes);
  
  // Determine score color based on total
  let scoreColor = $state('text-muted-foreground');
  
  // Update derived values when props change
  $effect(() => {
    totalScore = upvotes - downvotes;
    scoreColor = totalScore > 0 ? 'text-green-500' : 
                 totalScore < 0 ? 'text-red-500' : 
                 'text-muted-foreground';
  });
</script>

<div class={cn('flex items-center space-x-2', className)}>
  <!-- Upvote button -->
  <button 
    class={cn(
      'p-1 rounded-md hover:bg-accent transition-colors', 
      userVote === 'up' ? 'text-green-500' : 'text-muted-foreground'
    )}
    onclick={() => onVote('up')}
    aria-label="Upvote"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  </button>
  
  <!-- Vote count -->
  <span class={cn('text-sm font-medium', scoreColor)}>
    {totalScore}
  </span>
  
  <!-- Downvote button -->
  <button 
    class={cn(
      'p-1 rounded-md hover:bg-accent transition-colors', 
      userVote === 'down' ? 'text-red-500' : 'text-muted-foreground'
    )}
    onclick={() => onVote('down')}
    aria-label="Downvote"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down"><path d="m12 5 7 7-7 7"/><path d="M5 12h14"/></svg>
  </button>
</div>
