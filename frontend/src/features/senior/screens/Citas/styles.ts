import { StyleSheet } from 'react-native';

export const themeColors = {
  primary: '#10B981',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#64748B',
  border: '#E2E8F0',
};

export const citasStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: themeColors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: themeColors.text,
  },
  headerRightButton: {
    position: 'absolute',
    right: 16,
    top: 15,
    zIndex: 1,
    padding: 5,
  },
  listContainer: {
    padding: 16,
  },
});