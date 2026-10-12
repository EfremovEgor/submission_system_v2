<script lang="ts">
    export let data;
</script>

<div class="flex justify-center w-full self-center">
    <div class="shadow p-11 rounded w-11/12 sm:w-8/12 lg:w-1/2">
        <h1 class="text-center text-green-600">Registration complete</h1>
        <p class="text-center mt-5">
            <a class="bare-link" href={data.signInLink}>Sign in</a> to continue.
        </p>
    </div>
</div>
