import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ShoppingItemData } from '../types/shopping';
import { formatItemText } from '../utils/format';

interface Props {
  item: ShoppingItemData;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (item: ShoppingItemData) => void;
}

export function ShoppingItemRow({ item, onToggle, onDelete, onEdit }: Props) {
  const isManual = item.sources.length === 1 && item.sources[0] === 'Manual';
  const displayText = formatItemText(item.quantity, item.unit, item.item, item.style);

  return (
    <Pressable
      style={styles.container}
      onPress={() => onToggle(item.id)}
      onLongPress={() => {
        if (isManual && onEdit) onEdit(item);
      }}
    >
      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
        {item.checked && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <View style={styles.content}>
        <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
          {displayText}
        </Text>
        <Text style={styles.sourceText}>
          {item.sources.join(', ')}
        </Text>
      </View>

      <Pressable
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
        hitSlop={8}
      >
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  sourceText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '600',
  },
});
