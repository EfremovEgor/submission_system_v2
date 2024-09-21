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
                <h1 class="text-center text-green-600">
                    Email successfully sent
                </h1>
            {:else}
                <h1>Password recovery</h1>
                <span>Please fill in your email to receive recovery code</span>
                <form
                    use:enhance={formSubmitHandler}
                    autocomplete="off"
                    method="post"
                >
                    <FormInput
                        type="email"
                        id="email"
                        required={true}
                        name="email"
                        label="Email"
                        error={form?.errors.email}
                    />
                    <SubmitButton Class="mt-4 w-36 sm:w-28 "
                        >Sign in</SubmitButton
                    >
                    <p class="mt-3">
                        Back to
                        <a class="bare-link" href="/sign-in">sign in</a>.
                    </p>
                </form>
            {/if}
        </div>
    </div>
</div>
