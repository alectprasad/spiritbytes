// app/utils/PreferencesDebug.ts
// Include this file temporarily for debugging food preferences issues

import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  DIET_PREFERENCES: 'spiritbytes_diet_preferences',
  ALLERGENS: 'spiritbytes_allergens'
};

export async function logAllStorageKeys() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('All AsyncStorage keys:', keys);
    return keys;
  } catch (error) {
    console.error('Error getting AsyncStorage keys:', error);
    return [];
  }
}

export async function logPreferenceValues() {
  try {
    const diets = await AsyncStorage.getItem(STORAGE_KEYS.DIET_PREFERENCES);
    const allergens = await AsyncStorage.getItem(STORAGE_KEYS.ALLERGENS);
    
    console.log('Current preference values in storage:');
    console.log('- Diet preferences:', diets);
    console.log('- Allergens:', allergens);
    
    return { diets, allergens };
  } catch (error) {
    console.error('Error reading preferences:', error);
    return { diets: null, allergens: null };
  }
}

export async function clearPreferences() {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.DIET_PREFERENCES,
      STORAGE_KEYS.ALLERGENS
    ]);
    console.log('Cleared preference storage');
  } catch (error) {
    console.error('Error clearing preferences:', error);
  }
}

// Usage in a component:
// 
// import { logAllStorageKeys, logPreferenceValues, clearPreferences } from '@/app/utils/PreferencesDebug';
//
// // In component:
// useEffect(() => {
//   const debugStorage = async () => {
//     await logAllStorageKeys();
//     await logPreferenceValues();
//     // Uncomment to reset if needed:
//     // await clearPreferences();
//   };
//   debugStorage();
// }, []);