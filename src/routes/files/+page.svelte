<script lang="ts">
  import type { File as FileEntity } from "$entities";

	let error: string | undefined =$state(undefined);
	let fileInput: HTMLInputElement | undefined = $state(undefined);
	let selectedFile: File | undefined = $state(undefined);
	let uploading: boolean = $state(false);
	let searchQuery: string = $state('');
	let files: FileEntity[] = $state([]);
	let loading: boolean = $state(false);	
	const handleFileSelect = (e: Event) => {}
	const handleUpload = () => {}
	const handleSearch = () => {}
	const handleDownload = (file: FileEntity) => {}
	const handleDelete = (file: FileEntity) => {}
	const formatFileSize = (size: number) => {
		return (size / 1024 / 1024).toFixed(2) + ' MB';
	}
	const formatDate = (date: Date) => {
		return date.toLocaleDateString();
	}
</script>

<div class="container mx-auto p-6 max-w-6xl">
	<h1 class="text-3xl font-bold mb-8">File Management</h1>

	<!-- Error Message -->
	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6" role="alert">
			<p>{error}</p>
		</div>
	{/if}

	<!-- Upload Section -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<h2 class="text-xl font-semibold mb-4">Upload File</h2>
		<div class="flex gap-4 items-end">
			<div class="flex-1">
				<label for="file-input" class="block text-sm font-medium text-gray-700 mb-2">
					Select File
				</label>
				<input
					id="file-input"
					type="file"
					bind:this={fileInput}
					onchange={handleFileSelect}
					class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
					disabled={uploading}
				/>
				{#if selectedFile}
					<p class="mt-2 text-sm text-gray-600">
						Selected: {selectedFile?.filename}
					</p>
				{/if}
			</div>
			<button
				type="button"
				onclick={handleUpload}
				disabled={!selectedFile || uploading}
				class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
			>
				{uploading ? 'Uploading...' : 'Upload'}
			</button>
		</div>
	</div>

	<!-- Search Section -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<div class="flex gap-4">
			<input
				type="text"
				bind:value={searchQuery}
				onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				placeholder="Search files..."
				class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
			<button
				type="button"
				onclick={handleSearch}
				class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
			>
				Search
			</button>
		</div>
	</div>

	<!-- Files List -->
	<div class="bg-white rounded-lg shadow-md p-6">
		<h2 class="text-xl font-semibold mb-4">Files</h2>

		<div data-testid="files-list">
			{#if loading}
				<p class="text-gray-600 text-center py-8">Loading files...</p>
			{:else if files.length === 0}
				<p class="text-gray-600 text-center py-8">No files found</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Filename
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Size
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Type
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Uploaded
								</th>
								<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each files as file}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{file.filename}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{formatFileSize(file.size)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{file.mimeType}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{formatDate(file.createdAt)}
									</td>
									<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<button
											type="button"
											onclick={() => handleDownload(file)}
											class="text-blue-600 hover:text-blue-900 mr-4"
										>
											Download
										</button>
										<button
											type="button"
											onclick={() => handleDelete(file)}
											class="text-red-600 hover:text-red-900 mr-4"
										>
											Delete
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
</div>

