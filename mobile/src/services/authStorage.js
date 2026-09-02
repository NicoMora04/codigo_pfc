import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export const guardarToken = async (token) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const obtenerToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const eliminarToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};