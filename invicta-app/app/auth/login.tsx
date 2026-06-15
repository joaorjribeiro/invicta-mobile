import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin() {
    setErro("");
    if (!email.trim() || !senha.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, senha);

      // Verifica se é primeiro acesso (valores ainda zerados)
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data();
      const primeiroAcesso =
        !data ||
        (!data.saldoInicial && !data.rendaPrevista && !data.limiteGastos);

      if (primeiroAcesso) {
        router.replace("/(tabs)/valores");
      } else {
        router.replace("/(tabs)/dashboard");
      }
    } catch {
      setErro("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.titulo}>Invicta Finanças</Text>
        <Text style={styles.sub}>Acesse sua conta</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#999"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Ionicons
              name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/cadastro")}>
          <Text style={styles.link}>
            Não tem conta? <Text style={styles.linkDestaque}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#ef4b2a",
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  titulo: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  sub: { color: "#fff", opacity: 0.9, marginTop: 6, fontSize: 14 },
  form: { padding: 24, gap: 16 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 10,
    gap: 10,
  },
  inputIcon: { width: 24 },
  input: { flex: 1, fontSize: 15, color: "#222" },
  erro: { color: "#ef4b2a", textAlign: "center", fontSize: 13 },
  btn: {
    backgroundColor: "#ef4b2a",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: { color: "#666", textAlign: "center", marginTop: 8, fontSize: 14 },
  linkDestaque: { color: "#ef4b2a", fontWeight: "bold" },
});