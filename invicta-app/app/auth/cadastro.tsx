import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert, ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "expo-router";
import { auth, db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";

export default function Cadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCadastro() {
    console.log("chamou", { nome, email, senha, confirmar });
    if (!nome || !email || !senha || !confirmar) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    if (senha !== confirmar) {
      Alert.alert("Erro", "As senhas não conferem.");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Erro", "A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      console.log("tentando criar usuário...");
      const { user } = await createUserWithEmailAndPassword(auth, email, senha);
      console.log("usuário criado:", user.uid);
      await updateProfile(user, { displayName: nome });
      console.log("profile atualizado");
      await setDoc(doc(db, "users", user.uid), {
        nome,
        email,
        createdAt: serverTimestamp(),
        saldoInicial: 0,
        rendaPrevista: 0,
        limiteGastos: 0,
      });
      console.log("firestore salvo");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log("ERRO:", error.code, error.message);
      const msg =
        error.code === "auth/email-already-in-use"
          ? "Esse email já está cadastrado."
          : error.code === "auth/invalid-email"
          ? "Email inválido."
          : "Erro ao criar conta. Tente novamente.";
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
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Criar Conta</Text>
          <Text style={styles.headerSub}>Comece sua jornada financeira</Text>
        </View>
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
            />
          </View>
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
              placeholder="Senha (mín. 6 caracteres)"
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
          <View style={styles.inputWrapper}>
            <Ionicons name="key-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              placeholderTextColor="#999"
              secureTextEntry={!mostrarSenha}
              value={confirmar}
              onChangeText={setConfirmar}
            />
          </View>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCadastro}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Cadastrar</Text>
            }
          </TouchableOpacity>
          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={styles.link}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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