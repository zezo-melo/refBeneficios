import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '@/components/Header';

export default function UpdateProfileScreen() {
  const { user, updateProfile, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [dob, setDob] = useState(new Date());
  const [dobDisplay, setDobDisplay] = useState('');
  const [docType, setDocType] = useState('cpf');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  
  // Função para carregar os dados do usuário ao abrir a tela
  useEffect(() => {
    if (user && user.profile) {
      setName(user.profile.name || '');
      // Se a data de nascimento existe, formata para exibição
      if (user.profile.dob) {
        const date = new Date(user.profile.dob);
        setDob(date);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        setDobDisplay(formattedDate);
      }
      setDocType(user.profile.docType || 'cpf');
      setDocument(user.profile.document || '');
      setPhone(user.profile.phone || '');
    }
  }, [user]);

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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDob(selectedDate);
      const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
      setDobDisplay(formattedDate);
    }
  };

  const handleUpdate = async () => {
    if (!name || !dob || !document || !phone) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const updatedData = {
      name,
      dob: dob.toISOString(), // Salva a data no formato ISO
      docType,
      document,
      phone,
    };

    try {
      await updateProfile(updatedData);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      router.back(); // Volta para a tela anterior
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao atualizar o perfil. Tente novamente.');
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo e Título */}
            <View style={styles.header}>
              <Text style={styles.title}>Atualizar Perfil</Text>
              <Text style={styles.subtitle}>Altere suas informações da conta</Text>
            </View>

            {/* Formulário */}
            <View style={styles.form}>
              {/* Campo Nome */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="person" size={20} color="#4a7f37" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              {/* Campo Email - não editável */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="mail" size={20} color="#4a7f37" />
                </View>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={user?.email || ''} // Exibe o email do usuário logado
                  editable={false}
                />
              </View>

              {/* Campo Data de Nascimento com Seletor */}
              <TouchableOpacity onPress={() => setShowDatePicker(true)} disabled={isLoading}>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="calendar" size={20} color="#4a7f37" />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Data de Nascimento (DD/MM/AAAA)"
                    placeholderTextColor="#999"
                    value={dobDisplay}
                    editable={false}
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
                    setDocument('');
                  }}
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  <Ionicons name="document" size={20} color="#4a7f37" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={docType === 'cpf' ? 'Digite seu CPF' : 'Digite seu CNPJ'}
                  placeholderTextColor="#999"
                  value={document}
                  onChangeText={formatDocument}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>

              {/* Campo Telefone */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Ionicons name="call" size={20} color="#4a7f37" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Telefone"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>

              {/* Botão de Atualizar */}
              <TouchableOpacity
                style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
                onPress={handleUpdate}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.updateButtonText}>Salvar</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </>
                )}
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
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
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
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 16,
  },
  inputDisabled: {
    backgroundColor: '#e9ecef',
    color: '#999',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
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
  updateButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
