<script lang="ts">
	import { onMount } from 'svelte';
	import { Query } from 'appwrite';
	import { account, databases } from '$lib';
	import { storeUser } from '$lib/stores';

	let songs: any = null;
	let loadingMore = false;
	let searchText = '';

	let defaultQueries: any = [];

	let algoliaIndex: any = null;

	let completedIds: any[] = [];
	$: {
		if ($storeUser !== null) {
			completedIds = $storeUser.prefs.completedSongs || [];
		}
	}

	onMount(async () => {
		initAlgolia();
		fetchSongs();
	});

	async function fetchSongs() {
		songs = null;
		const response = await databases.listDocuments('main', 'songs', [
			...defaultQueries,
			Query.limit(25),
			Query.orderDesc('$createdAt')
		]);
		songs = response;
	}

	function initAlgolia() {
		// @ts-ignore
		const algolia: any = algoliasearch('5K08DLE216', '2c84b39eda733af4bf14b0607c0b3598');
		algoliaIndex = algolia.initIndex('songs');
	}

	async function loadMore() {
		loadingMore = true;

		try {
			const lastId = songs[songs.length - 1].$id;
			const response = await databases.listDocuments('main', 'songs', [
				...defaultQueries,
				Query.limit(25),
				Query.orderDesc('$createdAt'),
				Query.cursorAfter(lastId)
			]);
			songs.documents.push(...response.documents);
			songs = songs;
		} finally {
			loadingMore = false;
		}
	}

	async function search() {
		const response = await algoliaIndex.search(searchText);
		const ids = response.hits.map((hit: any) => hit.objectID);

		const responseAppwrite = await databases.listDocuments('main', 'songs', [
			...defaultQueries,
			Query.orderDesc('$createdAt'),
			Query.limit(25),
			Query.equal('$id', ids)
		]);
		songs = responseAppwrite;
	}

	async function toggleCompleted(songId: string) {
		if (completedIds.includes(songId)) {
			const newIds = completedIds.filter((id) => id !== songId);
			await account.updatePrefs({
				completedSongs: newIds
			});
			completedIds = newIds;
		} else {
			const newIds = [...completedIds, songId];
			console.log(newIds);
			await account.updatePrefs({
				completedSongs: newIds
			});
			completedIds = newIds;
		}
	}

	async function loadAll() {
		defaultQueries = [];
		searchText = '';
		fetchSongs();
	}

	async function loadCompleted() {
		defaultQueries = [Query.equal('$id', completedIds)];
		searchText = '';
		fetchSongs();
	}

	async function loadIncomplete() {
		defaultQueries = [Query.notEqual('$id', completedIds)];
		searchText = '';
		fetchSongs();
	}
</script>

{#if $storeUser === null}
	<a class="button" href="https://piano-tracker.authui.site/">
		<span class="text"> Sign In </span>
	</a>
{:else}
	<div class="u-flex u-gap-8">
		<button class="button is-secondary" on:click={loadAll}>
			<span class="text"> All</span>
		</button>
		<button class="button is-secondary" on:click={loadCompleted}>
			<span class="text"> Completed Only</span>
		</button>

		<button class="button is-secondary" on:click={loadIncomplete}>
			<span class="text"> Incomplete Only</span>
		</button>
	</div>
	<div class="u-flex u-gap-8">
		<div style="width: 100%;" class="input-text-wrapper is-with-end-button">
			<input
				bind:value={searchText}
				on:input={search}
				style="width: 100%;"
				type="search"
				placeholder="Search"
			/>
			<div class="icon-search" aria-hidden="true" />
		</div>

		<button on:click={search} class="button">
			<span class="text">Find</span>
		</button>
	</div>
	<div>
		{#if songs === null}
			<div class="card">Loading ...</div>
		{:else if songs.documents.length === 0}
			<div class="card">No songs found.</div>
		{:else}
			<div class="u-flex u-flex-vertical u-gap-24">
				{#each songs.documents as song}
					{@const completed = completedIds.includes(song.$id)}
					<div class="card">
						<div class="u-flex u-gap-12 u-cross-center u-main-space-between">
							<div class="u-flex u-gap-12 u-cross-center">
								<h1 class="eyebrow-heading-1">{song.name}</h1>

								<div class="tag is-success" style={`opacity: ${completed ? 1 : 0}`}>
									<span class="icon-check-circle" aria-hidden="true" />
									<span class="text">Completed</span>
								</div>
							</div>
							<div class="u-flex u-gap-8">
								<a href={song.urlPatreon} target="_blank" class="button is-secondary">
									<span class="icon-external-link" aria-hidden="true" />
								</a>
								<button on:click={() => toggleCompleted(song.$id)} class="button is-secondary">
									{#if completed}
										<span class="icon-x" aria-hidden="true" />
									{:else}
										<span class="icon-check" aria-hidden="true" />
									{/if}
								</button>
							</div>
						</div>
					</div>
				{/each}

				<div class="u-cross-center u-flex u-gap-12">
					<button class="button" on:click={loadMore}>
						<span class="text">
							{#if loadingMore}
								<div class="loader" />
							{:else}
								Load More
							{/if}
						</span>
					</button>
					<p>Total: {songs.total}</p>
				</div>
			</div>
		{/if}
	</div>
{/if}
