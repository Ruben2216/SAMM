import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Welcome: undefined;
  CrearCuenta: { rol: 'familiar' | 'adulto_mayor' };
};

const Stack = createNativeStackNavigator();