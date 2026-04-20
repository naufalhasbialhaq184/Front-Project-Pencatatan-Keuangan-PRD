import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useState } from 'react';
import { Colors } from '../../constants/Colors';
import { router } from 'expo-router';

export default function Index() {
  const [nominal, setNominal] = useState('');


  // const handleNominal = (nominal) => {
  //   let harga = Number(temp)
  //   harga = harga + setNominal(nominal)
  //   temp = harga.toString()
  //   return temp;
  // }

  const nominalButtons = [
    { label: '10 K', value: '10000' },
    { label: '20 K', value: '20000' },
    { label: '30 K', value: '30000' },
    { label: '40 K', value: '40000' },
    { label: '50 K', value: '50000' },
    { label: '60 K', value: '60000' },
    { label: '70 K', value: '70000' },
    { label: '80 K', value: '80000' },
    { label: '90 K', value: '90000' },
    { label: '100 K', value: '100000' },
    { label: '150 K', value: '150000' },
    { label: '200 K', value: '200000' },
  ];

  return (
    <View style={styles.container} animated={'fade'}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>STEIWealth</Text>
        <Image style={styles.logo} source={require('../../assets/images/steiwealth.png')}></Image>
      </View>
      <View>
        <Text style={styles.addExpense}>Add Expense</Text>
        <Text style={styles.EnterAmount}>Enter Amount</Text>
      </View>

      <View style={styles.containerInput}>
        <Text style={styles.amountLabel}>AMOUNT (IDR)</Text>

        <View style={styles.inputBorder}>
          <Text style={styles.currencyText}>Rp</Text>
          <TextInput
            placeholder="0"
            placeholderTextColor="#cbd5e1"
            keyboardType="numeric"
            value={nominal}
            onChangeText={setNominal}
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
              // setNominal(item.value)
              router.push({ pathname: '/category', params: { amount: item.value } });
              setNominal("")
            }
          }
          >
            <Text style={styles.buttonNominalText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
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
  addExpense: {
    fontSize: 20,
    fontWeight: 'light',
    color: '#fff',
    marginTop: 24,
  },
  EnterAmount: {
    fontSize: 10,
    fontWeight: 'light',
    color: '#fff',
    marginTop: 5,
  },

  containerInput: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    marginTop: 30,
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
