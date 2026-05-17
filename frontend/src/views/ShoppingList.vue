<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventory } from '@/composables/useInventory'
import EmptyState from '@/components/common/EmptyState.vue'
import Skeleton from '@/components/common/Skeleton.vue'

const { items, isLoading, fetchItems } = useInventory()

const shoppingItems = ref<Array<{ id: string; name: string; quantity: number; unit: string; checked: boolean; itemId: string }>>([])

onMounted(async () => {
  await fetchItems({ lowStock: true } as Record<string, unknown> & { page?: number })
  updateShoppingList()
})

function updateShoppingList() {
  const lowStockItems = items.value.filter((i) => i.minQuantity > 0 && i.quantity <= i.minQuantity)
  const existingIds = new Set(shoppingItems.value.filter((s) => s.itemId).map((s) => s.itemId))
  for (const item of lowStockItems) {
    if (!existingIds.has(item.id)) {
      shoppingItems.value.push({
        id: crypto.randomUUID(),
        name: item.name,
        quantity: Math.max(item.minQuantity - item.quantity, 1),
        unit: item.unit ?? '个',
        checked: false,
        itemId: item.id,
      })
    }
  }
}

function addManualItem() {
  shoppingItems.value.push({
    id: crypto.randomUUID(),
    name: '',
    quantity: 1,
    unit: '个',
    checked: false,
    itemId: '',
  })
}

function removeItem(id: string) {
  shoppingItems.value = shoppingItems.value.filter((i) => i.id !== id)
}

function toggleItem(id: string) {
  const item = shoppingItems.value.find((i) => i.id === id)
  if (item) item.checked = !item.checked
}

const uncheckedCount = computed(() => shoppingItems.value.filter((i) => !i.checked).length)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">采购清单</h2>
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700" @click="addManualItem">
        手动添加
      </button>
    </div>

    <div v-if="isLoading"><Skeleton type="list" :rows="3" /></div>
    <div v-else-if="shoppingItems.length === 0">
      <EmptyState icon="🛒" title="采购清单为空" description="低库存物品会自动添加到此清单，也可以手动添加采购项" />
    </div>
    <div v-else class="space-y-2">
      <div class="flex items-center justify-between text-sm text-muted">
        <span>共 {{ shoppingItems.length }} 项</span>
        <span>{{ uncheckedCount }} 项未采购</span>
      </div>
      <div
        v-for="item in shoppingItems"
        :key="item.id"
        class="flex items-center gap-3 rounded-lg bg-card p-3 shadow-sm"
        :class="{ 'opacity-60': item.checked }"
      >
        <input type="checkbox" :checked="item.checked" class="h-5 w-5 rounded border-gray-300 text-primary-600" @change="toggleItem(item.id)" />
        <input v-if="!item.itemId" v-model="item.name" placeholder="物品名称" class="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none" />
        <span v-else class="flex-1 text-sm font-medium" :class="{ 'line-through text-muted': item.checked }">{{ item.name }}</span>
        <div v-if="!item.itemId" class="flex items-center gap-1">
          <input v-model.number="item.quantity" type="number" min="1" class="w-14 rounded border border-gray-300 px-1 py-1 text-sm text-center" />
          <input v-model="item.unit" class="w-12 rounded border border-gray-300 px-1 py-1 text-sm" placeholder="个" />
        </div>
        <span v-else class="text-sm text-muted">{{ item.quantity }}{{ item.unit }}</span>
        <button class="rounded p-1 text-gray-400 hover:text-danger-500" @click="removeItem(item.id)">🗑</button>
      </div>
    </div>
  </div>
</template>
