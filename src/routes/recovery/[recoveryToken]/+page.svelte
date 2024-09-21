<script lang="ts">
    import SubmitButton from "$components/common/submitButton.svelte";
    import type { ActionData } from "./$types";
    import FormInput from "$components/common/authForm/formInput.svelte";
    import { enhance } from "$app/forms";
    export let form: ActionData;
    let success = false;
    const formSubmitHandler = () => {
        return async ({ result, update }: { result: any; update: any }) => {
            if (!result.data) {
                success = true;
            }
            await update({ reset: false });
        };
    };
</script>

<svelte:head>
    <title>Sign In</title>
</svelte:head>

<div class="flex justify-center w-full self-center">
    <div class="shadow p-6 rounded w-11/12 sm:w-8/12 lg:w-1/2">
        <div class="lg:ml-10">
            {#if success}
                <h1 class="text-center text-green-600">Password changed</h1>
            {:else}
                <h1>Password recovery</h1>
                <span>Please enter your new password</span>
                <form
                    use:enhance={formSubmitHandler}
                    autocomplete="off"
                    method="post"
                >
                    <FormInput
                        type="password"
                        id="password"
                        required={true}
                        name="password"
                        label="Password"
                        autocomplete="off"
                        error={form?.errors.password}
                    />
                    <FormInput
                        type="password"
                        id="repeat_password"
                        required={true}
                        name="password_confirm"
                        label="Repeat password"
                        autocomplete="off"
                        error={form?.errors.password_confirm}
                    />
                    <SubmitButton Class="mt-4 w-36 sm:w-28 "
                        >Change</SubmitButton
                    >
                </form>
            {/if}
        </div>
    </div>
</div>
