<script lang="ts">
  import { route } from "$lib/ROUTES";
</script>

<section class="h-screen flex flex-col items-center justify-center">
  <h1 class="text-center text-5xl font-light uppercase my-10">
    404: Not Found
  </h1>
  <a href={route("/")}>Go to home</a>
</section>
