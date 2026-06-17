import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function ValoresScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [rendaPrevista, setRendaPrevista] = useState("");
  const [limiteGastos, setLimiteGastos] = useState("");
  const [modalSucesso, setModalSucesso] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (user === null) {
      router.replace("/auth/login");
      return;
    }
    carregarValores(user.uid);
  }, [user]);

  async function carregarValores(uid: string) {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        setSaldoInicial(data.saldoInicial ? String(data.saldoInicial) : "");
        setRendaPrevista(data.rendaPrevista ? String(data.rendaPrevista) : "");
        setLimiteGastos(data.limiteGastos ? String(data.limiteGastos) : "");
      }
    } catch (e) {
      console.error("Erro ao carregar valores:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvar() {
    if (!user) return;
    const saldo = parseFloat(saldoInicial.replace(",", ".")) || 0;
    const renda = parseFloat(rendaPrevista.replace(",", ".")) || 0;
    const limite = parseFloat(limiteGastos.replace(",", ".")) || 0;
    setSalvando(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { saldoInicial: saldo, rendaPrevista: renda, limiteGastos: limite, updatedAt: serverTimestamp() },
        { merge: true },
      );
      setModalSucesso(true);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar os valores.");
      console.error(e);
    } finally {
      setSalvando(false);
    }
  }

  if (user === undefined || (user && loading)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4b2a" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(tabs)/dashboard")}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Valores Financeiros</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#f5f5f5" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#ef4b2a" />
            <Text style={styles.infoText}>
              Configure os valores base da sua conta. Eles são usados para calcular seu saldo e exibir alertas no dashboard.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.campo}>
              <View style={styles.campoHeader}>
                <Ionicons name="wallet-outline" size={20} color="#ef4b2a" />
                <Text style={styles.campoLabel}>Saldo Inicial</Text>
              </View>
              <Text style={styles.campoDesc}>Valor que você já tinha antes de começar a registrar transações.</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputPrefix}>R$</Text>
                <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#bbb" value={saldoInicial} onChangeText={(t) => setSaldoInicial(t.replace(/[^0-9.,]/g, ""))} keyboardType="decimal-pad" />
              </View>
            </View>

            <View style={styles.divisor} />

            <View style={styles.campo}>
              <View style={styles.campoHeader}>
                <Ionicons name="trending-up-outline" size={20} color="#22c55e" />
                <Text style={styles.campoLabel}>Renda Mensal Prevista</Text>
              </View>
              <Text style={styles.campoDesc}>Sua receita esperada por mês (salário, freelance, etc).</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputPrefix}>R$</Text>
                <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#bbb" value={rendaPrevista} onChangeText={(t) => setRendaPrevista(t.replace(/[^0-9.,]/g, ""))} keyboardType="decimal-pad" />
              </View>
            </View>

            <View style={styles.divisor} />

            <View style={styles.campo}>
              <View style={styles.campoHeader}>
                <Ionicons name="alert-circle-outline" size={20} color="#f59e0b" />
                <Text style={styles.campoLabel}>Limite de Gastos Mensais</Text>
              </View>
              <Text style={styles.campoDesc}>Valor máximo que você quer gastar por mês.</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputPrefix}>R$</Text>
                <TextInput style={styles.input} placeholder="0,00" placeholderTextColor="#bbb" value={limiteGastos} onChangeText={(t) => setLimiteGastos(t.replace(/[^0-9.,]/g, ""))} keyboardType="decimal-pad" />
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.salvarBtn, salvando && { opacity: 0.7 }]} onPress={handleSalvar} disabled={salvando}>
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.salvarBtnText}>Salvar Valores</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalSucesso} transparent animationType="fade" onRequestClose={() => setModalSucesso(false)}>
        <View style={styles.sucessoOverlay}>
          <View style={styles.sucessoCard}>
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            <Text style={styles.sucessoTitulo}>Valores salvos!</Text>
            <Text style={styles.sucessoMensagem}>
              Suas configurações financeiras foram atualizadas com sucesso.
            </Text>
            <TouchableOpacity
              style={styles.sucessoBtn}
              onPress={() => {
                setModalSucesso(false);
                router.replace("/(tabs)/dashboard");
              }}
            >
              <Text style={styles.sucessoBtnText}>Ir para o Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ef4b2a" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#ef4b2a",
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  backBtn: { backgroundColor: "rgba(255,255,255,0.22)", borderRadius: 8, padding: 6 },
  infoBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    margin: 16, marginBottom: 8, backgroundColor: "#fff3f0",
    borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: "#ef4b2a",
  },
  infoText: { flex: 1, fontSize: 13, color: "#555", lineHeight: 18 },
  card: {
    backgroundColor: "#fff", margin: 16, marginTop: 8,
    borderRadius: 16, padding: 20, elevation: 2, borderWidth: 1, borderColor: "#f0f0f0",
  },
  campo: { paddingVertical: 4 },
  campoHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  campoLabel: { fontSize: 15, fontWeight: "600", color: "#222" },
  campoDesc: { fontSize: 12, color: "#999", marginBottom: 12, lineHeight: 16 },
  inputWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#f7f7f7",
    borderRadius: 10, borderWidth: 1, borderColor: "#ebebeb", paddingLeft: 14,
  },
  inputPrefix: { fontSize: 15, color: "#888", marginRight: 4 },
  input: { flex: 1, fontSize: 15, color: "#222", padding: 13 },
  divisor: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 16 },
  salvarBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#ef4b2a", marginHorizontal: 16, padding: 16, borderRadius: 14,
  },
  salvarBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  sucessoOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  sucessoCard: { width: "100%", maxWidth: 340, backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center" },
  sucessoTitulo: { fontSize: 17, fontWeight: "bold", color: "#222", marginTop: 12 },
  sucessoMensagem: { fontSize: 13, color: "#888", textAlign: "center", marginTop: 6, marginBottom: 18, lineHeight: 18 },
  sucessoBtn: { width: "100%", backgroundColor: "#22c55e", paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  sucessoBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});