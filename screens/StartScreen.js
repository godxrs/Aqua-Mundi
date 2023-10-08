import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StackActions } from '@react-navigation/native';

export default function StartScreen({ navigation }) {
    const [location, setLocation] = useState()

    const getPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync()
        const location = await Location.getCurrentPositionAsync()
        setLocation(location)

        if (status === 'granted') {
            navigation.navigate("Feed", { location: location });
        }
    }

    const navFeed = async () => {
        if (location != undefined) {
            navigation.navigate("Feed", { location: location });
        } else {
            getPermission()
        }
    }

    return (
        <ImageBackground
            source={require('../assets/background.jpg')}
            style={styles.container}
        >
            <LinearGradient
                colors={['#052D5296', '#39934896']}
                style={{ height: '100%', width: '100%' }}>

                <View style={styles.inner_container}>
                    <Text style={styles.text_lg}>App Name</Text>
                    <Text style={styles.text_md}>
                        app slogan ,saying,
                        blah  brief description,
                        hello yes welcome?
                        blahanything
                    </Text>
                    <TouchableOpacity onPress={() => navFeed()} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 30 }}>
                        <Text style={styles.text_md}>Get Started</Text>
                        <Image
                            style={{ width: 75, height: 75 }}
                            source={require('../assets/right_arrow.png')}
                            contentFit="cover"
                            transition={1000}
                        />
                    </TouchableOpacity>
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
