import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function Index() {
  const [nominal, setNominal] = useState("");


  const formatRupiah = (angka) => {
    if (!angka) return "";
    const numberString = angka.toString().replace(/[^0-9]/g, '');
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const nominalButtons = [
    { label: '1', value: '1' },
    { label: '5', value: '5' },
    { label: '10', value: '10' },
    { label: '100', value: '100' },
    { label: '1.000', value: '1000' },
    { label: '5.000', value: '5000' },
    { label: '10.000', value: '10000' },
    { label: '50.000', value: '50000' },
    { label: '100.000', value: '100000' },
  ];

  return (
    <LinearGradient
      colors={['#131d32', '#1e40af']} // Top primary navy to bottom sapphire blue (reversed!)
      style={styles.gradientContainer}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.container} animated={'fade'}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>STEIWealth</Text>
          <Image style={styles.logo} source={require('../../assets/images/steiwealth.png')}></Image>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.addExpense}>Add Expense</Text>
        </View>

        <View style={styles.containerInput}>
          <Text style={styles.amountLabel}>AMOUNT (IDR)</Text>

          <View style={styles.inputBorder}>
            <Text style={styles.currencyText}>Rp</Text>
            <TextInput
              placeholder="0"
              placeholderTextColor="#cbd5e1"
              keyboardType="numeric"
              value={formatRupiah(nominal)}
              onChangeText={(text) => {
                const rawValue = text.replace(/[^0-9]/g, '');
                setNominal(rawValue);
              }}
              style={styles.textInput}
            />

          </View>

          <TouchableOpacity
            style={[styles.continueBtn, nominal.length === 0 && styles.continueBtnDisabled]}
            disabled={nominal.length === 0}
            onPress={() => {
              router.push({ pathname: '/category', params: { amount: nominal } });
              setNominal('');
            }}
          >
            <Text style={styles.continueText}>Continue  →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.containerNominal} >
          {nominalButtons.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.buttonNominalItem}
              onPress={() => {
                setNominal(prev => {
                  const NominalSekarang = Number(prev) || 0;
                  return (NominalSekarang + Number(item.value)).toString()
                })
              }
              }
            >
              <Text style={styles.buttonNominalText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ width: '100%', alignItems: 'center' }}>
            <TouchableOpacity style={{ backgroundColor: "white", width: '31%', justifyContent: 'center', alignItems: 'center', borderRadius: 16, paddingVertical: 16, marginBottom: 12, }}
              onPress={() => setNominal("")}
            ><Text style={{ fontWeight: 'bold' }}>Reset</Text></TouchableOpacity>
          </View>
        </View>

      </SafeAreaView >
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTextContainer: {
    marginTop: 24,
  },
  addExpense: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  EnterAmount: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },

  containerInput: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    marginTop: 12,
  },
  amountLabel: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  currencyText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d1d5db',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    padding: 0,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    opacity: 0.8,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerNominal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  buttonNominalItem: {
    width: '31%',
    backgroundColor: '#252e42',
    borderWidth: 1,
    borderColor: '#394255',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonNominalText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
