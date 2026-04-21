import * as SQLite from 'expo-sqlite'
import * as FileSystem from 'expo-file-system';


export const localDb = SQLite.openDatabaseSync('Projek-keuangan.db')

export const initLocalDb = () => {
    localDb.execSync(`
    CREATE TABLE IF NOT EXISTS pengeluaran (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Nominal INTEGER,
        Kategori VARCHAR(30),
        Keterangan VARCHAR(60),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `)
}

