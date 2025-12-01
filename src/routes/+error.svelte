<script lang="ts">
  import { page } from "$app/state";
  import { route } from "$lib/ROUTES";
</script>

<section class="h-screen flex flex-col items-center justify-center">
  <h1 class="text-center text-5xl font-light uppercase my-10">
    {page.status}: {page.error?.message}
  </h1>
  <a href={route("/")}>Go to home</a>
</section>
