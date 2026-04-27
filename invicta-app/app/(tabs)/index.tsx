import React, { useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Titulo, BemVindo, Sobre, Servicos, Footer } from "../../components/ui/componentesprincipal";

export default function App() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const sobreRef = useRef<View | null>(null);
  const servicosRef = useRef<View | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Titulo scrollRef={scrollRef} sectionRefs={{ sobre: sobreRef, servicos: servicosRef, equipe: sobreRef }} />
      <ScrollView ref={scrollRef}>
        <BemVindo
          onLogin={() => router.push('/auth/login')}
          onCadastro={() => router.push('/auth/cadastro')}
        />
        <Sobre sectionRef={sobreRef} />
        <Servicos sectionRef={servicosRef} />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });