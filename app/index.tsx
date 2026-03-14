import { useState, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  Pressable,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useShoppingStore } from '../src/stores/shopping-store';
import { useSync } from '../src/hooks/useSync';
import { groupByCategory } from '../src/utils/categories';
import { ShoppingItemRow } from '../src/components/ShoppingItemRow';
import { CategoryHeader } from '../src/components/CategoryHeader';
import { AddItemForm } from '../src/components/AddItemForm';
import { SyncIndicator } from '../src/components/SyncIndicator';
import { ShoppingItemData } from '../src/types/shopping';

export default function ShoppingListScreen() {
  const router = useRouter();
  const { refresh, syncStatus } = useSync();
  const items = useShoppingStore((s) => s.items);
  const lastSyncedAt = useShoppingStore((s) => s.lastSyncedAt);
  const toggleItem = useShoppingStore((s) => s.toggleItem);
  const removeItem = useShoppingStore((s) => s.removeItem);
  const addManualItem = useShoppingStore((s) => s.addManualItem);
  const updateItem = useShoppingStore((s) => s.updateItem);
  const clearChecked = useShoppingStore((s) => s.clearChecked);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItemData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Split into unchecked and checked, group unchecked by category
  const { uncheckedSections, checkedItems } = useMemo(() => {
    const unchecked = items.filter((i) => !i.checked);
    const checked = items.filter((i) => i.checked);
    const groups = groupByCategory(unchecked);
    const sections = groups.map((g) => ({
      title: g.category,
      data: g.items,
    }));
    return { uncheckedSections: sections, checkedItems: checked };
  }, [items]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Item', 'Remove this item from your list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
    ]);
  };

  const handleEdit = (item: ShoppingItemData) => {
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleAddOrUpdate = (item: string, quantity: number, unit: string, style?: string) => {
    if (editingItem) {
      updateItem(editingItem.id, { item, quantity, unit, style: style ?? '' });
      setEditingItem(null);
    } else {
      addManualItem(item, quantity, unit, style);
    }
  };

  const handleClearChecked = () => {
    if (checkedItems.length === 0) return;
    Alert.alert(
      'Clear Checked Items',
      `Remove ${checkedItems.length} checked item${checkedItems.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearChecked },
      ],
    );
  };

  const totalCount = items.length;
  const checkedCount = checkedItems.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Shopping List</Text>
          <SyncIndicator status={syncStatus} lastSyncedAt={lastSyncedAt} />
        </View>
        <View style={styles.headerRight}>
          {checkedCount > 0 && (
            <Pressable onPress={handleClearChecked} hitSlop={8}>
              <Text style={styles.clearText}>Clear ({checkedCount})</Text>
            </Pressable>
          )}
          <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>
        </View>
      </View>

      {/* Counter */}
      {totalCount > 0 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {checkedCount} of {totalCount} items checked
          </Text>
        </View>
      )}

      {/* List */}
      {totalCount === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your list is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items from eCookbook or tap + to add manually
          </Text>
        </View>
      ) : (
        <SectionList
          sections={[
            ...uncheckedSections,
            ...(checkedItems.length > 0
              ? [{ title: 'Checked', data: checkedItems }]
              : []),
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShoppingItemRow
              item={item}
              onToggle={toggleItem}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
          renderSectionHeader={({ section }) => (
            <CategoryHeader title={section.title} count={section.data.length} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          stickySectionHeadersEnabled
        />
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setShowAddForm(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Add/Edit Modal */}
      <AddItemForm
        visible={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingItem(null);
        }}
        onAdd={handleAddOrUpdate}
        editItem={editingItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clearText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
  settingsIcon: {
    fontSize: 22,
  },
  counter: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#f9f9f9',
  },
  counterText: {
    fontSize: 13,
    color: '#888',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '400',
    marginTop: -2,
  },
});
