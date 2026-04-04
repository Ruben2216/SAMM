import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export const themeColors = {
  primary: '#14EC5C', // Verde Neón SAMM
  background: '#FFFFFF', // Fondo general blanco
  cardBg: '#E8EEF2', // Fondo gris/azulado de las tarjetas y los inputs
  textDark: '#1E293B',
  text: '#1E293B',
  textGray: '#64748B',
  textMuted: '#94A3B8', // Para el historial
};

export const citasStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // <-- AÑADIDO: Centra el título
    height: 60,               // <-- AÑADIDO: Altura fija para el header
    paddingHorizontal: 16,
    backgroundColor: themeColors.background,
  },
  backButton: {
    position: 'absolute',     // <-- AÑADIDO: Fija la flecha a la izquierda sin empujar el título
    left: 16,
    padding: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.textDark,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120, // Espacio para el FAB
  },
  // --- TARJETAS ---
  card: {
    backgroundColor: themeColors.cardBg,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: themeColors.textDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBoxHistory: {
    borderColor: themeColors.textMuted,
  },
  specialtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.textDark,
  },
  doctorText: {
    fontSize: 15,
    color: themeColors.textGray,
    marginTop: 2,
  },
  dateTimeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.textDark,
    marginBottom: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: themeColors.textGray,
  },
  textHistory: {
    color: themeColors.textMuted,
  },
  // Textos apagados para el historial
  textMuted: {
    color: themeColors.textMuted,
  },
  iconBoxMuted: {
    borderColor: themeColors.textMuted, // <-- CORREGIDO: Apaga el borde del icono en el historial
  },
  // --- BOTÓN FAB Y TABS ---
  fab: {
    position: 'absolute',
    bottom: 100,           // <-- CAMBIADO: Flota sobre la barra inferior
    right: 16,            // <-- CAMBIADO: Pegado a la derecha como en tu diseño
    backgroundColor: themeColors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
  },
  fabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.textDark,
    marginLeft: 8,
  },
  bottomTabBar: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: 20,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});