<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useInventory } from '@/composables/useInventory'
import { useNotification } from '@/composables/useNotification'
import { formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import type { CreateInventoryDto } from '@/types/inventory'

const { items, isLoading, error, fetchItems, createItem, updateItem, deleteItem, stockIn, stockOut } = useInventory()
const { showToast } = useNotification()

const searchQuery = ref('')
const categoryFilter = ref('')
const showForm = ref(false)
const showStockForm = ref(false)
const editingId = ref<string | null>(null)
const stockAction = ref<'in' | 'out'>('in')
const stockItem = ref<typeof items.value[0] | null>(null)
const stockQty = ref(1)
const stockNote = ref('')

const form = ref<CreateInventoryDto>({
  name: '',
  category: 'fresh_food',
  quantity: 1,
  unit: '个',
  location: '',
  expiryDate: '',
  minQuantity: 0,
  note: '',
})

const categories = [
  { value: 'fresh_food', label: '🥬 食材生鲜' },
  { value: 'dry_food', label: '🧂 调料干货' },
  { value: 'cleaning', label: '🧹 清洁用品' },
  { value: 'medicine', label: '💊 药品保健' },
  { value: 'personal_care', label: '🧴 个护美妆' },
  { value: 'tools', label: '🔧 工具杂项' },
  { value: 'other', label: '📦 其他' },
]

onMounted(() => loadItems())

async function loadItems() {
  const params: Record<string, unknown> = { page: 1, pageSize: 50 }
  if (searchQuery.value) params.search = searchQuery.value
  if (categoryFilter.value) params.category = categoryFilter.value
  await fetchItems(params as Record<string, string | number | boolean> & { page?: number })
}

function isExpiring(item: typeof items.value[0]) {
  if (!item.expiryDate) return false
  const d = new Date(item.expiryDate)
  return d <= new Date(Date.now() + 7 * 86400000)
}

function isExpired(item: typeof items.value[0]) {
  if (!item.expiryDate) return false
  return new Date(item.expiryDate) < new Date()
}

function isLowStock(item: typeof items.value[0]) {
  return item.minQuantity > 0 && item.quantity <= item.minQuantity
}

function openCreateForm() {
  editingId.value = null
  form.value = { name: '', category: 'fresh_food', quantity: 1, unit: '个', location: '', expiryDate: '', minQuantity: 0, note: '' }
  showForm.value = true
}

function openEditForm(item: typeof items.value[0]) {
  editingId.value = item.id
  form.value = {
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit ?? '个',
    location: item.location ?? '',
    expiryDate: item.expiryDate?.slice(0, 10) ?? '',
    minQuantity: item.minQuantity,
    note: item.note ?? '',
  }
  showForm.value = true
}

async function handleSubmit() {
  if (!form.value.name.trim()) return
  try {
    if (editingId.value) {
      await updateItem(editingId.value, form.value)
      showToast('success', '更新物品成功')
    } else {
      await createItem(form.value)
      showToast('success', '添加物品成功')
    }
    showForm.value = false
    loadItems()
  } catch {
    showToast('error', '操作失败')
  }
}

async function handleDelete(id: string) {
  try {
    await deleteItem(id)
    showToast('success', '删除成功')
    loadItems()
  } catch {
    showToast('error', '删除失败')
  }
}

function openStockForm(item: typeof items.value[0], action: 'in' | 'out') {
  stockItem.value = item
  stockAction.value = action
  stockQty.value = 1
  stockNote.value = ''
  showStockForm.value = true
}

async function handleStock() {
  if (!stockItem.value || stockQty.value <= 0) return
  try {
    if (stockAction.value === 'in') {
      await stockIn(stockItem.value.id, { quantity: stockQty.value, note: stockNote.value || undefined })
      showToast('success', '入库成功')
    } else {
      await stockOut(stockItem.value.id, { quantity: stockQty.value, note: stockNote.value || undefined })
      showToast('success', '出库成功')
    }
    showStockForm.value = false
    loadItems()
  } catch {
    showToast('error', '操作失败')
  }
}

const categoryName = (v: string) => categories.find((c) => c.value === v)?.label ?? v
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">物品库存</h2>
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700" @click="openCreateForm">
        新增物品
      </button>
    </div>

    <div class="flex gap-3">
      <input v-model="searchQuery" placeholder="搜索物品..." class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" @input="loadItems" />
      <select v-model="categoryFilter" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" @change="loadItems">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
      </select>
    </div>

    <div v-if="isLoading"><Skeleton type="card" :rows="4" /></div>
    <div v-else-if="error" class="rounded-xl bg-danger-50 p-4 text-sm text-danger-600">{{ error }}</div>
    <div v-else-if="items.length === 0">
      <EmptyState icon="📦" title="暂无库存物品" description="点击右上角添加家庭物品" />
    </div>
    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="rounded-xl bg-card p-4 shadow-sm transition-colors hover:bg-gray-50 cursor-pointer"
        :class="{ 'border-l-4 border-danger-400': isExpired(item), 'border-l-4 border-warning-400': !isExpired(item) && isExpiring(item) }"
        @click="openEditForm(item)"
      >
        <div class="mb-2 flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900">{{ item.name }}</p>
            <p class="text-xs text-muted">{{ categoryName(item.category) }}</p>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-lg font-semibold" :class="isLowStock(item) ? 'text-danger-500' : 'text-gray-900'">
              {{ item.quantity }}<span class="text-sm text-muted">{{ item.unit }}</span>
            </span>
            <span v-if="isExpired(item)" class="text-xs text-danger-500">已过期</span>
            <span v-else-if="isExpiring(item)" class="text-xs text-warning-500">{{ formatDate(item.expiryDate!) }}到期</span>
          </div>
        </div>
        <div v-if="item.location || item.note" class="mb-3 text-xs text-muted">
          {{ [item.location, item.note].filter(Boolean).join(' · ') }}
        </div>
        <div class="flex gap-2">
          <button
            class="flex-1 rounded-lg bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700 hover:bg-success-100"
            @click.stop="openStockForm(item, 'in')"
          >
            ＋ 入库
          </button>
          <button
            class="flex-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
            @click.stop="openStockForm(item, 'out')"
            :disabled="item.quantity <= 0"
          >
            － 出库
          </button>
          <button
            class="rounded-lg px-1.5 py-1 text-xs text-gray-400 hover:text-danger-500"
            @click.stop="handleDelete(item.id)"
          >
            🗑
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/30" @click="showForm = false" />
        <div class="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
          <div class="flex items-center justify-between border-b px-6 py-4">
            <h3 class="text-lg font-semibold">{{ editingId ? '编辑物品' : '新增物品' }}</h3>
            <button class="text-gray-400 hover:text-gray-600" @click="showForm = false">✕</button>
          </div>
          <div class="flex-1 overflow-auto p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">名称</label>
              <input v-model="form.name" maxlength="100" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="物品名称" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">分类</label>
              <select v-model="form.category" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5">
                <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
            </div>
            <div class="flex gap-3">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700">数量</label>
                <input v-model.number="form.quantity" type="number" min="0" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <div class="w-24">
                <label class="block text-sm font-medium text-gray-700">单位</label>
                <input v-model="form.unit" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="个" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">存放位置</label>
              <input v-model="form.location" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="可选" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">保质期</label>
              <input v-model="form.expiryDate" type="date" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">最低库存阈值</label>
              <input v-model.number="form.minQuantity" type="number" min="0" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">备注</label>
              <input v-model="form.note" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="可选" />
            </div>
          </div>
          <div class="border-t px-6 py-4">
            <button class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700" @click="handleSubmit">
              {{ editingId ? '更新' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showStockForm" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30" @click="showStockForm = false" />
        <div class="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <h3 class="mb-4 text-lg font-semibold">{{ stockAction === 'in' ? '入库' : '出库' }} - {{ stockItem?.name }}</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">数量</label>
              <input v-model.number="stockQty" type="number" min="1" :max="stockAction === 'out' ? stockItem?.quantity ?? 0 : undefined" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xl font-semibold" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">备注</label>
              <input v-model="stockNote" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="可选" />
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button class="rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="showStockForm = false">取消</button>
            <button
              class="rounded-lg px-4 py-2 text-sm text-white"
              :class="stockAction === 'in' ? 'bg-success-500 hover:bg-success-600' : 'bg-warning-500 hover:bg-warning-600'"
              @click="handleStock"
            >
              {{ stockAction === 'in' ? '确认入库' : '确认出库' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
