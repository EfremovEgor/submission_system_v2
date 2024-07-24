<script>
    import { page } from "$app/stores";
    import { t } from "$translations/index";
</script>

<div class="container self-center">
    <div class="flex items-center align-middle justify-center">
        <h1 class="text-5xl">
            {$page.status}
            {$t(`errors.${$page.status}`)}
        </h1>
    </div>
</div>
