<script lang="ts">
  import type { File as FileEntity } from "$entities";
  import { route } from "$lib/ROUTES";
  import { S2FilesController } from "$modules/s2files";

	let error: string | undefined = $state(undefined);
	let fileInput: HTMLInputElement | undefined = $state(undefined);
	let selectedFile: File | undefined = $state(undefined);
	let uploading: boolean = $state(false);
	let searchQuery: string = $state('');
	let files: FileEntity[] = $state([]);
	let loading: boolean = $state(false);
	
	// Cache for thumbnail URLs to avoid regenerating presigned URLs
	let thumbnailUrls: Record<string, string> = $state({});
	let thumbnailLoading: Record<string, boolean> = $state({});
	let thumbnailErrors: Record<string, boolean> = $state({});

	const handleFileSelect = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			selectedFile = target.files[0];
			error = undefined;
		}
	}

	const handleUpload = async () => {
		if (!selectedFile) return;

		uploading = true;
		error = undefined;

		try {
			// Convert file to base64 using browser APIs
			const arrayBuffer = await selectedFile.arrayBuffer();
			const bytes = new Uint8Array(arrayBuffer);
			const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
			const base64 = btoa(binary);

			// Upload via backend method
			await S2FilesController.upload(
				selectedFile.name,
				selectedFile.type,
				base64
			);

			// Refresh file list
			await loadFiles();

			// Reset form
			selectedFile = undefined;
			if (fileInput) {
				fileInput.value = '';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to upload file';
		} finally {
			uploading = false;
		}
	}

	const handleSearch = async () => {
		await loadFiles();
	}

	const loadFiles = async () => {
		loading = true;
		error = undefined;

		try {
			files = await S2FilesController.listAll(searchQuery || undefined);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load files';
			files = [];
		} finally {
			loading = false;
		}
	}

	const handleDownload = async (file: FileEntity) => {
		try {
			error = undefined;
			
			// Get presigned URL from backend
			const presignedUrl = await S2FilesController.getDownloadUrl(file.id);
			
			// Create temporary anchor element to trigger download
			const link = document.createElement('a');
			link.href = presignedUrl;
			link.download = file.filename;
			link.target = '_blank'; // Open in new tab as fallback
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to download file';
		}
	}

	const handleDelete = async (file: FileEntity) => {
		if (!confirm(`Are you sure you want to delete ${file.filename}?`)) {
			return;
		}

		try {
			await S2FilesController.delete(file.id);
			await loadFiles();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete file';
		}
	}

	const formatFileSize = (size: number) => {
		return (size / 1024 / 1024).toFixed(2) + ' MB';
	}

	const formatDate = (date: Date | string | undefined) => {
		if (!date) return '';
		const dateObj = date instanceof Date ? date : new Date(date);
		return dateObj.toLocaleDateString();
	}

	const isImageFile = (file: FileEntity): boolean => {
		return file.mimeType.startsWith('image/');
	}

	const loadThumbnail = async (file: FileEntity) => {
		if (!isImageFile(file)) {
			return;
		}

		// Skip if already cached, loading, or errored
		if (thumbnailUrls[file.id] || thumbnailLoading[file.id] || thumbnailErrors[file.id]) {
			return;
		}

		try {
			thumbnailLoading[file.id] = true;
			const url = await S2FilesController.getDownloadUrl(file.id);
			thumbnailUrls[file.id] = url;
		} catch (err) {
			thumbnailErrors[file.id] = true;
		} finally {
			thumbnailLoading[file.id] = false;
		}
	}

	// Load thumbnails for image files when files change
	$effect(() => {
		for (const file of files) {
			if (isImageFile(file)) {
				loadThumbnail(file);
			}
		}
	});

	// Load files on mount
	loadFiles();
</script>

<div class="container mx-auto p-6 max-w-6xl">
	<h1 class="text-3xl font-bold mb-8">File Management</h1>
	<a href={route('/')}>Home</a>

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
						Selected: {selectedFile?.name}
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
									Preview
								</th>
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
							{#each files as file (file.id)}
								<tr>
									<td class="px-6 py-4 whitespace-nowrap">
										{#if isImageFile(file)}
											{#if thumbnailUrls[file.id]}
												<img
													src={thumbnailUrls[file.id]}
													alt={file.filename}
													class="w-28 h-28 object-contain rounded border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors"
													onerror={() => thumbnailErrors[file.id] = true}
												/>
											{:else if thumbnailLoading[file.id]}
												<div class="w-28 h-28 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
													<span class="text-xs text-gray-500">Loading...</span>
												</div>
											{:else if thumbnailErrors[file.id]}
												<div class="w-28 h-28 flex items-center justify-center bg-gray-50 rounded border border-gray-200">
													<span class="text-xs text-gray-400">Error</span>
												</div>
											{:else}
												<div class="w-28 h-28 flex items-center justify-center bg-gray-50 rounded border border-gray-200">
													<span class="text-xs text-gray-400">No preview</span>
												</div>
											{/if}
										{/if}
									</td>
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

