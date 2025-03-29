import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '@/app/constants/theme';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Library', icon: 'book-outline', route: '/app/library' },
    { name: 'Favorites', icon: 'heart-outline', route: '/app/favorites' },
    { name: 'Add', icon: 'add-circle', route: '/app/home' },
    { name: 'Calendar', icon: 'calendar-outline', route: '/app/calendar' },
    { name: 'Settings', icon: 'settings-outline', route: '/app/settings' },
  ];

  return (
    <View style={styles.navbar}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={() => router.push(item.route)}
        >
          <Ionicons
            name={item.name === 'Add' && pathname === '/app/home' ? 'add-circle' : item.icon}
            size={item.name === 'Add' ? 28 : 24}
            color={pathname === item.route ? COLORS.forestGreen : COLORS.darkGray}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: 10, // Add padding at the bottom
    ...SHADOWS.small,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 60,
  },
});

export default Navbar;