import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  return (
    <ImageBackground
      source={require('./assets/background.jpg')}
      style={styles.container}
    >
      <LinearGradient
        colors={['#052D5264', '#39934850']}
        style={{ height: '100%', width: '100%' }}>

        <View style={styles.inner_container}>
          <Text style={styles.text_lg}>App Name</Text>
          <Text style={styles.text_md}>
            app slogan ,saying,
            blah  brief description,
            hello yes welcome?
            blahanything
          </Text>
          <View></View>
        </View>

      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text_lg: {
    fontSize: 80,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    textAlign: 'left'
  },
  text_md: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    textAlign: 'right'
  },
  inner_container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 40,
    justifyContent: 'space-around'
  }
});
