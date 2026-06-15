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
  ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Regras de senha
  const hasMinLength = senha.length >= 8;
  const hasUpper = /[A-Z]/.test(senha);
  const hasLower = /[a-z]/.test(senha);
  const hasNumber = (senha.match(/\d/g) || []).length >= 2;
  const hasSpecial = /[@$!%*?&.#_\-]/.test(senha);

  const isSenhaValida =
    hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const senhasConferem = senha === confirmar && confirmar.length > 0;

  function Requisito({ valido, texto }: { valido: boolean; texto: string }) {
    return (
      <View style={styles.requisito}>
        <MaterialCommunityIcons
          name={valido ? "check-circle" : "close-circle"}
          size={16}
          color={valido ? "#22c55e" : "#aaa"}
        />
        <Text style={[styles.requisitoText, valido && styles.requisitoValido]}>
          {texto}
        </Text>
      </View>
    );
  }

  async function handleCadastro() {
    setErro("");

    if (!nome.trim() || !email.trim() || !senha.trim() || !confirmar.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (!isSenhaValida) {
      setErro("Sua senha não atende os requisitos.");
      return;
    }
    if (!senhasConferem) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, senha);
      await updateProfile(user, { displayName: nome });
      await setDoc(doc(db, "users", user.uid), {
        nome,
        email,
        createdAt: serverTimestamp(),
        saldoInicial: 0,
        rendaPrevista: 0,
        limiteGastos: 0,
      });
      router.replace("/auth/login");
    } catch (error: any) {
      const msg =
        error.code === "auth/email-already-in-use"
          ? "Esse email já está cadastrado."
          : error.code === "auth/invalid-email"
          ? "Email inválido."
          : "Erro ao criar conta. Tente novamente.";
      setErro(msg);
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
          <Text style={styles.titulo}>Criar Conta</Text>
          <Text style={styles.sub}>Comece sua jornada financeira</Text>
        </View>

        <View style={styles.form}>
          {/* Nome */}
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

          {/* Email */}
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

          {/* Senha */}
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
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Requisitos */}
          {senha.length > 0 && (
            <View style={styles.requisitosBox}>
              <Requisito valido={hasMinLength} texto="8 caracteres" />
              <Requisito valido={hasUpper} texto="1 letra maiúscula" />
              <Requisito valido={hasLower} texto="1 letra minúscula" />
              <Requisito valido={hasNumber} texto="2 números" />
              <Requisito valido={hasSpecial} texto="1 símbolo (@$!%*?&.#_-)" />
            </View>
          )}

          {/* Confirmar senha */}
          <View style={styles.inputWrapper}>
            <Ionicons name="key-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              placeholderTextColor="#999"
              secureTextEntry={!mostrarConfirmar}
              value={confirmar}
              onChangeText={setConfirmar}
            />
            <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
              <Ionicons
                name={mostrarConfirmar ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {confirmar.length > 0 && (
            <Text style={[styles.matchText, !senhasConferem && styles.noMatchText]}>
              {senhasConferem ? "✓ Senhas coincidem" : "✗ Senhas não coincidem"}
            </Text>
          )}

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <TouchableOpacity
            style={[
              styles.btn,
              (!isSenhaValida || !senhasConferem || loading) && styles.btnDisabled,
            ]}
            onPress={handleCadastro}
            disabled={loading || !isSenhaValida || !senhasConferem}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.link}>
              Já tem uma conta? <Text style={styles.linkDestaque}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  requisitosBox: {
    backgroundColor: "#fdf3f1",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f5d5cf",
    gap: 6,
  },
  requisito: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requisitoText: { fontSize: 13, color: "#aaa" },
  requisitoValido: { color: "#22c55e", fontWeight: "500" },
  matchText: {
    color: "#22c55e",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  noMatchText: {
    color: "#ef4b2a",
  },
  erro: { color: "#ef4b2a", textAlign: "center", fontSize: 13 },
  btn: {
    backgroundColor: "#ef4b2a",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: { color: "#666", textAlign: "center", marginTop: 8, fontSize: 14 },
  linkDestaque: { color: "#ef4b2a", fontWeight: "bold" },
});