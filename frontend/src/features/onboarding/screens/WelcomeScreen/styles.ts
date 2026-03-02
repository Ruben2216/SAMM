import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  headerSection: {
    marginBottom: 30,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    lineHeight: 21,
    color: '#555',
  },

  cardsContainer: {
    gap: 30,
    marginBottom: 50,
    overflow: 'visible',
  },

  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 40,
  },
});
