// RegisterScreen.js
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import LogoCarousel from '../components/LogoCarousel'
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal, // Importa o Modal para o seletor de data
  Platform,
  SafeAreaView,
  ScrollView, // Importa o ScrollView
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
// Importa o DateTimePicker (é necessário instalar: expo install @react-native-community/datetimepicker)
import DateTimePicker from '@react-native-community/datetimepicker';

// Novo componente da tela de registro
export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState(new Date()); // Estado para a data de nascimento (tipo Date)
  const [dobDisplay, setDobDisplay] = useState(''); // Estado para exibir a data formatada
  const [docType, setDocType] = useState('cpf');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); // Estado para controlar a visibilidade do seletor de data
  // Atualizado para pegar a função 'signUp' em vez de 'register'
  const { signUp, isLoading } = useAuth();
  const router = useRouter();

  // Função para aplicar a máscara no CPF ou CNPJ
  const formatDocument = (text) => {
    let formattedText = text.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    if (docType === 'cpf') {
      if (formattedText.length > 9) {
        formattedText = formattedText.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (formattedText.length > 6) {
        formattedText = formattedText.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (formattedText.length > 3) {
        formattedText = formattedText.replace(/(\d{3})(\d{3})/, '$1.$2');
      }
      formattedText = formattedText.substring(0, 14); // Limita o tamanho máximo
    } else { // docType === 'cnpj'
      if (formattedText.length > 12) {
        formattedText = formattedText.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      } else if (formattedText.length > 8) {
        formattedText = formattedText.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
      } else if (formattedText.length > 5) {
        formattedText = formattedText.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (formattedText.length > 2) {
        formattedText = formattedText.replace(/(\d{2})(\d{3})/, '$1.$2');
      }
      formattedText = formattedText.substring(0, 18); // Limita o tamanho máximo
    }
    setDocument(formattedText);
  };

  // Função para lidar com a mudança de data no seletor
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Fecha o seletor no Android, mas no iOS pode precisar de um botão de 'ok'
    if (selectedDate) {
      setDob(selectedDate);
      // Formata a data para exibição
      const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
      setDobDisplay(formattedDate);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !dob || !document || !phone || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem. Por favor, verifique e tente novamente.');
      return;
    }

    // Cria um objeto com todos os dados do formulário
    const registrationData = {
      name,
      email,
      dob,
      docType,
      document,
      phone,
      password,
    };

    try {
      // Chama a função 'signUp' do contexto com o objeto de dados
      await signUp(registrationData);
      // O contexto já cuida da navegação em um cenário real
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo e Título */}
            <View style={styles.header}>
              <View style={styles.header}>
                          <Image
                            source={require('../assets/images/osm-logo.png')}
                            style={styles.logoOsm}
                            resizeMode="contain"
                          />
                        </View>
              <Text style={styles.title}>Crie sua conta</Text>
              <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
            </View>

            {/* Formulário */}
            <View style={styles.form}>
              {/* Campo Nome */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor="#fff"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              {/* Campo Email */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="mail" size={20} color="#fff" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#fff"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              {/* Campo Data de Nascimento com Seletor */}
              <TouchableOpacity onPress={() => setShowDatePicker(true)} disabled={isLoading}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="calendar" size={20} color="#fff" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Data de Nascimento (DD/MM/AAAA)"
                    placeholderTextColor="#fff"
                    value={dobDisplay}
                    editable={false} // Impede que o usuário digite no campo
                  />
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dob}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {/* Radio CPF/CNPJ e Campo Documento */}
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => {
                    setDocType('cpf');
                    setDocument(''); // Limpa o campo ao mudar o tipo
                  }}
                >
                  <Ionicons
                    name={docType === 'cpf' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color="#4a7f37"
                  />
                  <Text style={styles.radioText}>CPF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => {
                    setDocType('cnpj');
                    setDocument(''); // Limpa o campo ao mudar o tipo
                  }}
                >
                  <Ionicons
                    name={docType === 'cnpj' ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color="#4a7f37"
                  />
                  <Text style={styles.radioText}>CNPJ</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="document" size={20} color="#fff" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={docType === 'cpf' ? 'Digite seu CPF' : 'Digite seu CNPJ'}
                  placeholderTextColor="#fff"
                  value={document}
                  onChangeText={formatDocument} // Usa a nova função de formatação
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>

              {/* Campo Telefone */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="call" size={20} color="#fff" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Telefone"
                  placeholderTextColor="#fff"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>

              {/* Campo Senha */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="lock-closed" size={20} color="#fff" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#fff"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              {/* Campo Confirmar Senha */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="lock-closed" size={20} color="#fff" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar Senha"
                  placeholderTextColor="#fff"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              {/* Botão de Cadastro */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Cadastrar</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Link para Login */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Já tem uma conta?</Text>
              <TouchableOpacity onPress={() => router.navigate('login')} disabled={isLoading}>
                <Text style={styles.loginLink}>Faça login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
  },
  logo: {
    width: 120,
    height: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a7f37',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a7f37',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a7f37',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#4a7f37',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    color: '#fff',
    
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    color: '#fff',
    
  },
  radioText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4a7f37',
  },
  registerButton: {
    backgroundColor: '#4a7f37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',

  },
  loginLinkText: {
    color: '#4a7f37',
    marginRight: 5,
  },
  loginLink: {
    color: '#4a7f37',
    fontWeight: 'bold',
  },

  footerText: {
    color: '#4a7f37',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#4a7f37',
    fontWeight: '500',
  },
  logoOsm: {
    width: 250,
    height: 80,
    marginLeft: -40,
  },
});
