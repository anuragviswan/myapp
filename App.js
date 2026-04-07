import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'reminders.v1';

const createReminder = (title, notes = '') => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: title.trim(),
  notes: notes.trim(),
  completed: false,
  createdAt: new Date().toISOString(),
});

export default function App() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setReminders(JSON.parse(saved));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders, loading]);

  const stats = useMemo(() => {
    const done = reminders.filter((item) => item.completed).length;
    return { total: reminders.length, done };
  }, [reminders]);

  const addReminder = () => {
    if (!title.trim()) return;
    const next = createReminder(title, notes);
    setReminders((prev) => [next, ...prev]);
    setTitle('');
    setNotes('');
  };

  const toggleComplete = (id) => {
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeReminder = (id) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>Reminder App</Text>
        <Text style={styles.subtitle}>
          {stats.done} of {stats.total} completed
        </Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Reminder title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.notesInput]}
            multiline
          />
          <Pressable style={styles.addButton} onPress={addReminder}>
            <Text style={styles.addButtonText}>Add Reminder</Text>
          </Pressable>
        </View>

        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reminders yet. Add one above.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                onPress={() => toggleComplete(item.id)}
                style={styles.cardMain}
              >
                <Text style={[styles.cardTitle, item.completed && styles.completed]}>
                  {item.title}
                </Text>
                {!!item.notes && (
                  <Text
                    style={[styles.cardNotes, item.completed && styles.completed]}
                  >
                    {item.notes}
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => removeReminder(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 6,
    color: '#475569',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  notesInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    gap: 8,
  },
  cardMain: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardNotes: {
    marginTop: 2,
    color: '#475569',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
});
