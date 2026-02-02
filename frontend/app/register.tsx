import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import LogoCarousel from '../components/LogoCarousel'
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal, 
  Platform,
  SafeAreaView,
  ScrollView, 
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

// --- Componente de Indicador de Força de Senha ---
const PasswordStrengthIndicator = ({ password }) => {
    const scorePassword = (pass) => {
        let score = 0;
        if (!pass) return 0;
        
        if (pass.length >= 8) score += 1;
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
        if (/\d/.test(pass)) score += 1;
        if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

        return score;
    };

    const score = scorePassword(password);
    let color = '#ccc';
    let text = 'Fraca';

    if (score === 1) {
        color = '#ff4d4f';
        text = 'Fraca';
    } else if (score === 2) {
        color = '#ffc53d';
        text = 'Média';
    } else if (score >= 3) {
        color = '#52c41a';
        text = 'Forte';
    }
    
    if (password.length === 0) return null;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4, marginBottom: 8 }}>
            <View style={{ height: 5, flex: 1, backgroundColor: '#eee', borderRadius: 5 }}>
                <View style={{ width: `${score * 25}%`, height: '100%', backgroundColor: color, borderRadius: 5 }} />
            </View>
            <Text style={{ marginLeft: 10, fontSize: 12, color: color, fontWeight: 'bold' }}>
                {text}
            </Text>
        </View>
    );
};
// ----------------------------------------------------------

// --- Componente de Requisitos de Senha ---
const PasswordRequirements = ({ password, confirmPassword }) => {
    const isMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

    const requirements = [
        { label: 'Pelo menos 8 caracteres', met: isMinLength },
        { label: 'Uma letra maiúscula', met: hasUpperCase },
        { label: 'Um caractere especial', met: hasSpecialChar },
    ];

    const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
    const showMatchRequirement = confirmPassword.length > 0;

    return (
        <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Requisitos de senha:</Text>
            
            {requirements.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                    <Ionicons 
                        name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={req.met ? '#52c41a' : '#aaa'}
                        style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.requirementText, req.met ? styles.requirementMet : styles.requirementPending]}>
                        {req.label}
                    </Text>
                </View>
            ))}

            {showMatchRequirement && (
                <View style={styles.requirementItem}>
                    <Ionicons
                        name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={passwordsMatch ? '#52c41a' : '#ff4d4f'}
                        style={{ marginRight: 8 }}
                    />
                    <Text style={[
                        styles.requirementText, 
                        { fontWeight: 'bold' },
                        passwordsMatch ? styles.requirementMet : styles.requirementError
                    ]}>
                        {passwordsMatch ? 'As senhas coincidem!' : 'As senhas não coincidem.'}
                    </Text>
                </View>
            )}
        </View>
    );
};
// ----------------------------------------------------


export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dobDisplay, setDobDisplay] = useState(''); 
  const [docType, setDocType] = useState('cpf');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signUp, isLoading } = useAuth();
  const router = useRouter();
  
  const formatDob = (text) => {
    let cleaned = text.replace(/\D/g, ''); 
    let formatted = '';

    if (cleaned.length > 0) formatted += cleaned.substring(0, 2);
    if (cleaned.length >= 3) formatted += '/' + cleaned.substring(2, 4);
    if (cleaned.length >= 5) formatted += '/' + cleaned.substring(4, 8);

    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }
    
    setDobDisplay(formatted);
  };

  const formatDocument = (text) => {
    let formattedText = text.replace(/\D/g, '');
    if (docType === 'cpf') {
      if (formattedText.length > 9) {
        formattedText = formattedText.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (formattedText.length > 6) {
        formattedText = formattedText.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (formattedText.length > 3) {
        formattedText = formattedText.replace(/(\d{3})(\d{3})/, '$1.$2');
      }
      formattedText = formattedText.substring(0, 14);
    } else {
      if (formattedText.length > 12) {
        formattedText = formattedText.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      } else if (formattedText.length > 8) {
        formattedText = formattedText.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
      } else if (formattedText.length > 5) {
        formattedText = formattedText.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (formattedText.length > 2) {
        formattedText = formattedText.replace(/(\d{2})(\d{3})/, '$1.$2');
      }
      formattedText = formattedText.substring(0, 18);
    }
    setDocument(formattedText);
  };

  const handleRegister = async () => {
    if (!name || !email || !dobDisplay || !document || !phone || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    // Validação da data digitada
    const dateParts = dobDisplay.split('/');
    if (dateParts.length !== 3 || dateParts[0].length !== 2 || dateParts[1].length !== 2 || dateParts[2].length !== 4) {
        Alert.alert('Erro', 'Formato de Data de Nascimento inválido. Use DD/MM/AAAA.');
        return;
    }

    // Converter para ISO (AAAA-MM-DD)
    const dobISO = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    // Validação simples
    const d = new Date(dobISO);
    if (isNaN(d.getTime())) {
      Alert.alert('Erro', 'Data de Nascimento inválida.');
      return;
    }

    // Requisitos da senha
    const isMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

    if (!isMinLength || !hasUpperCase || !hasSpecialChar) {
      Alert.alert(
        'Erro',
        'A senha não atende aos requisitos mínimos (8 caracteres, letra maiúscula, caractere especial).'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    const registrationData = {
      name,
      email,
      dob: dobISO, // <- AQUI AGORA ESTÁ CORRETO
      docType,
      document,
      phone,
      password,
    };

    try {
      await signUp(registrationData);
      router.replace('login');
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
            
            {/* Header */}
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

            {/* Form */}
            <View style={styles.form}>
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

              {/* Data de nascimento */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="calendar" size={20} color="#fff" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Data de Nascimento (DD/MM/AAAA)"
                  placeholderTextColor="#fff"
                  value={dobDisplay}
                  onChangeText={formatDob}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!isLoading}
                />
              </View>

              {/* CPF / CNPJ */}
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => {
                    setDocType('cpf');
                    setDocument('');
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
                    setDocument('');
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
                  onChangeText={formatDocument}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>

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

              {/* Senha */}
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

              {/* Confirmar Senha */}
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

              <PasswordStrengthIndicator password={password} />
              <PasswordRequirements password={password} confirmPassword={confirmPassword} />

              {/* Botão */}
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

// === Styles (idênticos aos seus) ===

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1 },
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
    paddingBottom: 50,
  },
  header: { alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a7f37',
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: '#4a7f37', textAlign: 'center' },
  form: { flex: 1, justifyContent: 'center', paddingVertical: 20 },
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
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#fff', paddingVertical: 16 },
  eyeIcon: { padding: 8 },
  radioGroup: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  radioText: { marginLeft: 8, fontSize: 16, color: '#4a7f37' },
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
  loginLinkText: { color: '#4a7f37', marginRight: 5 },
  loginLink: { color: '#4a7f37', fontWeight: 'bold' },
  logoOsm: {
    width: 250,
    height: 80,
    marginLeft: -40,
  },

  // --- Regras de senha ---
  requirementsContainer: { marginTop: 8, marginBottom: 16, paddingHorizontal: 8 },
  requirementsTitle: { fontSize: 14, color: '#4a7f37', marginBottom: 4, fontWeight: 'bold' },
  requirementItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  requirementText: { fontSize: 14 },
  requirementMet: { color: '#52c41a' },
  requirementPending: { color: '#aaa' },
  requirementError: { color: '#ff4d4f' },
});
