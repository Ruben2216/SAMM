export type UserRole = 'familiar' | 'senior' | null;

export interface WelcomeScreenState {
  selectedRole: UserRole;
}
