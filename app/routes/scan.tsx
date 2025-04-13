import { useState, useEffect } from 'react';
import { StyleSheet, Button, Alert } from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface EquipmentData {
  equipmentId: string;
  name: string;
  time: string;
  status: string;
}

export default function ScanScreen() {
  const [isNfcSupported, setIsNfcSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<EquipmentData | null>(null);

  useEffect(() => {
    const checkNfc = async () => {
      const supported = await NfcManager.isSupported();
      setIsNfcSupported(supported);
      if (supported) {
        await NfcManager.start();
      }
    };
    checkNfc();
  }, []);

  const readNfcTag = async () => {
    try {
      setIsScanning(true);
      setScannedData(null); // Reset previous data
      
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      
      if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
        // Get the first NDEF record
        const ndefRecord = tag.ndefMessage[0];
        
        // Decode the payload
        const textDecoder = new TextDecoder();
        const payload = textDecoder.decode(new Uint8Array(ndefRecord.payload));
        
        // Remove language code prefix (en) if present
        const data = payload.replace(/^.{3}/, '');
        
        try {
          const parsedData: EquipmentData = JSON.parse(data);
          setScannedData(parsedData);
        } catch (parseError) {
          Alert.alert('Error', 'Invalid data format on NFC tag');
        }
      } else {
        Alert.alert('Error', 'No NDEF message found on tag');
      }
    } catch (ex) {
      Alert.alert('Error', 'Error reading NFC tag');
    } finally {
      setIsScanning(false);
      NfcManager.cancelTechnologyRequest().catch(() => {/* ignore */});
    }
  };

  if (!isNfcSupported) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>NFC is not supported on this device</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>NFC Scanner</ThemedText>
      
      <Button 
        title={isScanning ? "Scanning..." : "Scan NFC Tag"} 
        onPress={readNfcTag}
        disabled={isScanning}
      />

      {scannedData && (
        <ThemedView style={styles.dataContainer}>
          <ThemedText style={styles.dataTitle}>Equipment Details:</ThemedText>
          
          <ThemedView style={styles.dataRow}>
            <ThemedText style={styles.label}>ID:</ThemedText>
            <ThemedText style={styles.value}>{scannedData.equipmentId}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.dataRow}>
            <ThemedText style={styles.label}>Name:</ThemedText>
            <ThemedText style={styles.value}>{scannedData.name}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.dataRow}>
            <ThemedText style={styles.label}>Time:</ThemedText>
            <ThemedText style={styles.value}>{scannedData.time}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.dataRow}>
            <ThemedText style={styles.label}>Status:</ThemedText>
            <ThemedText style={[styles.value, { color: scannedData.status === 'active' ? '#4CAF50' : '#F44336' }]}>
              {scannedData.status}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dataContainer: {
    width: '100%',
    marginTop: 30,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#666',
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
  },
});