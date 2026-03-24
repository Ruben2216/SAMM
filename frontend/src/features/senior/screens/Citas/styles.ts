// Ruta: src/features/senior/screens/Citas/styles.ts
import { StyleSheet } from 'react-native';

// Colores estrictos según las reglas del proyecto
export const themeColors = {
  primary: '#14EC5C',
  background: '#F8FAFC',
  text: '#1E293B',
  error: '#EF4444',
  textMuted: '#94A3B8',
  cardBg: '#FFFFFF',
};

export const citasStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: themeColors.cardBg,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    minHeight: 80, // Accesibilidad: Área táctil amplia
  },
  cardContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    minWidth: 44, // Accesibilidad: Área táctil mínima
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
  },
  specialty: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  doctorName: {
    fontSize: 16,
    marginTop: 2,
  },
  dateTime: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 20,
    backgroundColor: themeColors.primary,
    borderRadius: 30,
    minWidth: 44,
    minHeight: 44,
  },
});