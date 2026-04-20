import React, { useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { localDb } from '../database/localDb';


export default function SQLiteInspector() {
    const [data, setData] = useState([]);

    const refreshData = () => {
        try {
            const result = localDb.getAllSync('SELECT * FROM pengeluaran');
            setData(result);
        } catch (error) {
            console.error("Gagal baca DB:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="🔄 Refresh & Cek Data SQLite" onPress={refreshData} color="#4CAF50" />
            {/* <Button title="reset" onPress={() => {
                localDb.execSync('DROP TABLE IF EXISTS pengeluaran;');
                Alert.alert("Success", "Database reset successfully Restart apk")
            }}></Button> */}



            <ScrollView style={styles.scroll}>
                {data.length === 0 ? (
                    <Text style={styles.empty}>Database Kosong atau Belum di-Refresh</Text>
                ) : (
                    data.map((item, index) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.id}>ID: {item.ID} | {item.Kategori}</Text>
                            <Text style={styles.nominal}>Rp - {item.Nominal?.toLocaleString('id-ID')}</Text>
                            <Text style={styles.ket}>{item.Keterangan}</Text>
                        </View>
                    ))
                )}
            </ScrollView>


        </View>
    )
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#f5f5f5', flex: 1 },
    scroll: { marginTop: 15 },
    empty: { textAlign: 'center', marginTop: 20, color: '#888' },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
    id: { fontSize: 12, color: '#666', fontWeight: 'bold' },
    nominal: { fontSize: 18, fontWeight: 'bold', color: '#cc312eff' },
    ket: { fontSize: 14, color: '#333' },
    sync: { fontSize: 12, marginTop: 5 }
});