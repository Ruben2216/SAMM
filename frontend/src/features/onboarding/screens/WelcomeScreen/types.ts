export type UserRole = 'familiar' | 'adulto_mayor' | null;

export interface WelcomeScreenState {
  selectedRole: UserRole;
}
