import * as SQLite from 'expo-sqlite'
import * as FileSystem from 'expo-file-system';

export const getDynamicGradient = () => {
    try {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const expenseResult = localDb.getAllSync(`SELECT SUM(Nominal) as total FROM pengeluaran WHERE strftime('%Y-%m', created_at, 'localtime') = '${currentMonthStr}'`);
        const totalThisMonth = expenseResult[0]?.total || 0;
        
        const budgetResult = localDb.getFirstSync("SELECT amount FROM budget_monthly WHERE id = 1");
        const budgetTarget = budgetResult ? budgetResult.amount : 0;
        
        const percentage = budgetTarget > 0 ? (totalThisMonth / budgetTarget) * 100 : 0;
        
        if (percentage >= 75) return ['#760101ff', '#131d32'];
        if (percentage >= 50) return ['#594900ff', '#131d32'];
        return ['#000357ff', '#131d32'];
    } catch (e) {
        return ['#00057aff', '#131d32'];
    }
}

export const localDb = SQLite.openDatabaseSync('Projek-keuangan.db')

export const initLocalDb = () => {
    localDb.execSync(`
    CREATE TABLE IF NOT EXISTS pengeluaran (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Nominal INTEGER,
        Kategori VARCHAR(30),
        Keterangan VARCHAR(60),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS budget_monthly (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        amount REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS budget_category (
        category TEXT PRIMARY KEY,
        amount REAL DEFAULT 0
    );
    `)
}

