import { localDb, getDynamicGradient } from "../../database/localDb";
import { Stack, useFocusEffect } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const tabs = ["Budget", "Categories"];

const Planning = () => {
  const [activeTab, setActiveTab] = useState("Budget");

  const [monthlyBudget, setMonthlyBudget] = useState("0");

  const defaultCategories = [
    { id: "Food", name: "Food", amount: "0", icon: "🍔" },
    { id: "Transport", name: "Transport", amount: "0", icon: "🚗" },
    { id: "Utilities", name: "Utilities", amount: "0", icon: "💡" },
    { id: "Entertainment", name: "Entertainment", amount: "0", icon: "🎮" },
    { id: "Health", name: "Health", amount: "0", icon: "🏥" },
    { id: "Shopping", name: "Shopping", amount: "0", icon: "🛍️" },
    { id: "Education", name: "Education", amount: "0", icon: "📚" },
    { id: "Technology", name: "Technology", amount: "0", icon: "💻" },
    { id: "Gift", name: "Gift", amount: "0", icon: "🎁" },
    { id: "Housing", name: "Housing", amount: "0", icon: "🏠" },
    { id: "Other", name: "Other", amount: "0", icon: "📦" },
  ];

  const [categories, setCategories] = useState(defaultCategories);

  const [bgGradient, setBgGradient] = useState(['#00057aff', '#131d32']);

  useFocusEffect(
    useCallback(() => {
      loadBudget();
      loadCategories();
      setBgGradient(getDynamicGradient());
    }, [])
  );

  const updateCategory = (id, value) => {
    setCategories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: value } : item)),
    );
  };

  const totalCategoryBudget = categories.reduce(
    (total, item) => total + Number(item.amount),
    0,
  );

  const loadBudget = async () => {
    try {
      const result = await localDb.getFirstAsync("SELECT amount FROM budget_monthly WHERE id = 1");

      if (result) {
        setMonthlyBudget(result.amount.toString());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadCategories = async () => {
    try {
      const results = await localDb.getAllAsync("SELECT * FROM budget_category");

      if (results && results.length > 0) {
        const mergedCategories = defaultCategories.map(cat => {
          const found = results.find(r => r.category === cat.id);
          if (found) {
            return { ...cat, amount: found.amount.toString() };
          }
          return cat;
        });
        setCategories(mergedCategories);
      } else {
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveBudget = async () => {
    try {
      await localDb.runAsync("INSERT OR REPLACE INTO budget_monthly (id, amount) VALUES (1, ?)", Number(monthlyBudget));

      alert("Budget berhasil disimpan");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveCategories = async () => {
    try {
      for (const cat of categories) {
        await localDb.runAsync("INSERT OR REPLACE INTO budget_category (category, amount) VALUES (?, ?)", cat.id, Number(cat.amount));
      }

      alert("Kategori berhasil disimpan");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* HEADER */}
          <LinearGradient colors={bgGradient} style={styles.header}>
            <Text style={styles.headerTitle}>Financial Planning</Text>

            <Text style={styles.headerSubtitle}>
              Kelola anggaran dan capai tujuan keuangan Anda
            </Text>
          </LinearGradient>

          {/* TAB */}
          <View style={styles.tabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* BUDGET TAB */}
          {activeTab === "Budget" && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#DBEAFE" }]}
                >
                  <Text style={styles.iconText}>◎</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Monthly Budget Limit</Text>

                  <Text style={styles.cardSubtitle}>
                    Tetapkan batas maksimum pengeluaran bulanan agar keuangan
                    tetap terkontrol dan sesuai rencana.
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Budget Amount (Rp)</Text>

              <TextInput
                style={styles.input}
                value={monthlyBudget}
                onChangeText={setMonthlyBudget}
                keyboardType="numeric"
                placeholder="Masukkan budget"
              />

              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  💡 Tip: Disarankan menjaga total pengeluaran di bawah 80%
                  pendapatan bulanan agar tetap memiliki ruang menabung.
                </Text>
              </View>

              <View style={styles.benefitBox}>
                <Text style={styles.benefitText}>
                  ✅ Manfaat: Membantu Anda mengontrol pengeluaran dan
                  memastikan keuangan tetap sesuai rencana anggaran yang telah
                  ditetapkan.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveBudget}
              >
                <Text style={styles.saveButtonText}>
                  💾 Simpan Batas Budget
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CATEGORY TAB */}
          {activeTab === "Categories" && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#F3E8FF" }]}
                >
                  <Text style={[styles.iconText, { color: "#9333EA" }]}>▣</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Category Budgets</Text>

                  <Text style={styles.cardSubtitle}>
                    Atur batas pengeluaran untuk setiap kategori agar
                    pengelolaan anggaran lebih terkendali.
                  </Text>
                </View>
              </View>

              {categories.map((item) => (
                <View key={item.id} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <View style={styles.categoryIcon}>
                      <Text>{item.icon}</Text>
                    </View>

                    <Text style={styles.categoryName}>{item.name}</Text>
                  </View>

                  <View style={styles.categoryInputRow}>
                    <Text style={styles.rpText}>Rp</Text>

                    <TextInput
                      style={styles.categoryInput}
                      value={item.amount}
                      keyboardType="numeric"
                      onChangeText={(value) => updateCategory(item.id, value)}
                    />
                  </View>
                </View>
              ))}

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Batas Kategori</Text>

                <Text style={styles.totalAmount}>
                  Rp {totalCategoryBudget.toLocaleString("id-ID")}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveCategories}
              >
                <Text style={styles.saveButtonText}>
                  💾 Simpan Batas Kategori
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Planning;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F5",
  },

  header: {
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: 24,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#D1D5DB",
    fontSize: 16,
    marginTop: 6,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 18,
    padding: 6,
    elevation: 3,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
  },

  activeTab: {
    backgroundColor: "#fff",
  },

  tabText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },

  activeTabText: {
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    marginTop: 30,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    marginBottom: 30,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  iconText: {
    fontSize: 24,
    color: "#2563EB",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  cardSubtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 22,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },

  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },

  tipBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  tipText: {
    color: "#1D4ED8",
    lineHeight: 24,
    fontSize: 14,
  },

  benefitBox: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  benefitText: {
    color: "#047857",
    lineHeight: 24,
    fontSize: 14,
  },

  saveButton: {
    backgroundColor: "#071B4B",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  categoryName: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },

  categoryInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rpText: {
    marginRight: 8,
    color: "#6B7280",
    fontWeight: "600",
  },

  categoryInput: {
    backgroundColor: "#F3F4F6",
    width: 110,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontWeight: "700",
    fontSize: 15,
  },

  totalContainer: {
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 20,
    marginTop: 10,
    marginBottom: 20,
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  totalAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginTop: 8,
  },
});
