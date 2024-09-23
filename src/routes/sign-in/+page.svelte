<script lang="ts">
    import SubmitButton from "$components/common/submitButton.svelte";
    import type { ActionData } from "./$types";
    import FormInput from "$components/common/authForm/formInput.svelte";
    import { enhance } from "$app/forms";
    export let form: ActionData;
    const formSubmitHandler = () => {
        return async ({ result, update }: { result: any; update: any }) => {
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
            <h3>Sign In</h3>
            <span>Please fill in your credentials to sign in</span>
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
                <FormInput
                    type="password"
                    id="password"
                    required={true}
                    name="password"
                    label="Password"
                    autocomplete="off"
                    error={form?.errors.password}
                />

                <SubmitButton Class="mt-4 w-36 sm:w-28 ">Sign in</SubmitButton>
                <p class="mt-3">
                    Don't have an account?
                    <a class="bare-link" href="/sign-up">Sign up now</a>.
                </p>
                <p class="mt-3">
                    Forgot password?
                    <a class="bare-link" href="/recovery">Recover</a>.
                </p>
            </form>
        </div>
    </div>
</div>
