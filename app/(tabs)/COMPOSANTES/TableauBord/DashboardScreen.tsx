// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MemoSwitchApp() {
  const [lamps, setLamps] = useState([
    { id: '1', name: 'Lampe 1', state: false, duration: 0, startTime: null },
    { id: '2', name: 'Lampe 2', state: false, duration: 0, startTime: null },
    { id: '3', name: 'Lampe 3', state: false, duration: 0, startTime: null },
    { id: '4', name: 'Lampe 4', state: false, duration: 0, startTime: null },
    { id: '5', name: 'Lampe 5', state: false, duration: 0, startTime: null },
    { id: '6', name: 'Lampe 6', state: false, duration: 0, startTime: null },
  ]);

  // Load saved data from storage
  useEffect(() => {
    const loadLamps = async () => {
      try {
        const savedLamps = await AsyncStorage.getItem('lamps');
        if (savedLamps) {
          setLamps(JSON.parse(savedLamps));
        }
      } catch (error) {
        console.error('Error loading lamp data:', error);
      }
    };
    loadLamps();
  }, []);

  // Save data to storage
  useEffect(() => {
    const saveLamps = async () => {
      try {
        await AsyncStorage.setItem('lamps', JSON.stringify(lamps));
      } catch (error) {
        console.error('Error saving lamp data:', error);
      }
    };
    saveLamps();
  }, [lamps]);

  // Toggle lamp state
  const toggleLamp = (id) => {
    setLamps((prevLamps) =>
      prevLamps.map((lamp) => {
        if (lamp.id === id) {
          const newState = !lamp.state;
          const currentTime = Date.now();

          if (newState) {
            // Turning ON
            return { ...lamp, state: newState, startTime: currentTime };
          } else {
            // Turning OFF
            const elapsedTime = lamp.startTime ? (currentTime - lamp.startTime) / 1000 / 60 : 0; // in minutes
            return { ...lamp, state: newState, duration: lamp.duration + elapsedTime, startTime: null };
          }
        }
        return lamp;
      })
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.lampRow}>
      <Text style={styles.lampName}>{item.name}</Text>
      <Switch
        value={item.state}
        onValueChange={() => toggleLamp(item.id)}
        thumbColor={item.state ? '#007ACC' : '#ccc'}
      />
      <Text style={styles.lampDuration}>{item.duration.toFixed(2)} min</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Memo Switch</Text>
      <FlatList
        data={lamps}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002A37',
    padding: 20,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  lampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#004D5B',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  lampName: {
    color: '#fff',
    fontSize: 18,
  },
  lampDuration: {
    color: '#fff',
    fontSize: 16,
  },
});
