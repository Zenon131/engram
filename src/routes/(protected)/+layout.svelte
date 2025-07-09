<script lang="ts">
  import { user, isLoading, initializeAuth } from '$lib/stores/authStore.js';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  let { children } = $props();
  
  onMount(() => {
    initializeAuth();
    
    // Redirect if not logged in
    const unsubscribe = user.subscribe((value: any) => {
      if (!value && !$isLoading) {
        goto('/auth');
      }
    });
    
    return unsubscribe;
  });
</script>

{#if $isLoading}
  <div>Loading...</div>
{:else if $user}
  {@render children()}
{:else}
  <div>Redirecting to login...</div>
{/if}