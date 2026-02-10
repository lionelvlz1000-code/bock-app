import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert, BackHandler, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const FRASES_EPICAS = [
  "Si el ejercicio no te sale, no es que esté mal… es que te está probando como una relación tóxica.",
  "El examen no tiene sentimientos… si no estudias, te destruye sin pena.",
  "La vacante existe… pero no es para flojos.",
  "Si fuera fácil, tu vecino ya sería ingeniero."
];

const DATA_CURSOS = [
  { id: 'hp', nombre: 'Historia del Perú', icon: '🇵🇪' },
  { id: 'hu', nombre: 'Historia Universal', icon: '🌍' },
  { id: 'geo', nombre: 'Geografía', icon: '🏔️' },
  { id: 'lit', nombre: 'Literatura', icon: '📚' }
];

const PREGUNTAS_DB = {
  unsa: {
    hp: [{ id: 1, pregunta: "¿Cultura matriz de la costa según Tello?", opciones: ["Paracas", "Chavín", "Mochica", "Nazca"], correcta: 1 }],
  },
  unsaac: {
    hp: [{ id: 1, pregunta: "¿Inca que expandió el imperio?", opciones: ["Pachacútec", "Huayna Cápac", "Túpac Yupanqui"], correcta: 1 }],
  },
  una: {
    geo: [{ id: 1, pregunta: "¿Río que desemboca en el Titicaca?", opciones: ["Ramis", "Amazonas", "Rímac"], correcta: 0 }],
  }
};

export default function App() {
  const [cargando, setCargando] = useState(true);
  const [fase, setFase] = useState('inicio'); 
  const [uniId, setUniId] = useState(null);
  const [cursoId, setCursoId] = useState(null);
  const [progreso, setProgreso] = useState(0);
  const [monedas, setMonedas] = useState(0);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const init = async () => {
      const m = await AsyncStorage.getItem('@monedas');
      if (m) setMonedas(parseInt(m));
      let int = setInterval(() => {
        setProgreso(p => {
          if (p >= 100) { clearInterval(int); setTimeout(() => setCargando(false), 1000); return 100; }
          return p + 2;
        });
      }, 30);
    };
    init();
  }, []);

  if (cargando) return (
    <View style={styles.loader}>
      <Text style={styles.loadTitle}>BOCK: PREPARANDO VACANTE...</Text>
      <View style={styles.barBg}><MotiView animate={{width: `${progreso}%`}} style={styles.barFill}/></View>
      <Text style={styles.frase}>"{FRASES_EPICAS[Math.floor(Math.random() * FRASES_EPICAS.length)]}"</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{fase.toUpperCase()}</Text>
        <View style={styles.coin}><Text style={{color:'#f1c40f'}}>💰 {monedas}</Text></View>
      </View>

      <ScrollView contentContainerStyle={{padding: 20}}>
        {fase === 'inicio' && [
          {id:'unsa', n:'UNSA', c:'#800000'}, {id:'unsaac', n:'UNSAAC', c:'#003399'}, {id:'una', n:'UNA', c:'#006400'}
        ].map(u => (
          <TouchableOpacity key={u.id} style={[styles.card, {borderLeftColor: u.c}]} onPress={() => { setUniId(u.id); setFase('cursos'); }}>
            <Text style={[styles.cardTitle, {color: u.c}]}>{u.n}</Text>
          </TouchableOpacity>
        ))}

        {fase === 'cursos' && (
          <View style={styles.grid}>
            {DATA_CURSOS.map(c => (
              <TouchableOpacity key={c.id} style={styles.curso} onPress={() => {
                if(PREGUNTAS_DB[uniId]?.[c.id]) { setCursoId(c.id); setFase('juego'); setIndice(0); }
                else Alert.alert("Aviso", "Próximamente más preguntas.");
              }}>
                <Text style={{fontSize: 24}}>{c.icon}</Text>
                <Text style={styles.cursoTxt}>{c.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {fase === 'juego' && (
          <View>
            <Text style={styles.preg}>{PREGUNTAS_DB[uniId][cursoId][indice].pregunta}</Text>
            {PREGUNTAS_DB[uniId][cursoId][indice].opciones.map((o, i) => (
              <TouchableOpacity key={i} style={styles.opt} onPress={() => { setMonedas(m=>m+10); setFase('inicio'); }}>
                <Text style={{color: '#FFF'}}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => setFase('inicio')}><Text>🏛️</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setFase('tienda')}><Text>🛒</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => BackHandler.exitApp()}><Text>🚪</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadTitle: { color: '#f1c40f', fontSize: 10, marginBottom: 20 },
  barBg: { width: '80%', height: 2, backgroundColor: '#222' },
  barFill: { height: '100%', backgroundColor: '#f1c40f' },
  frase: { color: '#FFF', textAlign: 'center', marginTop: 30, fontStyle: 'italic' },
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { padding: 25, marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { color: '#FFF', fontWeight: 'bold' },
  coin: { backgroundColor: '#1A1A1A', padding: 8, borderRadius: 10 },
  card: { backgroundColor: '#151515', padding: 25, borderRadius: 15, marginBottom: 15, borderLeftWidth: 5 },
  cardTitle: { fontSize: 22, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  curso: { backgroundColor: '#151515', width: '48%', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  cursoTxt: { color: '#FFF', fontSize: 10, marginTop: 10 },
  preg: { color: '#FFF', fontSize: 18, textAlign: 'center', marginBottom: 20 },
  opt: { backgroundColor: '#1A1A1A', padding: 15, borderRadius: 10, marginBottom: 10 },
  footer: { height: 70, backgroundColor: '#111', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }
});
