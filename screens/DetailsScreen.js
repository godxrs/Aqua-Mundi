import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Image } from 'react-native';
import MapView from 'react-native-maps';

export default function DetailsScreen({ navigation, route }) {
    const [county, setCounty] = useState("")
    const [species, setSpecies] = useState()
    const [marineSpecies, setMarineSpecies] = useState([{Code:"-1",CName: "Getting the fish..."}])
    const [initialRegion, setInitialRegion] = useState()
    const [summary, setSummary] = useState("Loading some tips and facts...")

    const getCounty = async (lat, lon) => {
        const query = `[out:json];
        is_in(${lat},${lon});
        area._[admin_level=6];
        out;`;

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
                setCounty(data.elements[0].tags.name.toLowerCase().replace("county", ""))
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                return [];
            });
    }

    const getSpeciesInCounty = async (county_name) => {
        const apiURL = 'https://tpwd.texas.gov/ris.net/rtest/Services/wsESData.asmx/getCountySpeciesList';

        const headers = {
            'Content-Type': 'application/json; charset=UTF-8'
        };

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        fetch(apiURL, {
            method: 'POST',
            headers: headers,
            body: `{\"counties1\":\"${capitalizeFirstLetter(county_name.trim())}\"}`
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP request failed');
                }
                return response.json();
            })
            .then(data => {
                setSpecies(JSON.parse(data.d.replace(/'/g, '"')))
            })
            .catch(error => {
                console.error(error);
                return [];
            });
    }

    const getSummarry = async () => {
        let fishes = marineSpecies.map((s) => { return s.CName })

        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": `Write one paragraph about how to respectful use body of water for recreation if you know these endangered fish are inside ${fishes.toString()}. `
                    }
                ],
                max_tokens: 256,
                temperature: 1,
            }),
        }).then(async res => {
            const json = await res.json()

            setSummary(json.choices[0].message.content)
        })
            .catch(error => {
                console.log(error);
            });
    }


    const filterByMarineAnimal = async (species) => {
        let tempMarineSpecies = [];

        for (let specie of species) {
            if (specie.Taxon == "Fish") {
                tempMarineSpecies.push(specie);
            }
        }

        setMarineSpecies(tempMarineSpecies);
    }

    useEffect(() => {
        maxLatitude = route.params.bodyOfWater.bounds.maxlat
        maxLongitude = route.params.bodyOfWater.bounds.maxlon

        getCounty(maxLatitude, maxLongitude)
        setInitialRegion(route.params.initialRegion)
        getSummarry()
    }, [])

    useEffect(() => {
        getSpeciesInCounty(county)
    }, [county])

    useEffect(() => {
        if (species != undefined) {
            filterByMarineAnimal(species.Results)
        }
    }, [species])

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={{ paddingHorizontal: 20, padddingTop: 20, }} onPress={() => navigation.pop()}>
                <Image
                    style={styles.back_arrow}
                    source={require('../assets/left_arrow.png')}
                    contentFit="cover"
                    transition={1000}
                />
            </TouchableOpacity>
            <View style={styles.top_container}>
                <View style={styles.top_info_section}>
                    <Text style={styles.text_md_title}>{route.params.bodyOfWater.tags.name}</Text>
                    <View style={styles.map_container}>
                        {
                            initialRegion != undefined && (

                                <MapView
                                    style={styles.map}
                                    initialRegion={initialRegion}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                />
                            )
                        }
                    </View>
                </View>
            </View>
            <View style={styles.bottom_section}>
                <View style={styles.inner_bottom_section}>
                    <Text style={styles.text_md}>Endangered Species</Text>
                    {
                        marineSpecies.map((s) => { return (<Text key={s.Code} style={styles.text_sm}>{s.CName}</Text>) })
                    }
                </View>
            </View>
            <View style={styles.bottom_section}>
                <View style={styles.inner_bottom_section}>
                    <Text style={styles.text_md}>Tips & Facts</Text>
                    <Text style={styles.text_sm}>{summary}</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        gap: 20,
    },
    text_md_title: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    bottom_section: {
        width: '100%',
        alignItems: 'center',
    },
    inner_bottom_section: {
        width: '90%',
    },
    top_info_section: {
        width: '90%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 5,
    },
    top_container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: 250,
        alignItems: 'center',
    },
    map_container: {
        borderRadius: 15,
        overflow: 'hidden',
        width: '100%',
        flex: 1
    },
    map: {
        flex: 1
    },
    text_lg: {
        fontSize: 80,
        color: '#fff',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'left'
    },
    text_md: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        textAlign: 'left'
    },
    text_sm: {
        fontSize: 16,
        textAlign: 'left',
        textTransform: 'capitalize',
    },
    back_arrow: {
        width: 50,
        height: 50,
    }
});
