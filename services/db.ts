import { Record, User, LogEntry, DashboardStats } from '../types';

// Constants for LocalStorage keys
const STORAGE_KEYS = {
  RECORDS: 'iffidb_records',
  LOGS: 'iffidb_logs',
  USER: 'iffidb_user',
  THEME: 'iffidb_theme',
  MODE: 'iffidb_mode',
};

// --- Mock Database Helper ---
const getStorage = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// --- Event System for Reactivity ---
type Listener = () => void;
let listeners: Listener[] = [];

export const subscribe = (listener: Listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l());
};

// --- Logging System ---
export const logAction = (action: LogEntry['action'], details: string) => {
  const logs = getStorage<LogEntry[]>(STORAGE_KEYS.LOGS, []);
  const newLog: LogEntry = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    action,
    details,
    user: 'Admin', // In a real app, get current user
  };
  // Keep last 100 logs
  const updatedLogs = [newLog, ...logs].slice(0, 100);
  setStorage(STORAGE_KEYS.LOGS, updatedLogs);
  return newLog;
};

export const getLogs = (): LogEntry[] => {
  return getStorage<LogEntry[]>(STORAGE_KEYS.LOGS, []);
};

// --- Authentication ---
export const login = async (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'iffibaloch334@gmail.com' && password === 'admin') {
        const user: User = {
          id: 'admin-1',
          name: 'Iftikhar Ali',
          email,
          role: 'admin',
          token: 'jwt-fake-token-' + Date.now(),
        };
        setStorage(STORAGE_KEYS.USER, user);
        logAction('LOGIN', `User ${email} logged in successfully.`);
        resolve(user);
      } else {
        logAction('ERROR', `Failed login attempt for ${email}.`);
        reject(new Error('Invalid credentials. (Hint: iffibaloch334@gmail.com / admin)'));
      }
    }, 800); // Simulate network delay
  });
};

export const logout = () => {
  logAction('LOGIN', 'User logged out.');
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const getCurrentUser = (): User | null => {
  return getStorage<User | null>(STORAGE_KEYS.USER, null);
};

// --- CRUD Operations ---
export const getRecords = async (): Promise<Record[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStorage<Record[]>(STORAGE_KEYS.RECORDS, []));
    }, 100); // Reduced delay for smoother feel
  });
};

export const createRecord = async (data: Omit<Record, 'id' | 'createdAt'>): Promise<Record> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const records = getStorage<Record[]>(STORAGE_KEYS.RECORDS, []);
      const newRecord: Record = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
      };
      setStorage(STORAGE_KEYS.RECORDS, [newRecord, ...records]);
      logAction('CREATE', `Created record: ${newRecord.name}`);
      notifyListeners();
      resolve(newRecord);
    }, 300);
  });
};

export const updateRecord = async (id: string, data: Partial<Record>): Promise<Record> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const records = getStorage<Record[]>(STORAGE_KEYS.RECORDS, []);
      const index = records.findIndex((r) => r.id === id);
      if (index === -1) {
        logAction('ERROR', `Update failed: Record ${id} not found.`);
        reject(new Error(`Record with ID ${id} not found.`));
        return;
      }
      const updatedRecord = { ...records[index], ...data };
      records[index] = updatedRecord;
      setStorage(STORAGE_KEYS.RECORDS, records);
      logAction('UPDATE', `Updated record: ${updatedRecord.name}`);
      notifyListeners();
      resolve(updatedRecord);
    }, 300);
  });
};

export const deleteRecord = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const records = getStorage<Record[]>(STORAGE_KEYS.RECORDS, []);
      const record = records.find(r => r.id === id);
      if (!record) {
        logAction('ERROR', `Delete failed: Record ${id} not found.`);
        reject(new Error(`Record with ID ${id} not found.`));
        return;
      }
      const filtered = records.filter((r) => r.id !== id);
      setStorage(STORAGE_KEYS.RECORDS, filtered);
      logAction('DELETE', `Deleted record: ${record?.name || id}`);
      notifyListeners();
      resolve();
    }, 300);
  });
};

// --- Export Helper ---
export const exportAllRecordsCSV = async () => {
  const records = getStorage<Record[]>(STORAGE_KEYS.RECORDS, []);
  if (records.length === 0) throw new Error("No records to export.");

  const headers = ["ID", "Name", "Email", "Phone", "Address", "Created At"];
  const escapeCsv = (str: string) => `"${String(str).replace(/"/g, '""')}"`;
  
  const rows = records.map(r => [
      escapeCsv(r.id),
      escapeCsv(r.name),
      escapeCsv(r.email),
      escapeCsv(r.phone),
      escapeCsv(r.address),
      escapeCsv(new Date(r.createdAt).toLocaleString())
  ].join(","));

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `iffidb_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  logAction('SYSTEM', 'Exported all records to CSV via Command.');
};

// --- Statistics ---
export const getStats = async (): Promise<DashboardStats> => {
  const records = getStorage<Record[]>(STORAGE_KEYS.RECORDS, []);
  
  // Calculate today's new records
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const newToday = records.filter(r => r.createdAt >= startOfDay).length;

  // Fake deleted count for demo purposes (can't track deleted items in this simple array)
  const deletedCount = Math.floor(Math.random() * 20) + 5; 

  return {
    totalRecords: records.length,
    newToday,
    deletedCount,
    lastAdded: records.slice(0, 5),
  };
};

// --- Seeder ---
export const generateSampleData = async (): Promise<void> => {
  const firstNames = ['John', 'Jane', 'Ali', 'Sara', 'Mike', 'Emily', 'David', 'Zara'];
  const lastNames = ['Doe', 'Smith', 'Khan', 'Baloch', 'Taylor', 'Wilson', 'Brown', 'Ahmed'];
  const cities = ['New York', 'London', 'Karachi', 'Lahore', 'Dubai', 'Toronto'];
  
  const promises = Array.from({ length: 10 }).map(() => {
    const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
    return createRecord({
      name: `${fname} ${lname}`,
      email: `${fname.toLowerCase()}.${lname.toLowerCase()}@example.com`,
      phone: `+92 3${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000000)}`,
      address: `${Math.floor(Math.random() * 100)} St, ${cities[Math.floor(Math.random() * cities.length)]}`,
    });
  });

  await Promise.all(promises);
  logAction('SYSTEM', 'Generated 10 sample records.');
  notifyListeners();
};