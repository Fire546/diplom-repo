import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import uuid from 'react-native-uuid';


export default function QRScreen({ route, navigation }) {
  const { token, gsm, quantity } = route.params;
  const qr_id = uuid.v4();
  


  const data = {
    token,
    gsm,
    quantity,
    qr_id: qr_id
  };

  const jsonData = JSON.stringify(data, null, 2); // для отображения красиво

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ваш QR-код</Text>
      {/* <Text style={styles.title}>{JSON.stringify(data)}</Text> */}

      <View style={styles.qrWrapper}>
        <QRCode
            value={JSON.stringify(data)}
            size={200}
            backgroundColor="#fff"
            color="#000"
        />
        </View>



      

      <View style={{ marginTop: 20 }}>
        <Button title="Назад" onPress={() => navigation.goBack()} color="#555" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    qrWrapper: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#B22222', // красная рамка для стиля 😎
    alignItems: 'center',
    justifyContent: 'center',
    },
  container: {
    backgroundColor: '#111',
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center'
  },
  jsonLabel: {
    marginTop: 30,
    color: '#ccc',
    fontSize: 16
  },
  jsonBlock: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    width: '100%',
    fontFamily: 'monospace'
  }
});
