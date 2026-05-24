import React, { useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { localDb } from '../database/localDb';


export default function SQLiteInspector() {
    const [data, setData] = useState([]);
    
    const [nominal, setNominal] = useState('');
    const [kategori, setKategori] = useState('Food');
    const [keterangan, setKeterangan] = useState('Data Injeksi');
    const now = new Date();
    let prevMonth = now.getMonth(); // 0-11
    let prevYear = now.getFullYear();
    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
    }
    const defaultDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-15 10:00:00`;
    
    const [tanggal, setTanggal] = useState(defaultDate); // YYYY-MM-DD HH:MM:SS

    const refreshData = () => {
        try {
            const result = localDb.getAllSync('SELECT * FROM pengeluaran ORDER BY created_at DESC');
            setData(result);
        } catch (error) {
            console.error("Gagal baca DB:", error);
        }
    };

    const handleInject = () => {
        if (!nominal || !kategori || !tanggal) {
            Alert.alert("Error", "Nominal, Kategori, dan Tanggal harus diisi!");
            return;
        }
        try {
            localDb.runSync(
                'INSERT INTO pengeluaran (Nominal, Kategori, Keterangan, created_at) VALUES (?, ?, ?, ?)',
                Number(nominal), kategori, keterangan, tanggal
            );
            Alert.alert("Sukses", "Data berhasil diinjeksi");
            refreshData();
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    const handleReset = () => {
        Alert.alert(
            "Konfirmasi Reset",
            "Yakin ingin menghapus semua data (pengeluaran, budget bulanan, budget kategori)?",
            [
                { text: "Batal", style: "cancel" },
                { text: "Reset", onPress: () => {
                    try {
                        localDb.execSync(`
                            DROP TABLE IF EXISTS pengeluaran;
                            DROP TABLE IF EXISTS budget_monthly;
                            DROP TABLE IF EXISTS budget_category;
                        `);
                        Alert.alert("Success", "Semua tabel berhasil direset. Silakan restart aplikasi/reload.");
                        setData([]);
                    } catch (error) {
                        Alert.alert("Error", error.message);
                    }
                }, style: "destructive" }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>Injeksi Data Pengeluaran</Text>
            <TextInput style={styles.input} placeholder="Nominal (Cth: 50000)" value={nominal} onChangeText={setNominal} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Kategori (Cth: Food, Transport)" value={kategori} onChangeText={setKategori} />
            <TextInput style={styles.input} placeholder="Keterangan" value={keterangan} onChangeText={setKeterangan} />
            <TextInput style={styles.input} placeholder="Tanggal (YYYY-MM-DD HH:MM:SS)" value={tanggal} onChangeText={setTanggal} />
            
            <View style={{ marginBottom: 20 }}>
                <Button title="Injeksi Data" onPress={handleInject} color="#2196F3" />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                <Button title="Refresh Data" onPress={refreshData} color="#4CAF50" />
                <Button title="Reset Semua" onPress={handleReset} color="#F44336" />
            </View>

            <Text style={{fontWeight: 'bold'}}>Data Pengeluaran (Terbaru di atas):</Text>

            <View style={styles.scroll}>
                {data.length === 0 ? (
                    <Text style={styles.empty}>Database Kosong atau Belum di-Refresh</Text>
                ) : (
                    data.map((item, index) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.id}>ID: {item.ID} | {item.Kategori} | {item.created_at}</Text>
                            <Text style={styles.nominal}>Rp {item.Nominal?.toLocaleString('id-ID')}</Text>
                            <Text style={styles.ket}>{item.Keterangan}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#f5f5f5', flex: 1 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 8 },
    scroll: { marginTop: 15 },
    empty: { textAlign: 'center', marginTop: 20, color: '#888' },
    card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 3 },
    id: { fontSize: 12, color: '#666', fontWeight: 'bold' },
    nominal: { fontSize: 18, fontWeight: 'bold', color: '#cc312eff' },
    ket: { fontSize: 14, color: '#333' },
    sync: { fontSize: 12, marginTop: 5 }
});