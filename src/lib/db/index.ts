import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Expense, SavingsGoal, UserProfile } from '@/types';

interface ExpenseTrackerDB extends DBSchema {
  expenses: {
    key: string;
    value: Expense;
    indexes: { 'by-date': string; 'by-category': string };
  };
  goals: {
    key: string;
    value: SavingsGoal;
  };
  profile: {
    key: string;
    value: UserProfile;
  };
}

let dbPromise: Promise<IDBPDatabase<ExpenseTrackerDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ExpenseTrackerDB>('expense-tracker', 1, {
      upgrade(db) {
        const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
        expenseStore.createIndex('by-date', 'date');
        expenseStore.createIndex('by-category', 'category');

        db.createObjectStore('goals', { keyPath: 'id' });
        db.createObjectStore('profile', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDB();
  const expenses = await db.getAll('expenses');
  return expenses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addExpenseToDB(expense: Expense): Promise<void> {
  const db = await getDB();
  await db.put('expenses', expense);
}

export async function updateExpenseInDB(expense: Expense): Promise<void> {
  const db = await getDB();
  await db.put('expenses', expense);
}

export async function deleteExpenseFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('expenses', id);
}

export async function getAllGoals(): Promise<SavingsGoal[]> {
  const db = await getDB();
  return db.getAll('goals');
}

export async function addGoalToDB(goal: SavingsGoal): Promise<void> {
  const db = await getDB();
  await db.put('goals', goal);
}

export async function updateGoalInDB(goal: SavingsGoal): Promise<void> {
  const db = await getDB();
  await db.put('goals', goal);
}

export async function deleteGoalFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('goals', id);
}

export async function getProfileFromDB(): Promise<UserProfile | undefined> {
  const db = await getDB();
  const all = await db.getAll('profile');
  return all[0];
}

export async function saveProfileToDB(profile: UserProfile): Promise<void> {
  const db = await getDB();
  await db.put('profile', profile);
}
