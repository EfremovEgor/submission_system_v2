<script lang="ts">
    import SubmitButton from "$components/common/submitButton.svelte";
    import type { ActionData } from "./$types";
    import FormInput from "$components/common/authForm/formInput.svelte";
    import { enhance } from "$app/forms";
    export let form: ActionData;
    let emailIsSent = false;
    const formSubmitHandler = () => {
        return async ({ result, update }: { result: any; update: any }) => {
            emailIsSent = result.data.emailIsSent;
            await update({ reset: false });
        };
    };
</script>

<svelte:head>
    <title>Sign Up</title>
</svelte:head>
<div class="flex justify-center w-full self-center">
    <div
        class="shadow p-6 rounded w-11/12 sm:w-8/12 lg:w-1/2 {emailIsSent
            ? 'p-11'
            : ''}"
    >
        <div class="lg:ml-10">
            {#if !emailIsSent}
                <h1>Create account</h1>
                <span
                    >Please fill in your credentials to create new account</span
                >
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
                        autocomplete="email"
                        error={form?.errors.email}
                    />
                    <div class="flex flex-row gap-2">
                        <FormInput
                            id="first_name"
                            required={true}
                            name="first_name"
                            label="First Name"
                            autocomplete="given-name"
                            error={form?.errors.first_name}
                        />
                        <FormInput
                            id="last_name"
                            required={true}
                            name="last_name"
                            label="Last Name"
                            autocomplete="family-name"
                            error={form?.errors.last_name}
                        />
                        <!-- <FormInput
                            id="middle_name"
                            required={false}
                            name="middle_name"
                            label="Middle Name"
                            autocomplete="additional-name"
                            error={form?.errors.middle_name}
                        /> -->
                    </div>
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
                        >Sign up</SubmitButton
                    >
                    <p class="mt-3">
                        Already have an account?
                        <a class="bare-link" href="/sign-in"> Sign in now</a>.
                    </p>
                </form>
            {:else}
                <h1 class="text-center text-green-600">
                    Email successfully sent
                </h1>
            {/if}
        </div>
    </div>
</div>
