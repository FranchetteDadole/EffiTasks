import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Login from '../components/src/Login'; // Import your login component
import Icon from 'react-native-vector-icons/Ionicons'; // Import the icon library

// Define a type for each task object
interface Task {
  key: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const Layout: React.FC = () => {
  const [task, setTask] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingTaskKey, setEditingTaskKey] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false); // State to control date picker visibility

  const themeStyles = isDarkMode ? darkTheme : lightTheme;

  // Check login status when the component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      const user = await AsyncStorage.getItem('loggedInUser');
      if (user) {
        setIsLoggedIn(true);
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const handleLoginSuccess = async () => {
    await AsyncStorage.setItem('loggedInUser', 'user'); // Save session
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK", 
          onPress: async () => {
            await AsyncStorage.removeItem('loggedInUser');
            setIsLoggedIn(false);
          }
        }
      ]
    );
  };

  // Function to add or edit a task
  const addOrEditTask = () => {
    if (task.trim() !== '') {
      if (editingTaskKey) {
        // Edit existing task
        setTasks(tasks.map((t) =>
          t.key === editingTaskKey ? { ...t, text: task, createdAt: selectedDate || new Date() } : t
        ));
        setEditingTaskKey(null); // Reset editing task key
      } else {
        // Add new task
        setTasks([...tasks, { key: Date.now().toString(), text: task, completed: false, createdAt: selectedDate || new Date() }]);
      }
      setTask(''); // Clear the input after adding or editing the task
      setSelectedDate(undefined); // Reset the selected date
      setModalVisible(false); // Close the modal
    }
  };

  // Function to toggle task completion
  const toggleTaskCompletion = (taskKey: string) => {
    setTasks(
      tasks.map((task) =>
        task.key === taskKey ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Function to delete a task
  const deleteTask = (taskKey: string) => {
    setTasks(tasks.filter((task) => task.key !== taskKey));
  };

  // Function to start editing a task
  const startEditingTask = (task: Task) => {
    setEditingTaskKey(task.key); // Set the key of the task being edited
    setTask(task.text); // Populate the input field with the task's text
    setSelectedDate(task.createdAt); // Set the selected date
    setModalVisible(true); // Show the modal
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <View style={[styles.container, themeStyles.container]}>
      <Text style={[styles.title, themeStyles.text]}>Effitasks</Text>

      {/* Night Mode Toggle */}
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, themeStyles.text]}>
          {isDarkMode ? '' : ''}
        </Text>
        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
          <Icon
            name={isDarkMode ? 'moon-outline' : 'sunny-outline'}
            size={28}
            color={isDarkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </View>

      {/* Task input field */}
      <TextInput
        style={[styles.input, themeStyles.input]}
        placeholder="Add or edit a task"
        placeholderTextColor={isDarkMode ? '#ddd' : '#555'}
        value={task}
        onChangeText={setTask}
      />

      {/* Add Task button */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
        <Text style={styles.addButtonText}>{editingTaskKey ? 'Edit Task' : 'Add Task'}</Text>
      </TouchableOpacity>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={[styles.taskContainer, themeStyles.taskContainer]}>
            <Checkbox
              status={item.completed ? 'checked' : 'unchecked'}
              onPress={() => toggleTaskCompletion(item.key)}
              color={isDarkMode ? '#fff' : '#000'}
            />
            <TouchableOpacity onPress={() => startEditingTask(item)} style={styles.taskTextContainer}>
              <Text style={[styles.taskText, item.completed && styles.completedTask, themeStyles.text]} numberOfLines={0}>
                {item.text}
              </Text>
              <Text style={[styles.dateText, themeStyles.text]}>
                {item.createdAt.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity onPress={() => deleteTask(item.key)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.key}
      />

      {/* Settings Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.settingsButton}>
        <Icon name="settings-outline" size={30} color={isDarkMode ? '#fff' : '#000'} />
      </TouchableOpacity>

      {/* Modal for Adding/Editing Tasks */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTaskKey ? 'Edit Task' : 'Add Task'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Task description"
              value={task}
              onChangeText={setTask}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>
                {selectedDate ? selectedDate.toLocaleDateString() : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}
            <TouchableOpacity onPress={addOrEditTask} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>{editingTaskKey ? 'Update Task' : 'Add Task'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles for the components
  container: {
    flex: 1,
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    elevation: 2, // Adds shadow for Android
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  taskText: {
    fontSize: 18,
    flexWrap: 'wrap', // Allow text to wrap to the next line
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  dateText: {
    fontSize: 12,
    color: 'gray',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000',
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
  },
});

// Define light and dark themes
const lightTheme = {
  container: {
    backgroundColor: '#fff',
  },
  text: {
    color: '#000',
  },
  input: {
    borderColor: '#ccc',
  },
  taskContainer: {
    backgroundColor: '#f8f9fa',
  },
};

const darkTheme = {
  container: {
    backgroundColor: '#333',
  },
  text: {
    color: '#fff',
  },
  input: {
    borderColor: '#666',
  },
  taskContainer: {
    backgroundColor: '#444',
  },
};

export default Layout;
