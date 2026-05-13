import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

export default function TransacoesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Título */}
        <Text style={styles.title}>Transações</Text>

        {/* Botão */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>＋ Nova Transação</Text>
        </TouchableOpacity>

        {/* Cabeçalho da tabela */}
        <View style={styles.tableHeader}>
          <Text style={styles.headerText}>Data</Text>
          <Text style={styles.headerText}>Descrição</Text>
          <Text style={styles.headerText}>Valor</Text>
        </View>

        {/* Área principal */}
        <View style={styles.centerArea}>
          <View style={styles.playCircle}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 25,
    marginTop: 10,
  },

  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 25,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  tableHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 15,

    flexDirection: 'row',
    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  headerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },

  centerArea: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  playCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#bdbdbd',

    alignItems: 'center',
    justifyContent: 'center',
  },

  playIcon: {
    fontSize: 60,
    color: '#fff',
    marginLeft: 8,
  },
});