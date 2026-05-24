import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { localDb, getDynamicGradient } from '../../database/localDb';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - 32; // Lebar layar dikurangi margin horizontal



// Mapping angka bulan ke nama bulan singkat
const MONTH_NAMES = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei', '06': 'Jun',
  '07': 'Jul', '08': 'Ags', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
};

const Dashboard = () => {
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [lastMonthExpense, setLastMonthExpense] = useState(0);
  const [categoriesData, setCategoriesData] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]); // State untuk Bar Chart Bulanan
  const [budgetTarget, setBudgetTarget] = useState(0);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [bgGradient, setBgGradient] = useState(['#00057aff', '#131d32']);

  const formatRupiah = (angka) => 'Rp ' + Math.floor(angka).toLocaleString('id-ID');

  // Format angka singkat untuk label diagram batang (Contoh: 1.5 Jt / 500K)
  const formatShortRupiah = (angka) => {
    if (angka >= 1000000) return (angka / 1000000).toFixed(1) + 'Jt';
    if (angka >= 1000) return (angka / 1000).toFixed(0) + 'K';
    return angka.toString();
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardStats();
    }, [])
  );

  const loadDashboardStats = () => {
    try {
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      let lastMonthYear = now.getFullYear();
      let lastMonthNum = now.getMonth(); // 0 is January, previous is Dec
      if (lastMonthNum === 0) {
        lastMonthNum = 12;
        lastMonthYear -= 1;
      }
      const lastMonthStr = `${lastMonthYear}-${String(lastMonthNum).padStart(2, '0')}`;

      // 1. Pengeluaran Bulan Ini
      const thisMonthResult = localDb.getAllSync(`
        SELECT SUM(Nominal) as total FROM pengeluaran 
        WHERE strftime('%Y-%m', created_at, 'localtime') = '${currentMonthStr}'
      `);
      const totalThisMonth = thisMonthResult[0]?.total || 0;
      setMonthlyExpense(totalThisMonth);

      // 2. Pengeluaran Bulan Lalu
      const lastMonthResult = localDb.getAllSync(`
        SELECT SUM(Nominal) as total FROM pengeluaran 
        WHERE strftime('%Y-%m', created_at, 'localtime') = '${lastMonthStr}'
      `);
      const totalLastMonth = lastMonthResult[0]?.total || 0;
      setLastMonthExpense(totalLastMonth);

      // 3. Distribusi per Kategori Bulan Ini
      const distributionResult = localDb.getAllSync(`
        SELECT Kategori, SUM(Nominal) as totalNominal FROM pengeluaran
        WHERE strftime('%Y-%m', created_at, 'localtime') = '${currentMonthStr}'
        GROUP BY Kategori
        ORDER BY totalNominal DESC
      `);
      setCategoriesData(distributionResult || []);

      // 4. Data Trend Bulanan untuk Bar Chart (Ambil max 6 bulan terakhir)
      const trendResult = localDb.getAllSync(`
        SELECT strftime('%m', created_at, 'localtime') as monthNum, SUM(Nominal) as total 
        FROM pengeluaran 
        GROUP BY strftime('%Y-%m', created_at, 'localtime')
        ORDER BY strftime('%Y-%m', created_at, 'localtime') DESC
        LIMIT 6
      `);
      // Reverse array agar urutannya kronologis (Kiri=Lama, Kanan=Baru)
      setMonthlyTrendData(trendResult.reverse() || []);

      // 5. Budget bulanan
      const budgetResult = localDb.getFirstSync("SELECT amount FROM budget_monthly WHERE id = 1");
      if (budgetResult) setBudgetTarget(budgetResult.amount);

      // 6. Limit per kategori
      const catBudgetResult = localDb.getAllSync("SELECT * FROM budget_category");
      const catBudgetMap = {};
      catBudgetResult.forEach(item => {
        catBudgetMap[item.category] = item.amount;
      });
      setCategoryBudgets(catBudgetMap);

      setBgGradient(getDynamicGradient());

    } catch (error) {
      console.error("Gagal memuat statistik database:", error);
    }
  };

  const spendingPercentage = budgetTarget > 0 ? (monthlyExpense / budgetTarget) * 100 : 0;
  const remainingBudget = budgetTarget - monthlyExpense;
  const differenceExpense = monthlyExpense - lastMonthExpense;

  let differencePercentage = 0;
  if (lastMonthExpense > 0) differencePercentage = (differenceExpense / lastMonthExpense) * 100;

  // Mencari nilai tertinggi untuk skala tinggi Bar Chart
  const maxTrendValue = monthlyTrendData.length > 0
    ? Math.max(...monthlyTrendData.map(d => d.total))
    : 1;

  const now = new Date();
  const currentMonthName = MONTH_NAMES[String(now.getMonth() + 1).padStart(2, '0')];
  const currentYear = now.getFullYear();

  let prevMonthNum = now.getMonth();
  if (prevMonthNum === 0) prevMonthNum = 12;
  const prevMonthName = MONTH_NAMES[String(prevMonthNum).padStart(2, '0')];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>

      {/* HEADER NAVY */}
      <LinearGradient colors={bgGradient} style={styles.headerSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>STEIWealth</Text>
          <Image style={{ width: 30, height: 30, marginLeft: 8, marginTop: 8 }} source={require('../../assets/images/steiwealth.png')} resizeMode="contain" />
        </View>
        <Text style={styles.headerSubtitle}>Overview {currentMonthName} {currentYear}</Text>
      </LinearGradient>


      {/* CARD BESAR: MONTHLY EXPENSE */}
      <View style={styles.cardContainerRow}>
        <View style={styles.largeExpenseCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>MONTHLY EXPENSE (CURRENT)</Text>
            <Text style={{ fontSize: 18 }}></Text>
          </View>
          <Text style={styles.largeCardValue}>{formatRupiah(monthlyExpense)}</Text>
        </View>
      </View>

      {/* BLOK TENGAH (POSISI DITUKAR) */}
      <View style={styles.middleSectionRow}>

        {/* KIRI: MONTH COMPARISON (DIPERSINGKAT) */}
        <View style={styles.whiteCardLeft}>
          <Text style={styles.sectionTitleBlack}>Month Compare</Text>
          <View style={{ marginTop: 12, gap: 10 }}>
            <View>
              <Text style={styles.compareLabel}>{prevMonthName}</Text>
              <Text style={styles.compareValue}>{formatRupiah(lastMonthExpense)}</Text>
            </View>
            <View>
              <Text style={styles.compareLabel}>{currentMonthName}</Text>
              <Text style={styles.compareValue}>{formatRupiah(monthlyExpense)}</Text>
            </View>
            <View style={[styles.diffBox, { backgroundColor: differenceExpense > 0 ? '#ef4444' : '#10b981' }]}>
              <Text style={[styles.compareLabel, { color: '#ffffff' }]}>Difference</Text>
              <Text style={[styles.compareValue, { color: '#ffffff' }]}>
                {differenceExpense >= 0 ? '+' : ''}{differencePercentage.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* KANAN: BUDGET TARGET */}
        <View style={styles.whiteCardRight}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitleBlack}>Budget Target</Text>
            <Text style={{ fontSize: 14 }}>🎯</Text>
          </View>

          <View style={styles.budgetProgressRow}>
            <Text style={styles.spendingLabel}>Monthly Spending</Text>
            <Text style={styles.percentageText}>{spendingPercentage.toFixed(1)}%</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${Math.min(spendingPercentage, 100)}%` }]} />
          </View>

          <View style={styles.budgetLimitRow}>
            <Text style={styles.limitText}>Rp 0</Text>
            <Text style={styles.limitText}>{formatRupiah(budgetTarget)}</Text>
          </View>

          <View style={[styles.budgetAlertBox, spendingPercentage > 100 && styles.budgetAlertBoxOver]}>
            <Text style={spendingPercentage > 100 ? styles.alertTextRed : styles.alertTextGreen}>
              {spendingPercentage > 100 ? '⚠ Budget Overlimit' : '✓ Well within budget'}
            </Text>
          </View>

          <TouchableOpacity style={styles.manageBtn} onPress={() => router.push('/planning')}>
            <Text style={styles.manageBtnText}>Manage Budget</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SECTION BAWAH: SLIDER/CAROUSEL EXPENSE ANALYTICS */}
      <View style={styles.bottomSliderContainer}>
        <View style={styles.sliderHeaderRow}>
          <Text style={styles.sectionTitleBlack}>Analytics (Swipe ↔)</Text>
          <Text style={{ fontSize: 12, color: '#94a3b8' }}>● ●</Text>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={SLIDE_WIDTH}
          decelerationRate="fast"
        >

          {/* SLIDE 1: EXPENSE DISTRIBUTION (HORIZONTAL SEGMENTED BAR) */}
          <View style={styles.slidePage}>
            <Text style={styles.slideTitle}>Category Distribution</Text>

            {categoriesData.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No data available</Text>
              </View>
            ) : (
              <ScrollView style={{ marginTop: 10, maxHeight: 250 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                {categoriesData.map((item, index) => {
                  const limit = categoryBudgets[item.Kategori] || 0;
                  const percentage = limit > 0 ? (item.totalNominal / limit) * 100 : 0;
                  // Jika limit 0 tapi ada pengeluaran, anggap 100% overlimit
                  const displayPercentage = limit === 0 && item.totalNominal > 0 ? 100 : percentage;

                  let barColor = '#3b82f6'; // Biru (< 50%)
                  if (displayPercentage >= 75) {
                    barColor = '#ef4444'; // Merah
                  } else if (displayPercentage >= 50) {
                    barColor = '#facc15'; // Kuning
                  }

                  return (
                    <View key={index} style={{ marginBottom: 14 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#4b5563' }}>{item.Kategori}</Text>
                        <Text style={{ fontSize: 12, color: '#64748b' }}>
                          {formatRupiah(item.totalNominal)} <Text style={{ color: '#94a3b8' }}>/ {formatRupiah(limit)}</Text>
                        </Text>
                      </View>

                      <View style={{ height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{
                          height: '100%',
                          backgroundColor: barColor,
                          width: `${Math.min(displayPercentage, 100)}%`
                        }} />
                      </View>
                      {displayPercentage > 100 && (
                        <Text style={{ fontSize: 10, color: '#ef4444', marginTop: 4, textAlign: 'right' }}>
                          Over limit!
                        </Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* SLIDE 2: MONTHLY TREND (BAR CHART) */}
          <View style={styles.slidePage}>
            <Text style={styles.slideTitle}>Monthly Expenses Trend</Text>

            {monthlyTrendData.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No trend data yet</Text>
              </View>
            ) : (
              <View style={styles.barChartContainer}>
                {monthlyTrendData.map((item, index) => {
                  const heightPercent = (item.total / maxTrendValue) * 100;
                  return (
                    <View key={index} style={styles.barColumn}>
                      <Text style={styles.barValueText}>{formatShortRupiah(item.total)}</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFillDynamic, { height: `${heightPercent}%` }]} />
                      </View>
                      <Text style={styles.barMonthText}>{MONTH_NAMES[item.monthNum] || item.monthNum}</Text>
                    </View>
                  )
                })}
              </View>
            )}
          </View>

        </ScrollView>
      </View>

    </ScrollView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerSection: {
    paddingHorizontal: 20, paddingTop: 30, paddingBottom: 65,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4 },

  cardContainerRow: { paddingHorizontal: 16, marginTop: -40 },
  largeExpenseCard: {
    backgroundColor: '#242e42', width: '100%', borderRadius: 16, padding: 18, elevation: 5,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700', letterSpacing: 0.5 },
  largeCardValue: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginVertical: 4 },

  middleSectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 24,
  },
  whiteCardLeft: {
    backgroundColor: '#fff', width: '48%', borderRadius: 14, padding: 14, minHeight: 220, elevation: 2,
  },
  whiteCardRight: {
    backgroundColor: '#fff', width: '48%', borderRadius: 14, padding: 14, elevation: 2,
  },
  sectionTitleBlack: { fontSize: 13, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },

  /* Month Compare Mini */
  compareLabel: { fontSize: 10, color: '#64748b', marginBottom: 2 },
  compareValue: { fontSize: 13, fontWeight: 'bold', color: '#1f2937' },
  diffBox: { padding: 8, borderRadius: 8, marginTop: 4 },

  /* Budget Target */
  budgetProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'flex-end' },
  spendingLabel: { fontSize: 11, color: '#94a3b8' },
  percentageText: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  progressBarBackground: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, marginTop: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3b82f6' },
  budgetLimitRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  limitText: { fontSize: 10, color: '#94a3b8' },
  budgetAlertBox: { backgroundColor: '#f0fdf4', borderRadius: 8, padding: 10, marginTop: 14, borderWidth: 1, borderColor: '#dcfce7' },
  budgetAlertBoxOver: { backgroundColor: '#fef2f2', borderColor: '#fee2e2' },
  alertTextGreen: { fontSize: 11, fontWeight: 'bold', color: '#16a34a' },
  alertTextRed: { fontSize: 11, fontWeight: 'bold', color: '#dc2626' },
  manageBtn: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 14 },
  manageBtnText: { fontSize: 11, fontWeight: '600', color: '#4b5563' },

  /* SLIDER SECTION BAWAH */
  bottomSliderContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 14,
    marginTop: 24,
    elevation: 2,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  sliderHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  slidePage: {
    width: SLIDE_WIDTH,
    paddingHorizontal: 16,
  },
  slideTitle: { fontSize: 11, color: '#64748b', fontWeight: '500', marginBottom: 10 },

  /* Horizontal Segmented Bar (Distribution) */
  segmentedBarContainer: {
    height: 14,
    width: '100%',
    flexDirection: 'row',
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  segmentBlock: { height: '100%' },
  legendScroll: { maxHeight: 120 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  colorIndicatorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendTextWrapper: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legendLabelText: { fontSize: 12, color: '#4b5563' },
  legendPercentText: { fontSize: 12, fontWeight: 'bold', color: '#1f2937' },
  legendSubValue: { fontSize: 10, color: '#94a3b8', fontWeight: 'normal' },

  /* Bar Chart (Monthly Trend) */
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 250,
    marginTop: 10,
  },
  barColumn: { alignItems: 'center', width: 40 },
  barValueText: { fontSize: 9, color: '#64748b', marginBottom: 6 },
  barTrack: { height: 100, width: 20, backgroundColor: '#f1f5f9', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFillDynamic: { width: '100%', backgroundColor: '#3b82f6', borderRadius: 6 },
  barMonthText: { fontSize: 10, color: '#4b5563', marginTop: 8, fontWeight: '500' },

  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 100 },
  emptyStateText: { color: '#94a3b8', fontSize: 12 },
});