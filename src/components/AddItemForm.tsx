import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: string, quantity: number, unit: string, style?: string) => void;
  /** If provided, pre-fills the form for editing */
  editItem?: { item: string; quantity: number; unit: string; style: string } | null;
}

const COMMON_UNITS = ['', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'can', 'piece', 'clove', 'slice'];

export function AddItemForm({ visible, onClose, onAdd, editItem }: Props) {
  const [item, setItem] = useState(editItem?.item ?? '');
  const [quantity, setQuantity] = useState(editItem ? String(editItem.quantity) : '1');
  const [unit, setUnit] = useState(editItem?.unit ?? '');
  const [style, setStyle] = useState(editItem?.style ?? '');

  const handleSubmit = () => {
    const trimmed = item.trim();
    if (!trimmed) return;

    const qty = parseFloat(quantity) || 1;
    onAdd(trimmed, qty, unit, style || undefined);
    resetAndClose();
  };

  const resetAndClose = () => {
    setItem('');
    setQuantity('1');
    setUnit('');
    setStyle('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>{editItem ? 'Edit Item' : 'Add Item'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Item name (e.g., chicken breast)"
            value={item}
            onChangeText={setItem}
            autoFocus
            returnKeyType="next"
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.qtyInput]}
              placeholder="Qty"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.input, styles.unitInput]}
              placeholder="Unit (cup, lb, ...)"
              value={unit}
              onChangeText={setUnit}
            />
          </View>

          <View style={styles.unitChips}>
            {COMMON_UNITS.map((u) => (
              <Pressable
                key={u || 'none'}
                style={[styles.chip, unit === u && styles.chipActive]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>
                  {u || 'none'}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Style / prep (optional, e.g., diced)"
            value={style}
            onChangeText={setStyle}
          />

          <View style={styles.buttons}>
            <Pressable style={styles.cancelButton} onPress={resetAndClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.addButton, !item.trim() && styles.addButtonDisabled]}
              onPress={handleSubmit}
              disabled={!item.trim()}
            >
              <Text style={styles.addText}>{editItem ? 'Save' : 'Add'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  qtyInput: {
    flex: 1,
  },
  unitInput: {
    flex: 2,
  },
  unitChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  chipActive: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    fontSize: 13,
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
