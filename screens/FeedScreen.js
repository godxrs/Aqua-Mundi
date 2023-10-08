import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground } from 'expo-image';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StackActions } from '@react-navigation/native';
import { TextInput } from 'react-native';
import { BlurView } from 'expo-blur';

export default function FeedScreen({ navigation, route }) {
    const [location, setLocation] = useState()
    const [bodiesOfWater, setBodiesOfWater] = useState();

    const getWaterBodies = (lat, lon, radius) => {
        const query = `[out:json];
        (
          way["natural"="water"]
          (around:${radius},${lat},${lon});
          relation["natural"="water"]
          (around:${radius},${lat},${lon});
        );
        out geom;`;

        const overpassUrl = 'https://overpass-api.de/api/interpreter';

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const params = new URLSearchParams();
        params.append('data', query);

        fetch(overpassUrl, {
            method: 'POST',
            headers: headers,
            body: params.toString()
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP request failed');
                }
                return response.json();
            })
            .then(data => {
                const waterFeatures = [];

                const elements = data.elements;
                for (const element of elements) {
                    if (element.tags && element.tags.name) {
                        waterFeatures.push(element);
                    }
                }

                setBodiesOfWater(waterFeatures);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                return [];
            });
    }

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

    useEffect(() => {
        getWaterBodies(route.params.location.coords.latitude, route.params.location.coords.longitude, 6000)
    }, [])

    return (
        <View style={styles.container}>
            <ImageBackground style={styles.topSearch} source={require('../assets/jelly_fish.jpg')}>
                <LinearGradient colors={['#062E5259', '#062E52E1']} style={styles.gradientContainer}>
                    <View style={styles.fun_fact}>
                        <Text>Test</Text>
                    </View>
                    <View style={styles.input_container}>
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
                    </View>
                </LinearGradient>
            </ImageBackground>
            <ScrollView contentContainerStyle={styles.feed}>
                {bodiesOfWater && bodiesOfWater.map((bodyOfWater, index) => {

                    minLatitude = bodyOfWater.bounds.minlat
                    minLongitude = bodyOfWater.bounds.minlon

                    maxLatitude = bodyOfWater.bounds.maxlat
                    maxLongitude = bodyOfWater.bounds.maxlon

                    const centerLatitude = (minLatitude + maxLatitude) / 2;
                    const centerLongitude = (minLongitude + maxLongitude) / 2;

                    const latitudeDelta = maxLatitude - minLatitude;
                    const longitudeDelta = maxLongitude - minLongitude;

                    const initialRegion = {
                        latitude: centerLatitude,
                        longitude: centerLongitude,
                        latitudeDelta,
                        longitudeDelta,
                    };

                    return (
                        <View key={index} style={styles.item}>
                            <Text style={styles.text_md}>{bodyOfWater.tags.name}</Text>

                            <View style={{ borderRadius: 15, overflow: 'hidden', flex: 1 }}>
                                <MapView style={styles.map} initialRegion={initialRegion} scrollEnabled={false} zoomEnabled={false} />
                            </View>
                        </View>
                    )

                })}
            </ScrollView>
            <View style={styles.outer_controls}>
                <BlurView intensity={80} style={styles.inner_controls} tint="light">
                    <TouchableOpacity>
                        <Image
                            style={styles.icon}
                            source={require('../assets/menu.png')}
                            contentFit="cover"
                            transition={1000}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image
                            style={styles.icon}
                            source={require('../assets/magnifying_glass.png')}
                            contentFit="cover"
                            transition={1000}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image
                            style={styles.icon}
                            source={require('../assets/earth.png')}
                            contentFit="cover"
                            transition={1000}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image
                            style={styles.icon}
                            source={require('../assets/settings.png')}
                            contentFit="cover"
                            transition={1000}
                        />
                    </TouchableOpacity>
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fun_fact: {
        backgroundColor: '#FFFFFF',
        width: '90%',
        flex: 1,
        overflow: 'hidden',
        borderRadius: 15,
    },
    container: {
        flex: 1,
        backgroundColor: '#C2BAB1',
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
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        textAlign: 'left'
    },
    topSearch: {
        flexBasis: 225,
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
        justifyContent: 'space-around',
        paddingTop: 20,
        gap: 20,
    },
    input_container: {
        width: '100%',
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },  
    input: {
        width: '90%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingLeft: 20,
        paddingRight: 20,
        fontSize: 16,
        display: 'flex',
        flexDirection: 'row',
    },
    magnifyingGlass: {
        position: 'absolute',
        width: 25,
        height: 25,
        right: 30,
        bottom: 12.5,
    },
    icon: {
        width: 25,
        height: 25,
    },
    feed: {
        width: '100%',
        alignItems: 'center',
        gap: 30,
        marginVertical: 30,
    },
    item: {
        backgroundColor: '#53A269',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        height: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
    },
    map: {
        flex: 1
    },
    outer_controls: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    inner_controls: {
        margin: 20,
        paddingVertical: 12,
        borderRadius: 50,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ffffff69',
    }
});
