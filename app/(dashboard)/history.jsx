import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getDynamicGradient, localDb } from '../../database/localDb'

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(dateString) {
  if (!dateString) return "Unknown Date";
  const isoString = dateString.replace(' ', 'T') + 'Z';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    const [datePart] = dateString.split(' ');
    if (!datePart) return "Unknown Date";
    const [year, month, day] = datePart.split('-');
    return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
  }
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTime(dateString) {
  if (!dateString) return "";
  const isoString = dateString.replace(' ', 'T') + 'Z';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    const parts = dateString.split(' ');
    if (parts.length < 2) return "";
    const timePart = parts[1];
    const [h, m] = timePart.split(':');
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  }
  let hours = d.getHours();
  let minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
}

function formatCompactRupiah(value) {
  if (value === undefined || value === null || isNaN(value) || value === 0) {
    return "Rp 0";
  }
  let formatted = "";
  if (value >= 1_000_000_000) {
    formatted = (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (value >= 1_000_000) {
    formatted = (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (value >= 1_000) {
    formatted = (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    formatted = value.toString();
  }
  return `Rp ${formatted}`;
}

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [weeklyExpense, setWeeklyExpense] = useState(0);
  const [todaysExpense, setTodaysExpense] = useState(0);
  const [bgGradient, setBgGradient] = useState(['#00057aff', '#131d32']);

  const fetchData = async () => {
    try {
      const data = await localDb.getAllAsync('SELECT * FROM pengeluaran ORDER BY created_at DESC');


      const today = new Date();
      let todaySum = 0;
      let weekSum = 0;
      let monthSum = 0;

  
      const currentDay = today.getDay();
      const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
      const startOfWeek = new Date(today);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(today.getDate() - distanceToMonday);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      data.forEach((item) => {
        if (!item.created_at) return;
        const isoString = item.created_at.replace(' ', 'T') + 'Z';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return;

        const nominal = Number(item.Nominal) || 0;

        if (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        ) {
          todaySum += nominal;
        }


        if (d >= startOfWeek && d < endOfWeek) {
          weekSum += nominal;
        }

        if (
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        ) {
          monthSum += nominal;
        }
      });

      setMonthlyExpense(monthSum);
      setWeeklyExpense(weekSum);
      setTodaysExpense(todaySum);


      const grouped = data.reduce((acc, curr) => {
        const dateStr = formatDate(curr.created_at);
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(curr);
        return acc;
      }, {});

      const groupedArray = Object.keys(grouped).map(date => ({
        date,
        data: grouped[date]
      }));
      setHistoryData(groupedArray);
    } catch (error) {
      console.log("Error fetching history:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      setBgGradient(getDynamicGradient());
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {}
        <LinearGradient
          colors={bgGradient}
          style={styles.headerContainer}
        >
          <Text style={styles.headerTitle}>Transaction History</Text>
          <Text style={styles.headerSubtitle}></Text>

          <View style={styles.metricsContainer}>
            {/* Expense card bulanan */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{"Monthly\nExpense"}</Text>
              <Text style={[styles.metricValue, { color: '#cbd5e1' }]}>
                {formatCompactRupiah(monthlyExpense)}
              </Text>
            </View>

            {/* Expense card mingguan */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{"Weekly\nExpense"}</Text>
              <Text style={[styles.metricValue, { color: '#cbd5e1' }]}>
                {formatCompactRupiah(weeklyExpense)}
              </Text>
            </View>

            {/* Expense card hari ini */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>{"Today's\nExpense"}</Text>
              <Text style={[styles.metricValue, { color: '#cbd5e1' }]}>
                {formatCompactRupiah(todaysExpense)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* List transaksi */}
        <View style={styles.listContainer}>
          {historyData.map((group, index) => (
            <View key={index} style={styles.groupContainer}>
              <View style={styles.dateHeader}>
                <Feather name="calendar" size={16} color="#6b7280" />
                <Text style={styles.dateText}>{group.date}</Text>
              </View>
              {group.data.map((item, idx) => (
                <View key={idx} style={styles.card}>
                  <View style={styles.cardLeft}>
                    <View style={styles.iconContainer}>
                      <Feather name="arrow-down-right" size={24} color="#e11d48" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.categoryName}>{item.Kategori}</Text>
                      {item.Keterangan ? (
                        <Text style={styles.keteranganText}>{item.Keterangan}</Text>
                      ) : null}
                      <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
                    </View>
                  </View>
                  <Text style={styles.amountText}>
                    -Rp {item.Nominal ? item.Nominal.toLocaleString('id-ID') : '0'}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          {historyData.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada riwayat pengeluaran.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default History;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#131d32',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 28,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  metricCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 115,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  groupContainer: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 4,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffe4e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  keteranganText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e11d48',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  }
})