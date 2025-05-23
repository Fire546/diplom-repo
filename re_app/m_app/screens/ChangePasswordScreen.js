import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config.js';

// const BASE_URL = 'http://192.168.1.101:8000/api/v1/';

export default function ChangePasswordScreen({ navigation }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleChangePassword = async () => {
    const token = await AsyncStorage.getItem('token');

    if (!oldPass || !newPass) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    try {
      const resp = await fetch(BASE_URL + 'change_pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_pass: oldPass,
          new_pass: newPass
        })
      });

      const data = await resp.json();

      if (data.success) {
        Alert.alert('Успех', 'Пароль успешно изменен', [
          {
            text: 'OK',
            onPress: () => navigation.replace('Profile')
          }
        ]);
      } else {
        Alert.alert('Ошибка', data.error || 'Не удалось изменить пароль');
      }
    } catch (err) {
      Alert.alert('Ошибка', 'Ошибка подключения к серверу');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Смена пароля</Text>
      <TextInput
        placeholder="Старый пароль"
        placeholderTextColor="#ccc"
        style={styles.input}
        secureTextEntry
        value={oldPass}
        onChangeText={setOldPass}
      />
      <TextInput
        placeholder="Новый пароль"
        placeholderTextColor="#ccc"
        style={styles.input}
        secureTextEntry
        value={newPass}
        onChangeText={setNewPass}
      />
      <Button title="Сменить пароль" onPress={handleChangePassword} color="#B22222" />
      <View style={{ marginTop: 20 }}>
        <Button title="Назад" onPress={() => navigation.goBack()} color="#555" />
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
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
});
