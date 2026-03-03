import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';
import { globalStyles } from '../../../theme/globalStyles';

export const styles = StyleSheet.create({
  card: {
    ...globalStyles.cardShadow,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 140,
    overflow: 'visible',
  },

  cardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconImage: {
    width: 50,
    height: 50,
  },

  cardContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },

  cardDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
