import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";

export default function ValoresScreen() {
  const [saldoInicial, setSaldoInicial] = useState("0,00");
  const [rendaMensal, setRendaMensal] = useState("0,00");
  const [limiteGastos, setLimiteGastos] = useState("0,00");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Título */}
        <Text style={styles.title}>Configurações de Valores</Text>

        {/* Card principal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configurar Valores Gerais</Text>

          {/* Saldo Inicial */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Saldo Inicial</Text>

            <TextInput
              style={styles.input}
              value={saldoInicial}
              onChangeText={setSaldoInicial}
              keyboardType="numeric"
            />
          </View>

          {/* Renda Mensal */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Renda Mensal Prevista</Text>

            <TextInput
              style={styles.input}
              value={rendaMensal}
              onChangeText={setRendaMensal}
              keyboardType="numeric"
            />
          </View>

          {/* Limite */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Limite de Gastos Mensais</Text>

            <TextInput
              style={styles.input}
              value={limiteGastos}
              onChangeText={setLimiteGastos}
              keyboardType="numeric"
            />
          </View>

          {/* Botão */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Salvar Valores</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 25,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    color: "#444",
    marginBottom: 8,
    fontWeight: "600",
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fafafa",
    fontSize: 16,
    color: "#222",
  },

  button: {
    backgroundColor: "#f4511e",
    height: 50,
    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
