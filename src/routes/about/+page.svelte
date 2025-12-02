<script lang="ts">
  import { repo } from "remult";
  import { Room } from "../../shared/entities/Room";
  import { route } from "$lib/ROUTES";

  let rooms = $state<Room[]>([]);

  // Live query subscription for reactive updates
  $effect(() => {
    return repo(Room)
      .liveQuery()
      .subscribe((info) => {
        rooms = info.applyChanges(rooms);
      });
  });

  // Form state
  let newRoom = $state({
    name: "",
    description: "",
    number: "",
    location: "",
    capacity: 0,
    type: "",
  });

  let errorMessage = $state("");
  let isSubmitting = $state(false);

  // Form submission handler
  const addRoom = async (event: Event) => {
    event.preventDefault();
    errorMessage = "";
    isSubmitting = true;

    try {
      await repo(Room).insert(newRoom);
      // Reset form after successful submission
      newRoom = {
        name: "",
        description: "",
        number: "",
        location: "",
        capacity: 0,
        type: "",
      };
    } catch (error) {
      errorMessage = (error as { message: string }).message || "Failed to create room";
    } finally {
      isSubmitting = false;
    }
  };
</script>

<section class="min-h-screen flex flex-col items-center justify-center py-10 px-4">
  <h2 class="text-center text-5xl font-light uppercase my-10">About</h2>
  <p class="mb-8 text-center text-gray-600">
    This is the about page.
  </p>
  <a href={route('/')}>Back</a>

  <div class="w-full max-w-6xl space-y-8">
    <!-- Add Room Form -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-2xl font-bold mb-4">Add New Room</h3>
      <form onsubmit={addRoom} class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              bind:value={newRoom.name}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Room name"
            />
          </div>

          <div>
            <label for="number" class="block text-sm font-medium text-gray-700 mb-1">
              Number
            </label>
            <input
              type="text"
              id="number"
              bind:value={newRoom.number}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Room number"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              bind:value={newRoom.description}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Room description"
            />
          </div>

          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              bind:value={newRoom.location}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Room location"
            />
          </div>

          <div>
            <label for="capacity" class="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              id="capacity"
              bind:value={newRoom.capacity}
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <input
              type="text"
              id="type"
              bind:value={newRoom.type}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Room type"
            />
          </div>
        </div>

        {#if errorMessage}
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        {/if}

        <button
          type="submit"
          disabled={isSubmitting}
          class="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Adding..." : "Add Room"}
        </button>
      </form>
    </div>

    <!-- Rooms Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-2xl font-bold">Rooms</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Number
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#if rooms.length === 0}
              <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                  No rooms found. Add a room using the form above.
                </td>
              </tr>
            {:else}
              {#each rooms as room (room.id)}
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {room.name || "-"}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.number || "-"}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {room.description || "-"}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.location || "-"}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.capacity || 0}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.type || "-"}
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
