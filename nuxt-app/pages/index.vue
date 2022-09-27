<template>
    <h1>Index page</h1>
    <ClientOnly>
        <FormKit type="text" label="Number" validation="required|number|between:20,50" validation-visibility="live"
            help="Enter a number between 20 and 50." />
    </ClientOnly>
</template>
