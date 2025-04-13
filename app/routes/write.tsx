import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, TextInput, Alert } from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface EquipmentData {
  equipmentId: string;
  name: string;
  time: string;
  status: string;
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const generateEquipmentData = (name: string, preserveOtherFields = false, previousData: EquipmentData | null = null): EquipmentData => {
  const equipmentId = preserveOtherFields && previousData ? previousData.equipmentId : Math.floor(Math.random() * 1000) + 1;
  const currentDate = preserveOtherFields && previousData ? previousData.time : formatDate(new Date());
  
  return {
    equipmentId: equipmentId.toString(),
    name: name,
    time: currentDate,
    status: "active"
  };
};

export default function WriteNFCScreen() {
  const [isNfcEnabled, setIsNfcEnabled] = useState(false);
  const [jsonData, setJsonData] = useState(generateEquipmentData(""));
  const [isWriting, setIsWriting] = useState(false);
  const [equipmentName, setEquipmentName] = useState("");

  useEffect(() => {
    const checkNfc = async () => {
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
        setIsNfcEnabled(true);
      } else {
        Alert.alert('Error', 'NFC is not supported on this device');
      }
    };

    checkNfc();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => { /* do nothing */ });
    };
  }, []);

  const updateJsonData = (name: string) => {
    setJsonData(prevData => ({
      ...prevData,
      name: name
    }));
  };

  const writeNfc = async () => {
    if (!equipmentName.trim()) {
      Alert.alert('Error', 'Please enter an equipment name');
      return;
    }

    try {
      const writeData = generateEquipmentData(equipmentName);
      setJsonData(writeData);
      setIsWriting(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(JSON.stringify(writeData))
      ]);

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        Alert.alert('Success', 'Data written to NFC tag successfully!');
      }
    } catch (err: unknown) {
      let message = 'An error occurred';
      if (err instanceof SyntaxError) {
        message = 'Invalid JSON format';
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      Alert.alert('Error', message);
    } finally {
      setIsWriting(false);
      NfcManager.cancelTechnologyRequest().catch(() => { /* do nothing */ });
    }
  };

  const resetForm = () => {
    setEquipmentName("");
    setJsonData(generateEquipmentData(""));
  };

  if (!isNfcEnabled) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>NFC is not available on this device</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Write NFC Tag</ThemedText>
      
      <ThemedText style={styles.label}>Equipment Name:</ThemedText>
      <TextInput
        style={[styles.nameInput, { color: '#FFFFFF' }]}
        value={equipmentName}
        onChangeText={(text) => {
          setEquipmentName(text);
          updateJsonData(text);
        }}
        placeholder="Enter equipment name"
        placeholderTextColor="#999999"
      />

      <ThemedText style={styles.label}>Generated JSON Data:</ThemedText>
      <TextInput
        style={[styles.input, { color: '#FFA500' }]}
        multiline
        numberOfLines={8}
        value={JSON.stringify(jsonData, null, 2)}
        editable={false}
      />
      
      <ThemedView style={styles.buttonContainer}>
        <Button
          title="Reset"
          onPress={resetForm}
          disabled={isWriting}
        />
        <Button
          title={isWriting ? "Waiting for NFC tag..." : "Write to NFC Tag"}
          onPress={writeNfc}
          disabled={isWriting || !equipmentName.trim()}
        />
      </ThemedView>
      
      {isWriting && (
        <ThemedText style={styles.instructions}>
          Please hold an NFC tag close to your device
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  nameInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  instructions: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
});