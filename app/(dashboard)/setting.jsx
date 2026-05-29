import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Stack, Link, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { localDb, getDynamicGradient } from '../../database/localDb';

const Setting = () => {
  const [bgGradient, setBgGradient] = useState(['#00057aff', '#131d32']);
  const [isLoading, setIsLoading] = useState(false);
  const [debuggerVisible, setDebuggerVisible] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  // Sync background gradient color on focus
  useFocusEffect(
    useCallback(() => {
      setBgGradient(getDynamicGradient());
    }, [])
  );

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      
      const pengeluaran = localDb.getAllSync("SELECT * FROM pengeluaran");
      const budgetMonthly = localDb.getAllSync("SELECT * FROM budget_monthly");
      const budgetCategory = localDb.getAllSync("SELECT * FROM budget_category");

      const backupData = {
        version: 1,
        app: "STEIWealth",
        timestamp: new Date().toISOString(),
        pengeluaran,
        budget_monthly: budgetMonthly,
        budget_category: budgetCategory,
      };

      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const dateStr = `${day}-${month}-${year}`;
      const filename = `STEIWealth_Backup_${dateStr}.json`;

      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Simpan Backup STEIWealth Anda',
          UTI: 'public.json',
        });
      } else {
        Alert.alert("Error", "Sharing tidak tersedia di perangkat ini");
      }
    } catch (error) {
      console.error("Gagal ekspor data:", error);
      Alert.alert("Gagal", `Terjadi kesalahan saat mengekspor data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const pickedFile = result.assets[0];
      setIsLoading(true);

      const fileContent = await FileSystem.readAsStringAsync(pickedFile.uri);
      const backupData = JSON.parse(fileContent);

      if (!backupData.app || backupData.app !== "STEIWealth" || !backupData.pengeluaran) {
        Alert.alert("Format Tidak Cocok", "Berkas yang dipilih bukan berkas backup STEIWealth yang valid.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false); // temporary turn off before alert prompt
      Alert.alert(
        "Konfirmasi Pemulihan",
        "Menimpa data saat ini dengan data backup. Semua transaksi saat ini akan dihapus dan diganti. Apakah Anda yakin?",
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Ya, Pulihkan",
            style: "destructive",
            onPress: async () => {
              try {
                setIsLoading(true);
                localDb.execSync("DELETE FROM pengeluaran");
                localDb.execSync("DELETE FROM budget_monthly");
                localDb.execSync("DELETE FROM budget_category");

                if (Array.isArray(backupData.pengeluaran)) {
                  for (const p of backupData.pengeluaran) {
                    localDb.runSync(
                      "INSERT INTO pengeluaran (ID, Nominal, Kategori, Keterangan, created_at) VALUES (?, ?, ?, ?, ?)",
                      p.ID, p.Nominal, p.Kategori, p.Keterangan, p.created_at
                    );
                  }
                }

                if (Array.isArray(backupData.budget_monthly)) {
                  for (const bm of backupData.budget_monthly) {
                    localDb.runSync(
                      "INSERT INTO budget_monthly (id, amount) VALUES (?, ?)",
                      bm.id, bm.amount
                    );
                  }
                }

                if (Array.isArray(backupData.budget_category)) {
                  for (const bc of backupData.budget_category) {
                    localDb.runSync(
                      "INSERT INTO budget_category (category, amount) VALUES (?, ?)",
                      bc.category, bc.amount
                    );
                  }
                }

                Alert.alert("Sukses", "Data berhasil dipulihkan dari cadangan!");
              } catch (err) {
                console.error("Gagal saat memulihkan database:", err);
                Alert.alert("Gagal Memulihkan", `Kesalahan database: ${err.message}`);
              } finally {
                setIsLoading(false);
                setBgGradient(getDynamicGradient());
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Gagal impor data:", error);
      Alert.alert("Gagal", `Terjadi kesalahan saat mengimpor data: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleVersionPress = () => {
    const now = Date.now();
    if (now - lastTapTime < 1000) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount === 7) {
        setDebuggerVisible(true);
        Alert.alert("Mode pengembang (SQLite Inspector) telah diaktifkan di menu pengaturan.");
        setTapCount(0);
      }
    } else {
      setTapCount(1);
    }
    setLastTapTime(now);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Memproses data...</Text>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* HEADER */}
          <LinearGradient colors={bgGradient} style={styles.header}>
            <Text style={styles.headerTitle}>Pengaturan</Text>
            <Text style={styles.headerSubtitle  }>Kelola aplikasi anda</Text>
          </LinearGradient>

          {/* BACKUP & RESTORE CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="cloud-upload-outline" size={24} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Manajemen Data</Text>
                <Text style={styles.cardSubtitle}>
                  Disarankan untuk mencadangkan data secara berkala
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
              <View style={styles.buttonLeft}>
                <View style={[styles.buttonIconBg, { backgroundColor: "#EFF6FF" }]}>
                  <Ionicons name="share-social-outline" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.buttonTitle}>Ekspor Data (Backup)</Text>
                  <Text style={styles.buttonDesc}>Simpan data</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, { marginTop: 12 }]} onPress={handleImportData}>
              <View style={styles.buttonLeft}>
                <View style={[styles.buttonIconBg, { backgroundColor: "#ECFDF5" }]}>
                  <Ionicons name="document-text-outline" size={20} color="#10b981" />
                </View>
                <View>
                  <Text style={styles.buttonTitle}>Impor Data (Restore)</Text>
                  <Text style={styles.buttonDesc}>Pulihkan data dari berkas</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* DYNAMIC THEME PREVIEW CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: "#FDF2F8" }]}>
                <Ionicons name="color-palette-outline" size={24} color="#db2777" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Tema Warna Dinamis</Text>
                <Text style={styles.cardSubtitle}>
                  Warna pada aplikasi ini beradaptasi secara otomatis dengan perbandingan pengeluaran dan budget total anda.
                </Text>
              </View>
            </View>
            
            <View style={styles.themePreviewRow}>
              <View style={styles.themePreviewItem}>
                <View style={[styles.themePreviewDot, { backgroundColor: '#000357ff' }]} />
                <Text style={styles.themePreviewLabel}>{"< 50%\n(Aman)"}</Text>
              </View>
              <View style={styles.themePreviewItem}>
                <View style={[styles.themePreviewDot, { backgroundColor: '#b09312ff' }]} />
                <Text style={styles.themePreviewLabel}>{"50% - 75%\n(Waspada)"}</Text>
              </View>
              <View style={styles.themePreviewItem}>
                <View style={[styles.themePreviewDot, { backgroundColor: '#760101ff' }]} />
                <Text style={styles.themePreviewLabel}>{">= 75%\n(Kritis)"}</Text>
              </View>
            </View>
          </View>

          {/* DEVELOPER / DEBUGGER MENU */}
          {debuggerVisible && (
            <View style={[styles.card, styles.debuggerCard]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: "#FEF2F2" }]}>
                  <Ionicons name="construct-outline" size={24} color="#dc2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: "#dc2626" }]}>Menu Pengembang</Text>
                  <Text style={styles.cardSubtitle}>
                    Fitur ini hanya untuk kebutuhan debugging data SQLite. Gunakan dengan bijak!
                  </Text>
                </View>
              </View>

              <Link href="../debugger" asChild>
                <TouchableOpacity style={styles.debuggerButton}>
                  <Ionicons name="bug-outline" size={20} color="#dc2626" style={{ marginRight: 8 }} />
                  <Text style={styles.debuggerButtonText}>Buka SQLite Inspector</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}

          {/* ABOUT SECTION & VERSION PRESS TRIGGER */}
          <View style={styles.aboutContainer}>
            <Image
              style={styles.logo}
              source={require('../../assets/images/steiwealth.png')}
              resizeMode="contain"
            />
            <Text style={styles.appName}>STEIWealth</Text>
            <TouchableOpacity onPress={handleVersionPress} activeOpacity={0.8}>
              <Text style={styles.versionText}>Versi 1.0.0</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Setting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#D1D5DB',
    fontSize: 16,
    marginTop: 6,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff',
    marginTop: 24,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardSubtitle: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buttonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  buttonDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  themePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    marginTop: 8,
  },
  themePreviewItem: {
    alignItems: 'center',
  },
  themePreviewDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  themePreviewLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  debuggerCard: {
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  debuggerButton: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debuggerButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
  },
  aboutContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  versionText: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  copyright: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 8,
  },
});