<script lang="ts">
	import { account } from '$lib';
	import { storeUser } from '$lib/stores';
	import { onMount } from 'svelte';

	let loaded = false;

	onMount(async () => {
		try {
            const user = await account.get();
            storeUser.set(user);
		} finally {
			loaded = true;
		}
	});
</script>

<main class="main-content">
	<div class="top-cover u-padding-block-end-56">
		<div class="container">
			<div class="u-flex u-gap-16 u-flex-justify-center u-margin-block-start-16">
				<h1 class="heading-level-1">Piano Tracker</h1>
				<code class="u-un-break-text" />
			</div>
			<p class="body-text-1 u-normal u-margin-block-start-8" style="max-width: 50rem">
				Track progress of <code>Atlantic Notes MIDI Filelist</code>
			</p>
		</div>
	</div>
	<div class="container u-margin-block-start-negative-56">
		<div class="card u-flex u-gap-24 u-flex-vertical">
			{#if loaded}
				<slot />
			{:else}
				<p>Authenticating ...</p>
			{/if}
		</div>
	</div>
</main>
