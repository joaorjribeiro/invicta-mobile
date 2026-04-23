import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type SectionRefs = {
  sobre: React.RefObject<View | null>;
  servicos: React.RefObject<View | null>;
  equipe: React.RefObject<View | null>;
};

/* HEADER / NAVBAR */
export function Titulo({ scrollRef, sectionRefs }: { scrollRef: React.RefObject<ScrollView | null>, sectionRefs: SectionRefs }) {
  const scrollTo = (ref: React.RefObject<View | null>) => {
    ref.current?.measureLayout(
      scrollRef.current as any,
      (x, y) => { scrollRef.current?.scrollTo({ y, animated: true }); },
      () => {}
    );
  };

  return (
    <View style={styles.header}>
      <Text style={styles.logo}>Invicta Finanças</Text>
      <View style={styles.menu}>
        <TouchableOpacity onPress={() => scrollTo(sectionRefs.sobre)}>
          <Text style={styles.menuItem}>Sobre</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollTo(sectionRefs.servicos)}>
          <Text style={styles.menuItem}>Serviços</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* HERO */
export function BemVindo() {
  return (
    <View style={styles.hero}>
      <Text style={styles.title}>Bem-vindo à Invicta Finanças</Text>
      <Text style={styles.subtitle}>
        Uma solução simples e prática para gestão financeira pessoal.
      </Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* SOBRE */
export function Sobre({ sectionRef }: { sectionRef: React.RefObject<View | null> }) {
  return (
    <View ref={sectionRef} style={styles.section}>
      <Text style={styles.sectionTitle}>Sobre o Projeto</Text>
      <Text style={styles.sectionText}>
        A <Text style={{ fontWeight: "bold" }}>Invicta Finanças</Text> é um projeto acadêmico criado por estudantes
        universitários com o objetivo de desenvolver uma ferramenta intuitiva
        para controle financeiro pessoal.
      </Text>
      <Text style={styles.sectionText}>
        O projeto foi pensado para aplicar na prática conceitos de programação e
        finanças estudados na graduação.
      </Text>
      <View style={styles.badgeRow}>
        {["Educação", "Simplicidade", "Acessibilidade"].map((b) => (
          <View key={b} style={styles.badge}>
            <Text style={styles.badgeText}>{b}</Text>
          </View>
        ))}
      </View>
      <View style={styles.sobreCard}>
        <Ionicons name="cash-outline" size={48} color="#ef4b2a" />
        <Text style={styles.sobreCardText}>
          Facilitando o controle das finanças pessoais de forma prática e educativa.
        </Text>
      </View>
    </View>
  );
}

/* SERVIÇOS */
export function Servicos({ sectionRef }: { sectionRef: React.RefObject<View | null> }) {
  const items = [
    { icon: "trending-up-outline" as const, title: "Investimentos", desc: "Monitore e cresça seus investimentos com facilidade." },
    { icon: "card-outline" as const, title: "Controle de Gastos", desc: "Acompanhe suas despesas e mantenha seu orçamento equilibrado." },
    { icon: "bar-chart-outline" as const, title: "Relatórios", desc: "Visualize gráficos e relatórios detalhados de suas finanças." },
  ];

  return (
    <View ref={sectionRef} style={styles.servicesSection}>
      <Text style={styles.servicesTitle}>Serviços</Text>
      <View style={styles.cardsContainer}>
        {items.map((item) => (
          <View key={item.title} style={styles.card}>
            <Ionicons name={item.icon} size={36} color="#ef4b2a" />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* FOOTER */
export function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerTitle}>Invicta Finanças</Text>
      <Text style={styles.footerText}>
        Facilitando o controle das finanças pessoais de forma prática e educativa.
      </Text>
      <Text style={styles.footerCopy}>
        © 2026 Invicta Finanças — Projeto acadêmico.
      </Text>
    </View>
  );
}

/* ESTILOS */
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0a0706",
    padding: 20,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { color: "#ef4b2a", fontSize: 18, fontWeight: "bold" },
  menu: { flexDirection: "row", gap: 20 },
  menuItem: { color: "#fff", fontSize: 14 },

  hero: {
    backgroundColor: "#ef4b2a",
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { color: "#fff", textAlign: "center", marginBottom: 24, lineHeight: 22 },
  buttons: { flexDirection: "row", gap: 16 },
  button: {
    borderWidth: 2, borderColor: "#fff",
    paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },

  section: { padding: 30, backgroundColor: "#fff" },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  sectionText: { marginBottom: 12, color: "#555", lineHeight: 22 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 20 },
  badge: { backgroundColor: "#ef4b2a22", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  badgeText: { color: "#ef4b2a", fontWeight: "600", fontSize: 13 },
  sobreCard: {
    backgroundColor: "#ef4b2a11", borderRadius: 16,
    padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#e5e5e5",
  },
  sobreCardText: { color: "#555", textAlign: "center", marginTop: 12, lineHeight: 20 },

  servicesSection: { padding: 30, backgroundColor: "#f3f3f3" },
  servicesTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  cardsContainer: { gap: 16 },
  card: {
    backgroundColor: "#fff", padding: 24, borderRadius: 16,
    alignItems: "center", elevation: 3, borderWidth: 1, borderColor: "#e5e5e5",
  },
  cardTitle: { fontWeight: "bold", fontSize: 16, marginTop: 10, marginBottom: 6 },
  cardDesc: { color: "#666", textAlign: "center", lineHeight: 20 },

  footer: { backgroundColor: "#0a0706", padding: 30, alignItems: "center" },
  footerTitle: { color: "#ef4b2a", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  footerText: { color: "#ccc", textAlign: "center", marginBottom: 12, lineHeight: 20 },
  footerCopy: { color: "#666", fontSize: 12 },
});