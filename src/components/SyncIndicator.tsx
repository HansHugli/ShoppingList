import { View, Text, StyleSheet } from 'react-native';
import { SyncStatus } from '../types/shopping';

interface Props {
  status: SyncStatus;
  lastSyncedAt: Date | null;
}

export function SyncIndicator({ status, lastSyncedAt }: Props) {
  const getLabel = () => {
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync error';
      case 'offline':
        return 'Offline';
      case 'idle':
        if (!lastSyncedAt) return '';
        const mins = Math.floor((Date.now() - lastSyncedAt.getTime()) / 60_000);
        if (mins < 1) return 'Just synced';
        return `Synced ${mins}m ago`;
    }
  };

  const dotColor = {
    idle: '#4CAF50',
    syncing: '#FF9800',
    error: '#F44336',
    offline: '#9E9E9E',
  }[status];

  const label = getLabel();
  if (!label) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: '#888',
  },
});
