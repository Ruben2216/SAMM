import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },

  stepLabel: {
    textAlign: 'right',
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },

  progressTrack: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },

  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
});
