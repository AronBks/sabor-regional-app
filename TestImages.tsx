// Prueba de imágenes locales
import React from 'react';
import { View, Image, Text, ScrollView, StyleSheet } from 'react-native';
import { IMAGENES_RECETAS } from './assets/images';

const TestImages = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Prueba de Imágenes Locales</Text>
      {Object.entries(IMAGENES_RECETAS).map(([id, imagen]) => (
        <View key={id} style={styles.imageContainer}>
          <Text style={styles.imageId}>Receta ID: {id}</Text>
          <Image 
            source={imagen}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imageId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
});

export default TestImages;
