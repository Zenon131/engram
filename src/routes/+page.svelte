<script lang="ts">
    import { cn } from '$lib/utils.js';
    import { 
        Card, 
        CardHeader, 
        CardFooter, 
        CardTitle, 
        CardDescription, 
        CardContent,
        Navbar 
    } from '$lib/components/index.js';
    import { localStorageService } from '$lib/services/storage.js';
    import EngramFormCard from '$lib/components/EngramFormCard.svelte';
	import { onMount } from 'svelte';
    import type { Engram } from '$lib/types/index.js';


    const navItems = [
        // { href: '/', label: 'Home', active: true },
        // { href: '/about', label: 'About', active: false }
    ];

    // Import browser check from SvelteKit
    import { browser } from '$app/environment';
    
    // Sample engram data
    let engrams = $state<Engram[]>([]);

    onMount(() => {
        console.log('Component mounted, browser environment:', browser);
        if (browser) {
            console.log('Running in browser, checking localStorage');
            if (localStorageService.isAvailable()) {
                console.log('localStorage is available, loading engrams');
                engrams = localStorageService.getEngrams();
                console.log('Loaded engrams from storage:', engrams);
            } else {
                console.error('Local storage is available but not working');
            }
        } else {
            console.log('Running on server, skipping localStorage operations');
        }
    })

    const addNewEngram = (title: string, content: string) => {
        console.log('🚀 addNewEngram called with:', title, content);
        
        // Check if we're in a browser environment
        if (!browser) {
            console.error('Cannot add engram: not in browser environment');
            return;
        }
        
        // Check if localStorage is available
        if (!localStorageService.isAvailable()) {
            console.error('Cannot add engram: localStorage not available');
            return;
        }
        
        // Validate input
        if (!title || !content) {
            console.error('Cannot add engram: missing title or content');
            return;
        }
        
        try {
            console.log('Calling localStorageService.addEngram with:', { title, content });
            // try to add the engram and pray to jesus that it works
            const newEngram = localStorageService.addEngram({ title, content, user_id: 'local-user' });
            
            if (newEngram) {
                console.log('Successfully created new engram:', newEngram);
                
                // explicitly update the UI state because Svelte 5 doesn't automatically re-render
                const updatedEngrams = [...engrams, newEngram];
                console.log('Created updated array:', updatedEngrams);
                
                engrams = updatedEngrams;
                console.log('Assigned updated engrams array:', engrams);
                
                // manual check of localStorage after update and pray to jesus that it worked
                setTimeout(() => {
                    console.log('Manual check of localStorage after update i.e. pray to jesus:');
                    console.log('Storage after update:', localStorageService.getEngrams());
                }, 100);
                
                return newEngram;
            } else {
                console.error('Failed to add new engram: storage service returned null');
                return null;
            }
        } catch (error) {
            console.error('Error in addNewEngram:', error);
            return null;
        }
    };

    const deleteEngram = (id: number) => {
        console.log('Deleting engram with ID:', id);
        engrams = engrams.filter(engram => engram.id !== id);
        localStorageService.deleteEngram(id);
        console.log('After deletion, engrams:', engrams);
    };

    // debug function to manually check if engrams are being added
    function checkEngrams() {
        console.log('Current engrams:', engrams);
        console.log('Storage engrams:', localStorageService.getEngrams());
    }

</script>

<svelte:head>
    <title>Bulletin</title>
    <meta name="description" content="A simple local memory management system built with SvelteKit" />
</svelte:head>

<Navbar items={navItems}>
    {#snippet children()}
        <div class="flex items-center space-x-4">
            <a href="https://github.com/Zenon131" target="_blank"> By JW </a>
        </div>
    {/snippet}
</Navbar>

<main class="container mx-auto px-4 py-8 mt-16">
    <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold tracking-tight text-foreground mb-4">Welcome to Bulletin!</h1>
            <p class="text-xl text-muted-foreground mb-8">
                Post your memories and share them with the community!
            </p>
        </div>

        <!-- Engram Form Card -->
        <EngramFormCard onSubmit={addNewEngram} class="mb-12" />
        
        <!-- Debug button (remove in production) -->
        <div class="text-center mb-6">
            <!-- <button 
                onclick={checkEngrams}
                class="px-4 py-2 text-sm border rounded hover:bg-accent text-muted-foreground"
            >
                Debug: Check Engrams
            </button> -->
            <p class="text-xs text-muted-foreground mt-2">
                {@html `<strong>My Posts: </strong> ${engrams.length} total`}
            </p>
        </div>

        <!-- Card Examples -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {#each engrams as engram (engram.id)}
                <Card>
                    {#snippet children()}
                        <CardHeader>
                            {#snippet children()}
                                <CardTitle>
                                    {#snippet children()}
                                        {engram.title}
                                    {/snippet}
                                </CardTitle>
                                <CardDescription>
                                    
                                </CardDescription>
                            {/snippet}
                        </CardHeader>
                        <CardContent>
                            {#snippet children()}
                                {engram.content}
                            {/snippet}
                        </CardContent>
                        <CardFooter>
                            {#snippet children()}
                                <div class="flex justify-between w-full">
                                    <p class="text-sm text-muted-foreground">
                                        {new Date(engram.createdAt).toLocaleDateString()}
                                    </p>
                                    <button 
                                        class="text-xs text-destructive hover:underline"
                                        onclick={() => deleteEngram(engram.id)}
                                    >
                                        Addressed
                                    </button>
                                </div>
                            {/snippet}
                        </CardFooter>
                    {/snippet}
                </Card>
            {/each}
        </div>

    </div>
</main>
