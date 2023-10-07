import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StackActions } from '@react-navigation/native';
import { TextInput } from 'react-native';

export default function FeedScreen({ navigation }) {
    const [location, setLocation] = useState()

    const getPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
            console.log('Permission not granted')
            return
        }
        const location = await Location.getCurrentPositionAsync()
        setLocation(location)
    }

    const navFeed = async () => {
        if (location != undefined) {
            navigation.dispatch(
                StackActions.replace("Feed")
            )
        } else {
            getPermission()
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.topSearch}>
                <LinearGradient colors={['#062E5259', '#062E52FF']} style={styles.gradientContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={"Search for a location..."}
                    />
                    <Image
                        style={styles.magnifyingGlass}
                        source={require('../assets/magnifying_glass.png')}
                        contentFit="cover"
                        transition={1000}
                    />
                </LinearGradient>
            </View>
            <View style={styles.feed}>
                <View style={styles.item}>
                    <Text>Feed</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#C2BAB1'
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
    topSearch: {
        flexBasis: 100,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    gradientContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        width: '90%',
        height: '50%',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingLeft: 20,
        paddingRight: 20,
        fontSize: 16,
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
    },
    magnifyingGlass: {
        position: 'absolute',
        width: 25,
        height: 25,
        right: 30,
    },
    feed: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 20,
        gap: 20
    }
,
    item: {
        flexBasis: 30,
        backgroundColor: '#CAF0F8',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        height: 100,
    }
});
