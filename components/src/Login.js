import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For session persistence

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if the user is already logged in when the component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedInUser = await AsyncStorage.getItem('loggedInUser');
      if (loggedInUser) {
        onLoginSuccess(); // Automatically log in if session exists
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');

    const registeredUser = await AsyncStorage.getItem('registeredUser');
    const parsedUser = registeredUser ? JSON.parse(registeredUser) : null;

    if (parsedUser && username === parsedUser.username && password === parsedUser.password) {
      await AsyncStorage.setItem('loggedInUser', username); // Save login session
      setLoading(false);
      onLoginSuccess(); // Notify parent of successful login
    } else {
      setLoading(false);
      setErrorMessage('Invalid username or password');
    }
  };

  const handleRegister = async () => {
    if (username && password) {
      const newUser = { username, password };
      await AsyncStorage.setItem('registeredUser', JSON.stringify(newUser));
      Alert.alert('Success', 'You have successfully registered!');
    } else {
      setErrorMessage('Both username and password are required for registration');
    }
  };

  return (
    <View style={styles.container}>
      {/* Add a logo or header image */}
      <Image source={require('../..//assets/images/1.png')} style={styles.logo} />

      <Text style={styles.title}>Effitasks</Text>

      {/* Display error message if any */}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {/* Username Input */}
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        mode="outlined"
      />

      {/* Password Input */}
      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        mode="outlined"
      />

      {/* Login Button */}
      <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading} style={styles.button}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      {/* Register Button */}
      <Button mode="outlined" onPress={handleRegister} style={styles.button}>
        Register
      </Button>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
