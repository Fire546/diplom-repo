import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


const BASE_URL = 'http://172.28.0.156:8000/api/v1/';

export default function ProfileScreen({ navigation }) {
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState(null);
  const [gsm, setGsm] = useState('92');
  const [quantity, setQuantity] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'АИ-92', value: '92' },
    { label: 'АИ-95', value: '95' },
    { label: 'Дизель', value: 'dt' },
  ]);

  

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) {
          navigation.replace('Login');
          return;
        }
        setToken(storedToken);
  
        try {
          const response = await fetch(BASE_URL + 'use_tickets', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
  
          if (response.status === 200) {
            const data = await response.json();
            setUserData(data);
          } else {
            Alert.alert('Ошибка', 'Не удалось загрузить данные');
          }
        } catch (err) {
          Alert.alert('Ошибка', 'Ошибка подключения к серверу');
          console.log(err);
        }
      };
  
      fetchData();
    }, []) // пустой массив зависимостей — сработает каждый раз при фокусе
  );

  const handleConfirm = () => {
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      Alert.alert('Ошибка', 'Введите корректное количество');
      return;
    }

    const available = parseInt(userData?.[gsm] || 0);
    if (parseInt(quantity) > available) {
      Alert.alert('Ошибка', `У вас только ${available} талонов на ${gsm}`);
      return;
    }

    navigation.navigate('QR', {
      token,
      gsm: gsm,
      quantity: parseInt(quantity)
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  if (!userData) {
    return <View style={styles.container}><Text style={styles.text}>Загрузка...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.userName}>Добро пожаловать,</Text>
        <Text style={styles.userBold}>{userData.user}</Text>

        <View style={styles.fuelInfo}>
          <Text style={styles.fuelRow}>⛽ АИ-92: <Text style={styles.fuelAmount}>{userData['92']}</Text></Text>
          <Text style={styles.fuelRow}>⛽ АИ-95: <Text style={styles.fuelAmount}>{userData['95']}</Text></Text>
          <Text style={styles.fuelRow}>⛽ Дизельное топливо: <Text style={styles.fuelAmount}>{userData['dt']}</Text></Text>
        </View>
      </View>

      <DropDownPicker
        open={open}
        value={gsm}
        items={items}
        setOpen={setOpen}
        setValue={setGsm}
        setItems={setItems}
        style={styles.dropdown}
        textStyle={{ color: '#fff' }}
        dropDownContainerStyle={{ backgroundColor: '#222' }}
        placeholder="Выберите топливо"
        listMode="SCROLLVIEW"
      />

      <TextInput
        placeholder="Количество"
        placeholderTextColor="#ccc"
        returnKeyType="done"
        style={styles.input}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Button title="Подтвердить" onPress={handleConfirm} color="#B22222" />
      <View style={{ marginTop: 20 }}>
        <Button title="Выйти" onPress={handleLogout} color="#555" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 24,
    justifyContent: 'center',
    zIndexInverse: 500,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    zIndexInverse: 500,
  },
  text: {
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
    zIndexInverse: 500,
  },
  picker: {
    backgroundColor: '#222',
    color: '#fff',
    marginBottom: 16,
    zIndexInverse: 500,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    zIndexInverse: 500,
  },
  dropdown: {
    backgroundColor: '#333',
    borderColor: '#555',
    marginBottom: 16,
    zIndex: 1000, // важно, чтобы не перекрывался другими элементами
  },
  profileCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#B22222',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  userName: {
    color: '#ccc',
    fontSize: 18,
    textAlign: 'center',
  },
  userBold: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  fuelInfo: {
    marginTop: 10,
  },
  fuelRow: {
    color: '#ccc',
    fontSize: 16,
    marginVertical: 4,
  },
  fuelAmount: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
