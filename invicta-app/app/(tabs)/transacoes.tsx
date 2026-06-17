import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Transacao = {
  id: string;
  descricao: string;
  valor: number;
  tipo: "Entrada" | "Saida";
  data: any;
  categoria?: string;
};

type FiltroTipo = "Todos" | "Entrada" | "Saida";

export default function TransacoesScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtro, setFiltro] = useState<FiltroTipo>("Todos");
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"Entrada" | "Saida">("Saida");
  const [categoria, setCategoria] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(tabs)/dashboard");
      return true;
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("data", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const lista: Transacao[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            valor: Math.round(Number(data.valor) * 100) / 100,
          } as Transacao;
        });
        setTransacoes(lista);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao ouvir transações:", err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user]);

  async function handleSalvar() {
    if (!descricao.trim()) {
      Alert.alert("Atenção", "Informe a descrição.");
      return;
    }
    const valorNum =
      Math.round(parseFloat(valor.trim().replace(",", ".")) * 100) / 100;
    if (isNaN(valorNum) || valorNum <= 0) {
      Alert.alert("Atenção", "Informe um valor válido maior que zero.");
      return;
    }
    if (!user) return;
    setSalvando(true);
    try {
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        descricao: descricao.trim(),
        valor: valorNum,
        tipo,
        categoria: categoria.trim() || null,
        data: serverTimestamp(),
      });
      fecharModal();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar a transação.");
    } finally {
      setSalvando(false);
    }
  }

  function handleDeletar(id: string, descricaoItem: string) {
    Alert.alert(
      "Excluir transação",
      `Tem certeza que deseja excluir "${descricaoItem}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setDeletandoId(id);
            try {
              await deleteDoc(doc(db, "transactions", id));
            } catch (e) {
              Alert.alert("Erro", "Não foi possível excluir a transação.");
            } finally {
              setDeletandoId(null);
            }
          },
        },
      ],
    );
  }

  function fecharModal() {
    setDescricao("");
    setValor("");
    setTipo("Saida");
    setCategoria("");
    setModalVisible(false);
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatDate(data: any) {
    if (!data) return "—";
    const date = data?.toDate ? data.toDate() : new Date(data);
    return date.toLocaleDateString("pt-BR");
  }

  const transacoesFiltradas =
    filtro === "Todos"
      ? transacoes
      : transacoes.filter((t) => t.tipo === filtro);
  const totalEntradas = transacoes
    .filter((t) => t.tipo === "Entrada")
    .reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes
    .filter((t) => t.tipo === "Saida")
    .reduce((acc, t) => acc + t.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  if (user === undefined || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4b2a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transações</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
        <View style={styles.resumoContainer}>
          <View style={styles.resumoRow}>
            <View style={[styles.resumoCard, styles.resumoEntrada]}>
              <View style={styles.resumoIconWrap}>
                <Ionicons name="arrow-up-circle" size={20} color="#22c55e" />
              </View>
              <Text style={styles.resumoLabel}>Entradas</Text>
              <Text style={[styles.resumoValor, { color: "#22c55e" }]}>
                {formatCurrency(totalEntradas)}
              </Text>
            </View>
            <View style={[styles.resumoCard, styles.resumoSaida]}>
              <View style={styles.resumoIconWrap}>
                <Ionicons name="arrow-down-circle" size={20} color="#ef4b2a" />
              </View>
              <Text style={styles.resumoLabel}>Saídas</Text>
              <Text style={[styles.resumoValor, { color: "#ef4b2a" }]}>
                {formatCurrency(totalSaidas)}
              </Text>
            </View>
          </View>
          <View style={styles.saldoCard}>
            <Text style={styles.saldoLabel}>Saldo do período</Text>
            <Text
              style={[
                styles.saldoValor,
                { color: saldo >= 0 ? "#22c55e" : "#ef4b2a" },
              ]}
            >
              {saldo >= 0 ? "+" : ""}
              {formatCurrency(saldo)}
            </Text>
          </View>
        </View>

        <View style={styles.filtroContainer}>
          {(["Todos", "Entrada", "Saida"] as FiltroTipo[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroBtn, filtro === f && styles.filtroBtnAtivo]}
              onPress={() => setFiltro(f)}
            >
              <Text
                style={[
                  styles.filtroBtnText,
                  filtro === f && styles.filtroBtnTextAtivo,
                ]}
              >
                {f === "Saida" ? "Saídas" : f}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.filtroCount}>
            {transacoesFiltradas.length}{" "}
            {transacoesFiltradas.length === 1 ? "item" : "itens"}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.lista}>
          {transacoesFiltradas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={56} color="#ddd" />
              <Text style={styles.emptyText}>
                {filtro === "Todos"
                  ? "Nenhuma transação ainda."
                  : `Nenhuma ${filtro === "Entrada" ? "entrada" : "saída"} registrada.`}
              </Text>
              <Text style={styles.emptySubText}>
                Toque em + para registrar agora.
              </Text>
            </View>
          ) : (
            transacoesFiltradas.map((t) => (
              <View key={t.id} style={styles.row}>
                <View
                  style={[
                    styles.tipoIndicator,
                    {
                      backgroundColor:
                        t.tipo === "Entrada"
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(239,75,42,0.10)",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      t.tipo === "Entrada"
                        ? "arrow-up-circle"
                        : "arrow-down-circle"
                    }
                    size={16}
                    color={t.tipo === "Entrada" ? "#22c55e" : "#ef4b2a"}
                  />
                </View>
                <View style={styles.rowCenter}>
                  <Text
                    style={styles.cellDesc}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {t.descricao}
                  </Text>
                  <Text style={styles.cellData}>{formatDate(t.data)}</Text>
                  {t.categoria ? (
                    <View style={styles.categoriaTag}>
                      <Text style={styles.categoriaText} numberOfLines={1}>
                        {t.categoria}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.rowRight}>
                  <Text
                    style={[
                      styles.cellValor,
                      { color: t.tipo === "Entrada" ? "#22c55e" : "#ef4b2a" },
                    ]}
                    numberOfLines={1}
                  >
                    {t.tipo === "Entrada" ? "+" : "-"}
                    {formatCurrency(t.valor)}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeletar(t.id, t.descricao)}
                    disabled={deletandoId === t.id}
                  >
                    {deletandoId === t.id ? (
                      <ActivityIndicator size={14} color="#ccc" />
                    ) : (
                      <Ionicons name="trash-outline" size={16} color="#ccc" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 80 }} />
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={fecharModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalAlca} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Transação</Text>
              <TouchableOpacity
                onPress={fecharModal}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Tipo *</Text>
            <View style={styles.tipoRow}>
              <TouchableOpacity
                style={[
                  styles.tipoBtn,
                  tipo === "Entrada" && styles.tipoBtnActiveEntrada,
                ]}
                onPress={() => setTipo("Entrada")}
              >
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={20}
                  color={tipo === "Entrada" ? "#fff" : "#22c55e"}
                />
                <Text
                  style={[
                    styles.tipoBtnText,
                    tipo === "Entrada" && { color: "#fff" },
                  ]}
                >
                  Entrada
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tipoBtn,
                  tipo === "Saida" && styles.tipoBtnActiveSaida,
                ]}
                onPress={() => setTipo("Saida")}
              >
                <Ionicons
                  name="arrow-down-circle-outline"
                  size={20}
                  color={tipo === "Saida" ? "#fff" : "#ef4b2a"}
                />
                <Text
                  style={[
                    styles.tipoBtnText,
                    tipo === "Saida" && { color: "#fff" },
                  ]}
                >
                  Saída
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Descrição *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Aluguel, Salário, Mercado..."
              placeholderTextColor="#bbb"
              value={descricao}
              onChangeText={setDescricao}
              maxLength={60}
            />

            <Text style={styles.label}>Valor (R$) *</Text>
            <View style={styles.inputValorWrap}>
              <Text style={styles.inputPrefix}>R$</Text>
              <TextInput
                style={[styles.input, styles.inputValor]}
                placeholder="0,00"
                placeholderTextColor="#bbb"
                value={valor}
                onChangeText={(text) => setValor(text.replace(/[^0-9.,]/g, ""))}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.label}>Categoria (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Alimentação, Moradia, Transporte..."
              placeholderTextColor="#bbb"
              value={categoria}
              onChangeText={setCategoria}
              maxLength={30}
            />

            <TouchableOpacity
              style={[
                styles.salvarBtn,
                {
                  backgroundColor: tipo === "Entrada" ? "#22c55e" : "#ef4b2a",
                  opacity: salvando ? 0.75 : 1,
                },
              ]}
              onPress={handleSalvar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={
                      tipo === "Entrada"
                        ? "arrow-up-circle"
                        : "arrow-down-circle"
                    }
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.salvarBtnText}>
                    Registrar {tipo === "Entrada" ? "Entrada" : "Saída"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ef4b2a" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  header: {
    backgroundColor: "#ef4b2a",
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 8,
    padding: 6,
  },
  addBtn: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 8,
    padding: 6,
  },
  resumoContainer: { padding: 16, paddingBottom: 0 },
  resumoRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  resumoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    elevation: 2,
  },
  resumoEntrada: { borderLeftWidth: 3, borderLeftColor: "#22c55e" },
  resumoSaida: { borderLeftWidth: 3, borderLeftColor: "#ef4b2a" },
  resumoIconWrap: { marginBottom: 6 },
  resumoLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resumoValor: { fontSize: 17, fontWeight: "700" },
  saldoCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    marginBottom: 4,
  },
  saldoLabel: { fontSize: 13, color: "#888" },
  saldoValor: { fontSize: 18, fontWeight: "800" },
  filtroContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filtroBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  filtroBtnAtivo: { backgroundColor: "#ef4b2a", borderColor: "#ef4b2a" },
  filtroBtnText: { fontSize: 13, color: "#555", fontWeight: "500" },
  filtroBtnTextAtivo: { color: "#fff", fontWeight: "700" },
  filtroCount: { marginLeft: "auto", fontSize: 12, color: "#aaa" },
  lista: { flex: 1, paddingHorizontal: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 1,
    gap: 10,
  },
  tipoIndicator: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowCenter: { flex: 1, minWidth: 0 },
  cellDesc: { fontSize: 13, color: "#222", fontWeight: "600" },
  cellData: { fontSize: 11, color: "#999", marginTop: 2 },
  categoriaTag: {
    marginTop: 3,
    alignSelf: "flex-start",
    backgroundColor: "#f3f3f3",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  categoriaText: { fontSize: 10, color: "#999" },
  rowRight: { alignItems: "flex-end", flexShrink: 0, gap: 4 },
  cellValor: { fontSize: 13, fontWeight: "700" },
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 64,
    paddingHorizontal: 32,
  },
  emptyText: { color: "#999", fontSize: 15, marginTop: 14, fontWeight: "500" },
  emptySubText: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ef4b2a",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#ef4b2a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalAlca: {
    width: 40,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },
  modalCloseBtn: { backgroundColor: "#f5f5f5", borderRadius: 8, padding: 6 },
  label: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
    marginTop: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#ebebeb",
    color: "#111",
  },
  inputValorWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ebebeb",
    paddingLeft: 13,
  },
  inputPrefix: { fontSize: 15, color: "#888", marginRight: 4 },
  inputValor: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingLeft: 0,
  },
  tipoRow: { flexDirection: "row", gap: 10 },
  tipoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e5e5",
    backgroundColor: "#fafafa",
  },
  tipoBtnActiveEntrada: { backgroundColor: "#22c55e", borderColor: "#22c55e" },
  tipoBtnActiveSaida: { backgroundColor: "#ef4b2a", borderColor: "#ef4b2a" },
  tipoBtnText: { fontSize: 14, fontWeight: "600", color: "#555" },
  salvarBtn: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  salvarBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
