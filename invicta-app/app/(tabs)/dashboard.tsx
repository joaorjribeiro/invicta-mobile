import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { LineChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(239, 75, 42, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  decimalPlaces: 0,
};

type Transacao = {
  id: string;
  descricao: string;
  valor: number;
  tipo: "Entrada" | "Saida";
  data: any;
  categoria?: string;
};

type Meta = {
  id: string;
  nome: string;
  valorMeta: number;
  valorAtual: number;
  progresso: number;
};

export default function Dashboard() {
  const router = useRouter();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [rendaPrevista, setRendaPrevista] = useState(0);
  const [limiteGastos, setLimiteGastos] = useState(0);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [despesasMensais, setDespesasMensais] = useState(new Array(12).fill(0));
  const [receitasMensais, setReceitasMensais] = useState(new Array(12).fill(0));

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      // Configurações do usuário
      const userDoc = await getDoc(doc(db, "users", user!.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setSaldoInicial(data.saldoInicial ?? 0);
        setRendaPrevista(data.rendaPrevista ?? 0);
        setLimiteGastos(data.limiteGastos ?? 0);
      }

      // Últimas 5 transações
      const qTransacoes = query(
        collection(db, "transactions"),
        where("userId", "==", user!.uid),
        orderBy("data", "desc"),
        limit(5)
      );
      const snapTransacoes = await getDocs(qTransacoes);
      const listaTransacoes: Transacao[] = [];
      let entradas = 0;
      let saidas = 0;

      snapTransacoes.forEach((d) => {
        const t = { id: d.id, ...d.data() } as Transacao;
        listaTransacoes.push(t);
      });
      setTransacoes(listaTransacoes);

      // Todas as transações pra calcular saldo e gráficos
      const qTodas = query(
        collection(db, "transactions"),
        where("userId", "==", user!.uid)
      );
      const snapTodas = await getDocs(qTodas);
      const despesas = new Array(12).fill(0);
      const receitas = new Array(12).fill(0);

      snapTodas.forEach((d) => {
        const t = d.data();
        const mes = t.data?.toDate ? t.data.toDate().getMonth() : new Date(t.data).getMonth();
        if (t.tipo === "Entrada") {
          entradas += t.valor;
          receitas[mes] += t.valor;
        } else {
          saidas += t.valor;
          despesas[mes] += t.valor;
        }
      });

      setSaldoAtual(saldoInicial + entradas - saidas);
      setDespesasMensais(despesas);
      setReceitasMensais(receitas);

      // Metas
      const qMetas = query(
        collection(db, "goals"),
        where("userId", "==", user!.uid)
      );
      const snapMetas = await getDocs(qMetas);
      const listaMetas: Meta[] = [];
      snapMetas.forEach((d) => {
        const m = d.data();
        listaMetas.push({
          id: d.id,
          nome: m.nome,
          valorMeta: m.valorMeta,
          valorAtual: m.valorAtual,
          progresso: m.valorMeta > 0 ? Math.min((m.valorAtual / m.valorMeta) * 100, 100) : 0,
        });
      });
      setMetas(listaMetas);

    } catch (e) {
      console.log("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/auth/login");
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatDate(data: any) {
    if (!data) return "";
    const date = data?.toDate ? data.toDate() : new Date(data);
    return date.toLocaleDateString("pt-BR");
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4b2a" />
      </View>
    );
  }

  const mesesLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSub}>Olá, {user?.displayName ?? "usuário"} 👋</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#ef4b2a" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Cards */}
        <View style={styles.cardsRow}>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardLabel}>Saldo Atual</Text>
            <Text style={[styles.cardValue, { color: saldoAtual >= 0 ? "#22c55e" : "#ef4b2a" }]}>
              {formatCurrency(saldoAtual)}
            </Text>
          </View>
        </View>

        <View style={styles.cardsRow}>
          <View style={[styles.card, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.cardLabel}>Receita Prevista</Text>
            <Text style={[styles.cardValue, { color: "#22c55e", fontSize: 16 }]}>
              {formatCurrency(rendaPrevista)}
            </Text>
          </View>
          <View style={[styles.card, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.cardLabel}>Limite de Gastos</Text>
            <Text style={[styles.cardValue, { color: "#ef4b2a", fontSize: 16 }]}>
              {formatCurrency(limiteGastos)}
            </Text>
          </View>
        </View>

        {/* Botão Nova Transação */}
        <TouchableOpacity
          style={styles.novaTransacaoBtn}
          onPress={() => router.push("../(tabs)/transacao")}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.novaTransacaoBtnText}>Nova Transação</Text>
        </TouchableOpacity>

        {/* Gráfico Despesas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Despesas Mensais</Text>
          <BarChart
            data={{
              labels: mesesLabels,
              datasets: [{ data: despesasMensais }],
            }}
            width={screenWidth - 48}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel="R$"
            yAxisSuffix=""
            showValuesOnTopOfBars={false}
          />
        </View>

        {/* Gráfico Receitas x Despesas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receitas x Despesas</Text>
          <LineChart
            data={{
              labels: mesesLabels,
              datasets: [
                { data: receitasMensais, color: () => "#22c55e", strokeWidth: 2 },
                { data: despesasMensais, color: () => "#ef4b2a", strokeWidth: 2 },
              ],
              legend: ["Receitas", "Despesas"],
            }}
            width={screenWidth - 48}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            bezier
          />
        </View>

        {/* Metas */}
        {metas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metas Financeiras</Text>
            {metas.map((meta) => (
              <View key={meta.id} style={styles.metaItem}>
                <View style={styles.metaHeader}>
                  <Text style={styles.metaNome}>{meta.nome}</Text>
                  <Text style={styles.metaProgresso}>{Math.round(meta.progresso)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${meta.progresso}%` }]} />
                </View>
                <Text style={styles.metaValores}>
                  {formatCurrency(meta.valorAtual)} / {formatCurrency(meta.valorMeta)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Últimas Transações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas Transações</Text>
          {transacoes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>Nenhuma transação ainda.</Text>
              <Text style={styles.emptySubText}>Registre sua primeira transação!</Text>
            </View>
          ) : (
            transacoes.map((t) => (
              <View key={t.id} style={styles.transacaoItem}>
                <View style={styles.transacaoIcon}>
                  <Ionicons
                    name={t.tipo === "Entrada" ? "arrow-up-circle" : "arrow-down-circle"}
                    size={28}
                    color={t.tipo === "Entrada" ? "#22c55e" : "#ef4b2a"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.transacaoDesc}>{t.descricao}</Text>
                  <Text style={styles.transacaoData}>{formatDate(t.data)}</Text>
                </View>
                <Text style={[
                  styles.transacaoValor,
                  { color: t.tipo === "Entrada" ? "#22c55e" : "#ef4b2a" }
                ]}>
                  {t.tipo === "Entrada" ? "+" : "-"}{formatCurrency(t.valor)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#ef4b2a",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  headerSub: { color: "#fff", opacity: 0.9, fontSize: 13, marginTop: 2 },
  logoutBtn: { padding: 8, backgroundColor: "#fff", borderRadius: 8 },
  cardsRow: { flexDirection: "row", paddingHorizontal: 16, marginTop: 16 },
  card: {
    backgroundColor: "#fff", padding: 16, borderRadius: 12,
    elevation: 2, borderWidth: 1, borderColor: "#f0f0f0",
  },
  cardLabel: { color: "#888", fontSize: 13 },
  cardValue: { fontSize: 22, fontWeight: "bold", marginTop: 4 },
  novaTransacaoBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#ef4b2a", margin: 16, padding: 14,
    borderRadius: 10, gap: 8,
  },
  novaTransacaoBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  section: {
    backgroundColor: "#fff", margin: 16, marginTop: 0,
    padding: 16, borderRadius: 12, elevation: 2,
    borderWidth: 1, borderColor: "#f0f0f0",
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12, color: "#222" },
  chart: { borderRadius: 8, marginLeft: -8 },
  metaItem: { marginBottom: 16 },
  metaHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  metaNome: { fontSize: 14, color: "#333", fontWeight: "500" },
  metaProgresso: { fontSize: 14, color: "#ef4b2a", fontWeight: "bold" },
  progressBar: { height: 8, backgroundColor: "#f0f0f0", borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: "#ef4b2a", borderRadius: 4 },
  metaValores: { fontSize: 12, color: "#888", marginTop: 4 },
  emptyState: { alignItems: "center", padding: 24 },
  emptyText: { color: "#888", fontSize: 15, marginTop: 8 },
  emptySubText: { color: "#bbb", fontSize: 13, marginTop: 4 },
  transacaoItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", gap: 12,
  },
  transacaoIcon: { width: 36 },
  transacaoDesc: { fontSize: 14, color: "#222", fontWeight: "500" },
  transacaoData: { fontSize: 12, color: "#888", marginTop: 2 },
  transacaoValor: { fontSize: 14, fontWeight: "bold" },
});