<template>
  <div class="flex min-h-screen items-center justify-center bg-bg px-4">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-primary-600">家庭管家</h1>
        <p class="mt-2 text-muted">让家庭管理更简单</p>
      </div>
      <div class="rounded-xl bg-card p-8 shadow-sm">
        <router-view />
      </div>
    </div>
  </div>
</template>
