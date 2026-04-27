import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    console.log("handleLogin chamado", { email, senha });
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      console.log("tentando login...");
      await signInWithEmailAndPassword(auth, email, senha);
      console.log("login ok, redirecionando...");
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log("ERRO:", error.code, error.message);
      const msg =
        error.code === "auth/invalid-credential"
          ? "Email ou senha incorretos."
          : "Erro ao fazer login. Tente novamente.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Entrar</Text>
        <Text style={styles.headerSub}>Acesse sua conta Invicta Finanças</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#999"
            secureTextEntry={!mostrarSenha}
            value={senha}
            onChangeText={setSenha}
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Ionicons
              name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
              size={20} color="#999"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Entrar</Text>
          }
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/cadastro')}>
            <Text style={styles.link}>Cadastrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#ef4b2a",
    paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24,
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  headerSub: { color: "#fff", opacity: 0.9, marginTop: 6 },
  form: { padding: 24, gap: 16 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    borderBottomWidth: 2, borderBottomColor: "#e5e5e5",
    paddingVertical: 10, gap: 10,
  },
  inputIcon: { width: 24 },
  input: { flex: 1, fontSize: 15, color: "#222" },
  button: {
    backgroundColor: "#ef4b2a",
    paddingVertical: 14, borderRadius: 10,
    alignItems: "center", marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  linkText: { color: "#666" },
  link: { color: "#ef4b2a", fontWeight: "bold" },
});