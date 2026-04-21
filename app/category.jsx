import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native'
import React, { useState } from 'react'
import { localDb } from '../database/localDb'
import { SafeAreaView } from 'react-native-safe-area-context'


import { Colors } from '../constants/Colors'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'


const category = () => {
    const { amount } = useLocalSearchParams()
    const [modalVisible, setModalVisible] = useState(false)
    const [keterangan, setKeterangan] = useState("")
    const [kategori, setKategori] = useState("")

    const formattedAmount = amount ? Number(amount).toLocaleString('id-ID') : '0';

    const cattegory = [
        { label: "Food", value: require("../assets/images/category/foods.png") },
        { label: "Transport", value: require("../assets/images/category/transport.png") },
        { label: "Utilities", value: require("../assets/images/category/utilities.png") },
        { label: "Entertainment", value: require("../assets/images/category/entertainment.png") },
        { label: "Health", value: require("../assets/images/category/health.png") },
        { label: "Shopping", value: require("../assets/images/category/shopping.png") },
        { label: "Education", value: require("../assets/images/category/education.png") },
        { label: "Technology", value: require("../assets/images/category/technology.png") },
        { label: "Gift", value: require("../assets/images/category/gift.png") },
        { label: "Housing", value: require("../assets/images/category/housing.png") },
        { label: "Other", value: require("../assets/images/category/other.png") },
    ]
    // const handleSubmitOn = async () => {
    //     try {
    //         await fetch("https://backend-catat-uang-production-3128.up.railway.app/pengeluaran", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 Nominal: parseInt(amount),
    //                 Keterangan: keterangan,
    //                 Kategori: kategori,
    //             }),
    //         });

    //         Alert.alert("Success", "Expense added successfully");
    //         router.back();
    //     } catch (error) {
    //         console.log(error.message);
    //     }

    // }

    const handleSubmitLocal = async () => {
        try {
            await localDb.runAsync('INSERT INTO pengeluaran (Nominal, Kategori, Keterangan) VALUES (?, ?, ?)', Number(amount), kategori, keterangan)
            Alert.alert("Success", "Expense added successfully");
            router.back();
        } catch (error) {
            console.log(error.message)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Masukkan Keterangan</Text>
                        <Text style={styles.modalSubtitle}>opsional: tambahkan catatan untuk pengeluaran ini, lanjutkan jika tidak ada</Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder='Tulis keterangan...'
                            placeholderTextColor="#a3a9b5"
                            value={keterangan}
                            onChangeText={setKeterangan}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    setKeterangan("");
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Batal</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={() => {
                                    setModalVisible(false)

                                    // handleSubmitOn()
                                    handleSubmitLocal()
                                    setKategori("")
                                    setKeterangan("")


                                }}
                            >
                                <Text style={styles.submitButtonText}>Lanjutkan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <View style={styles.container}>

                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.amountCard}>
                        <Text style={styles.amountLabel}>Amount</Text>
                        <Text style={styles.amountValue}>Rp {formattedAmount}</Text>
                    </View>

                </View>

                <Text style={styles.title}>Select Category</Text>
                <Text style={styles.subtitle}>Choose where this expense belongs</Text>

                <ScrollView contentContainerStyle={styles.containerCategory}>
                    {cattegory.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.categoryBox}
                            onPress={() => {

                                setModalVisible(true);
                                setKategori(item.label);
                            }
                            }
                        >
                            <Image source={item.value} style={styles.categoryImg} resizeMode="contain" />
                            <Text style={styles.categoryText}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

            </View >
        </SafeAreaView>
    )
}

export default category

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    amountCard: {
        backgroundColor: '#2b3345',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#3a4457',
    },
    amountLabel: {
        color: '#a3a9b5',
        fontSize: 13,
        marginBottom: 4,
    },
    amountValue: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 36,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#cbd5e1',
        marginBottom: 32,
    },
    containerCategory: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryBox: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 28,
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryImg: {
        width: 72,
        height: 72,
        marginBottom: 16,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#2b3345',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3a4457',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#cbd5e1',
        marginBottom: 24,
        textAlign: 'center',
    },
    textInput: {
        width: '100%',
        backgroundColor: '#1f2533',
        color: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#3a4457',
        marginBottom: 28,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#3a4457',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#cbd5e1',
        fontWeight: '600',
        fontSize: 16,
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    }
})