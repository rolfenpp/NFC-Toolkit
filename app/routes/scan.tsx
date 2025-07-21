import { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Animated, View } from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [showData, setShowData] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isScanning]);

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

  const stopScanning = async () => {
    setIsScanning(false);
    await NfcManager.cancelTechnologyRequest();
  };

  const handleCloseData = () => {
    setShowData(false);
    setScannedData(null);
  };

  const readNfcTag = async () => {
    if (isScanning) {
      await stopScanning();
      return;
    }

    try {
      setIsScanning(true);
      setScannedData(null);
      setShowData(false);

      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      
      if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
        const ndefRecord = tag.ndefMessage[0];
        const textDecoder = new TextDecoder();
        const payload = textDecoder.decode(new Uint8Array(ndefRecord.payload));
        const data = payload.replace(/^.{3}/, '');
        
        try {
          const parsedData: EquipmentData = JSON.parse(data);
          setScannedData(parsedData);
          setShowData(true);
          stopScanning();
        } catch (parseError) {
          await stopScanning();
          Alert.alert('Error', 'Invalid data format on NFC tag');
        }
      } else {
        await stopScanning();
        Alert.alert('Error', 'No NDEF message found on tag');
      }               
    } catch (ex) {
      if (isScanning) {
        await stopScanning();
        Alert.alert('Error', 'Error reading NFC tag');
      }
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
      
      <ThemedText style={styles.instructionText}>
        {isScanning ? "Scanning for NFC tag..." : "Tap the button to scan"}
      </ThemedText>

      <TouchableOpacity 
        style={[
          styles.scanButton,
          isScanning && styles.scanningButton
        ]} 
        onPress={readNfcTag}
        activeOpacity={0.8}
      >
        {isScanning && (
          <Animated.View style={[
            styles.pulseCircle,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.3],
                outputRange: [0.7, 0]
              })
            }
          ]} />
        )}
        <MaterialCommunityIcons 
          name="nfc" 
          size={50} 
          color="#fff"
          style={[
            isScanning && {
              transform: [{ scale: 0.8 }]
            }
          ]}
        />
      </TouchableOpacity>

      {showData && scannedData && (
        <ThemedView style={styles.overlay}>
          <ThemedView style={styles.dataContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleCloseData}
            >
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>

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
              <ThemedText style={[
                styles.value,
                { color: scannedData.status === 'active' ? '#4CAF50' : '#F44336' }
              ]}>
                {scannedData.status}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    color: '#fff',
  },
  instructionText: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
  },
  scanButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF6F00',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pulseCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#fff',
  },
  scanningButton: {
    backgroundColor: '#E65100',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dataContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#fff',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#262626',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  value: {
    fontSize: 16,
    color: '#fff',
  },
});
