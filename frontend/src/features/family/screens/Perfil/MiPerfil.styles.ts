import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  save: {
    color: '#22c55e',
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fde2e2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },

  name: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },

  email: {
    textAlign: 'center',
    color: '#64748B',
  },

  badge: {
    alignSelf: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },

  badgeText: {
    color: '#fff',
  },

  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  nameSmall: {
    fontWeight: '600',
  },

  subText: {
    color: '#64748B',
  },

  principal: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  add: {
    textAlign: 'center',
    color: '#22c55e',
    marginTop: 8,
    fontWeight: '600',
  },

  link: {
    color: '#3b82f6',
    marginTop: 8,
  },

  logout: {
    color: '#ef4444',
    marginTop: 8,
  },

  footer: {
    alignItems: 'center',
    marginVertical: 20,
  },
});