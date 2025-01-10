import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Switch,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Écran principal pour gérer les lampes
const MemoSwitchApp = ({ navigation }) => {
  const [lamps, setLamps] = useState([
    { id: '1', name: 'Lampe 1', state: false, duration: 0, startTime: null },
  ]);
  const [newLampName, setNewLampName] = useState('');
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    const loadLamps = async () => {
      try {
        const savedLamps = await AsyncStorage.getItem('lamps');
        const savedLog = await AsyncStorage.getItem('activityLog');
        if (savedLamps) setLamps(JSON.parse(savedLamps));
        if (savedLog) setActivityLog(JSON.parse(savedLog));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadLamps();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('lamps', JSON.stringify(lamps));
        await AsyncStorage.setItem('activityLog', JSON.stringify(activityLog));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    saveData();
  }, [lamps, activityLog]);

  const toggleLamp = (id) => {
    setLamps((prevLamps) =>
      prevLamps.map((lamp) => {
        if (lamp.id === id) {
          const newState = !lamp.state;
          const currentTime = Date.now();

          if (newState) {
            setActivityLog((prevLog) => [
              ...prevLog,
              { lamp: lamp.name, action: 'ON', timestamp: new Date().toLocaleString() },
            ]);
            return { ...lamp, state: newState, startTime: currentTime };
          } else {
            const elapsedTime = lamp.startTime ? (currentTime - lamp.startTime) / 1000 / 60 : 0; // in minutes
            setActivityLog((prevLog) => [
              ...prevLog,
              { lamp: lamp.name, action: 'OFF', timestamp: new Date().toLocaleString() },
            ]);
            return { ...lamp, state: newState, duration: lamp.duration + elapsedTime, startTime: null };
          }
        }
        return lamp;
      })
    );
  };

  const addLamp = () => {
    if (newLampName.trim()) {
      setLamps((prevLamps) => [
        ...prevLamps,
        {
          id: (prevLamps.length + 1).toString(),
          name: newLampName,
          state: false,
          duration: 0,
          startTime: null,
        },
      ]);
      setNewLampName('');
    }
  };

  const deleteLamp = (id) => {
    setLamps((prevLamps) => prevLamps.filter((lamp) => lamp.id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.lampRow}>
      <Text style={styles.lampName}>{item.name}</Text>
      <Switch
        value={item.state}
        onValueChange={() => toggleLamp(item.id)}
        thumbColor={item.state ? '#28A745' : '#ccc'}
      />
      <Text style={styles.lampDuration}>{item.duration.toFixed(2)} min</Text>
      <TouchableOpacity onPress={() => deleteLamp(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Memo Switch</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom de la nouvelle lampe"
        placeholderTextColor="#ccc"
        value={newLampName}
        onChangeText={setNewLampName}
      />
      <TouchableOpacity style={styles.addButton} onPress={addLamp}>
        <Text style={styles.addButtonText}>Ajouter Lampe</Text>
      </TouchableOpacity>
      <FlatList
        data={lamps}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('History', { activityLog, setActivityLog })}
      >
        <Text style={styles.historyButtonText}>Voir Historique</Text>
      </TouchableOpacity>
    </View>
  );
};

// Écran Historique pour afficher les actions des lampes
const HistoryScreen = ({ route }) => {
  const { activityLog, setActivityLog } = route.params;
  const [log, setLog] = useState(activityLog);

  useEffect(() => {
    setLog(activityLog);
  }, [activityLog]);

  const clearHistory = async () => {
    try {
      // Vider l'historique en réinitialisant le tableau
      setLog([]);
      // Enregistrer l'historique vide dans AsyncStorage
      await AsyncStorage.setItem('activityLog', JSON.stringify([]));
      // Mettre à jour le log d'activité dans MemoSwitchApp
      setActivityLog([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historique</Text>
      <FlatList
        data={log}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text style={styles.historyText}>
              {item.timestamp} - {item.lamp} {item.action}
            </Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
        <Text style={styles.clearButtonText}>Effacer tout l'historique</Text>
      </TouchableOpacity>
    </View>
  );
};

// Configuration de la pile de navigation
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MemoSwitch">
        <Stack.Screen name="MemoSwitch" component={MemoSwitchApp} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002A37',
    padding: 20,
  },
  header: {
    color: '#fff',
    fontSize: 45,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    top: 25,
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
  deleteButton: {
    backgroundColor: '#FF6B6B',
    padding: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
  },
  input: {
    backgroundColor: '#004D5B',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 80,
    top:-25,
  },
  addButton: {
    backgroundColor: '#007ACC',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 30,
    top:-45,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  historyButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  historyItem: {
    backgroundColor: '#003B46',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  historyText: {
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  clearButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default App;
