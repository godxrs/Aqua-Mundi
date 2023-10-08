import { ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import MapView from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground } from 'expo-image';
import * as Location from 'expo-location';
import { useEffect, useState, useRef } from 'react';
import { TextInput } from 'react-native';
import { BlurView } from 'expo-blur';

export default function FeedScreen({ navigation }) {
    const [location, setLocation] = useState();
    const [bodiesOfWater, setBodiesOfWater] = useState();
    const [search, setSearch] = useState("");
    const [image, setImage] = useState();
    const scrollRef = useRef();
    const searchRef = useRef();

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
                    if (element.tags && element.tags.name && !element.tags.name.toLowerCase().split(" ").includes("pool")) {
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

    function getDistanceInFeet(lat1, lon1, lat2, lon2) {
        const earthRadiusInFeet = 20902231;

        const lat1Rad = (lat1 * Math.PI) / 180;
        const lon1Rad = (lon1 * Math.PI) / 180;
        const lat2Rad = (lat2 * Math.PI) / 180;
        const lon2Rad = (lon2 * Math.PI) / 180;

        const dlat = lat2Rad - lat1Rad;
        const dlon = lon2Rad - lon1Rad;
        const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dlon / 2) * Math.sin(dlon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distanceInFeet = earthRadiusInFeet * c;

        return distanceInFeet;
    }
    const setLocationAsCurrent = async () => {
        const location = await Location.getCurrentPositionAsync()
        setLocation(location.coords)
    }

    const onPressTouch = () => {
        scrollRef.current?.scrollTo({
            y: 0,
            animated: true,
        });
    }

    useEffect(() => {
        setLocationAsCurrent()
        getBackgroundImage()
    }, [])

    useEffect(() => {
        if (location != undefined) {
            getWaterBodies(location.latitude, location.longitude, 6000)
        }
    }, [location])

    const searchToGeoCode = async () => {
        Keyboard.dismiss()
        const geocodedLocation = await Location.geocodeAsync(search.text)

        if (geocodedLocation.length > 0) {
            setLocation(geocodedLocation[0])
        } else {
            ToastAndroid.show('Invalid location.', ToastAndroid.SHORT);
        }
    }

    const getBackgroundImage = () => {
        ImageAPI = "https://api.nasa.gov/planetary/apod?&api_key=KhJVaWNEPSWMPvwJRCVGFjl72VmpE1lLvEXlsvU9"

        fetch(ImageAPI, {
            method: 'GET'
        })
            .then(async response => {
                if (!response.ok) {
                    throw new Error('HTTP request failed');
                }
                let json = await response.json()
                setImage(json.url)
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                return [];
            });
    }

    return (
        <View style={styles.container}>
            <ImageBackground style={styles.topSearch} source={image}>
                <LinearGradient colors={['#062E523C', '#062E523C']} style={styles.gradientContainer}>
                    <Text style={styles.text_lg}>Aqua Mundi</Text>
                    <View style={styles.input_container}>
                        <TextInput
                            ref={searchRef}
                            style={styles.input}
                            onChangeText={text => setSearch({ text })}
                            defaultValue={search.text}
                            placeholder={"Search for a location..."}
                            onSubmitEditing={() => searchToGeoCode()}
                        />
                        <View style={styles.search_icon_container}>
                            <TouchableOpacity onPress={() => setLocationAsCurrent()}>
                                <Image
                                    style={styles.marker}
                                    source={require('../assets/marker.png')}
                                    contentFit="cover"
                                    transition={1000}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => searchToGeoCode()}>
                                <Image
                                    style={styles.magnifyingGlass}
                                    source={require('../assets/magnifying_glass.png')}
                                    contentFit="cover"
                                    transition={1000}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
            <ScrollView contentContainerStyle={styles.feed} ref={scrollRef}>
                {bodiesOfWater &&
                    bodiesOfWater.map((bodyOfWater, index) => {
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

                        const distance = getDistanceInFeet(
                            location.latitude,
                            location.longitude,
                            centerLatitude,
                            centerLongitude
                        );

                        return (
                            <TouchableWithoutFeedback
                                style={styles.item_container}
                                key={bodyOfWater.id}
                                onPress={() =>
                                    navigation.push("Details", { bodyOfWater: bodyOfWater, initialRegion: initialRegion })
                                }
                            >
                                <BlurView style={styles.item} intensity={80} tint='light'>
                                    <View
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={styles.text_md}>{bodyOfWater.tags.name}</Text>
                                        <Text>{distance ? Math.round(distance) : 'N/A'}ft</Text>
                                    </View>

                                    <View style={{ borderRadius: 15, overflow: 'hidden', flex: 1 }}>
                                        <MapView
                                            style={styles.map}
                                            initialRegion={initialRegion}
                                            scrollEnabled={false}
                                            zoomEnabled={false}
                                        />
                                    </View>
                                </BlurView>
                            </TouchableWithoutFeedback>
                        );
                    })}
            </ScrollView>
            <View style={styles.outer_controls}>
                <BlurView intensity={80} style={styles.inner_controls} tint="light">
                    <TouchableOpacity onPress={onPressTouch}>
                        <Image
                            style={styles.icon}
                            source={require('../assets/menu.png')}
                            contentFit="cover"
                            transition={1000}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { searchRef.current.focus() }}>
                        <Image
                            style={styles.icon}
                            source={require('../assets/magnifying_glass.png')}
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
    container: {
        flex: 1,
        backgroundColor: '#d6d3d1',
    },
    text_lg: {
        fontSize: 35,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        textAlign: 'left'
    },
    text_md: {
        fontSize: 18,
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        textAlign: 'left'
    },
    topSearch: {
        flexBasis: 120,
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
        paddingBottom: 20,
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
    search_icon_container: {
        position: 'absolute',
        right: 20,
        top: 0,
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
    },
    magnifyingGlass: {
        width: 25,
        height: 25,
        top: 12.5,
        right: 10,
    },
    marker: {
        width: 25,
        height: 25,
        top: 12.5,
        right: 10,
    },
    icon: {
        width: 25,
        height: 25,
    },
    feed: {
        width: '100%',
        alignItems: 'center',
        overflow: 'scroll',
        gap: 30,
        marginVertical: 30,
        paddingBottom: 50,
    },
    item_container: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    item: {
        borderRadius: 15,
        overflow: 'hidden',
        padding: 20,
        width: '90%',
        height: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
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
