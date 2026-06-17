import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  gastoAtual: number;
  limite: number;
};

function getNivel(percentual: number) {
  if (percentual >= 100) {
    return {
      cor: "#b91c1c",
      corFundo: "#fef2f2",
      icone: "alert-circle" as const,
      titulo: "Limite excedido!",
      mensagem: "Você ultrapassou o limite de gastos definido para este mês.",
    };
  }
  if (percentual >= 90) {
    return {
      cor: "#dc2626",
      corFundo: "#fef2f2",
      icone: "alert-circle" as const,
      titulo: "Quase no limite!",
      mensagem: "Você já usou mais de 90% do seu limite de gastos mensal.",
    };
  }
  if (percentual >= 80) {
    return {
      cor: "#ef4444",
      corFundo: "#fef2f2",
      icone: "warning" as const,
      titulo: "Atenção: 80% do limite",
      mensagem:
        "Seus gastos já passaram de 80% do limite mensal. Hora de pisar no freio.",
    };
  }
  if (percentual >= 70) {
    return {
      cor: "#f97316",
      corFundo: "#fff7ed",
      icone: "warning" as const,
      titulo: "Atenção: 70% do limite",
      mensagem: "Você já comprometeu 70% do seu limite de gastos mensal.",
    };
  }
  if (percentual >= 60) {
    return {
      cor: "#f59e0b",
      corFundo: "#fffbeb",
      icone: "information-circle" as const,
      titulo: "60% do limite atingido",
      mensagem:
        "Você já usou 60% do seu limite de gastos mensal. Fique de olho.",
    };
  }
  return {
    cor: "#22c55e",
    corFundo: "#f0fdf4",
    icone: "checkmark-circle" as const,
    titulo: "Tudo sob controle",
    mensagem: "Seus gastos ainda estão dentro do limite definido para o mês.",
  };
}

export default function AlertaLimiteGastos({
  visible,
  onClose,
  gastoAtual,
  limite,
}: Props) {
  const percentual = limite > 0 ? (gastoAtual / limite) * 100 : 0;
  const nivel = getNivel(percentual);

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: nivel.corFundo }]}>
            <Ionicons name={nivel.icone} size={32} color={nivel.cor} />
          </View>

          <Text style={styles.titulo}>{nivel.titulo}</Text>
          <Text style={styles.mensagem}>{nivel.mensagem}</Text>

          <View style={styles.barraWrap}>
            <View style={styles.barraFundo}>
              <View
                style={[
                  styles.barraFill,
                  {
                    width: `${Math.min(percentual, 100)}%`,
                    backgroundColor: nivel.cor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.percentualText, { color: nivel.cor }]}>
              {Math.round(percentual)}%
            </Text>
          </View>

          <View style={styles.valoresRow}>
            <Text style={styles.valoresLabel}>Gasto no mês</Text>
            <Text style={styles.valoresValor}>
              {formatCurrency(gastoAtual)}
            </Text>
          </View>
          <View style={styles.valoresRow}>
            <Text style={styles.valoresLabel}>Limite definido</Text>
            <Text style={styles.valoresValor}>{formatCurrency(limite)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.fecharBtn, { backgroundColor: nivel.cor }]}
            onPress={onClose}
          >
            <Text style={styles.fecharBtnText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  mensagem: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 18,
  },
  barraWrap: { width: "100%", marginBottom: 16 },
  barraFundo: {
    height: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    overflow: "hidden",
  },
  barraFill: { height: 10, borderRadius: 5 },
  percentualText: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "right",
  },
  valoresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  valoresLabel: { fontSize: 13, color: "#999" },
  valoresValor: { fontSize: 13, color: "#222", fontWeight: "600" },
  fecharBtn: {
    marginTop: 16,
    width: "100%",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  fecharBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
