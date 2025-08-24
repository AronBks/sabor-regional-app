import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PerfilScreen from './components/PerfilScreen';

const TABS = ['inicio', 'buscar', 'camara', 'lista', 'perfil'] as const;

export default function App() {
  const [nav, setNav] = React.useState<typeof TABS[number]>('perfil');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1 }}>
        {nav === 'perfil' ? <PerfilScreen /> : (
          <View style={styles.center}>
            <Text style={{ fontSize: 22, fontWeight: '700' }}>Pantalla: {nav}</Text>
            <Text style={{ color: '#666', marginTop: 8 }}>Usa la barra inferior para cambiar de pestaña</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setNav('inicio')}>
          <MaterialIcons name="home" size={26} color={nav === 'inicio' ? '#ff6a00' : '#999'} />
          <Text style={[styles.navLabel, nav === 'inicio' && { color: '#ff6a00' }]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setNav('buscar')}>
          <MaterialIcons name="search" size={26} color={nav === 'buscar' ? '#ff6a00' : '#999'} />
          <Text style={[styles.navLabel, nav === 'buscar' && { color: '#ff6a00' }]}>Buscar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setNav('camara')}>
          <MaterialIcons name="camera-alt" size={26} color={nav === 'camara' ? '#ff6a00' : '#999'} />
          <Text style={[styles.navLabel, nav === 'camara' && { color: '#ff6a00' }]}>Cámara</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setNav('lista')}>
          <MaterialIcons name="list" size={26} color={nav === 'lista' ? '#ff6a00' : '#999'} />
          <Text style={[styles.navLabel, nav === 'lista' && { color: '#ff6a00' }]}>Lista</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setNav('perfil')}>
          <MaterialIcons name="person" size={26} color={nav === 'perfil' ? '#ff6a00' : '#999'} />
          <Text style={[styles.navLabel, nav === 'perfil' && { color: '#ff6a00' }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 12, color: '#999', marginTop: 2 },
});
