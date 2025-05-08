import { Text } from 'react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import FaceAnalyzer from '../components/home/FaceAnalyzer';
import RoutineRater from '../components/home/RoutineRater';
import ProductScanner from '../components/home/ProductScanner';
import { useUIStore } from '../store/uiStore';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
    const showTabs = useUIStore((state) => state.showTabs);

    return (
        <Tab.Navigator
            initialRouteName="ImageAnalyzer"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: showTabs ? styles.tabBar : { display: 'none' },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'ImageAnalyzer') {
                        iconName = focused ? 'camera' : 'camera-outline';
                    } else if (route.name === 'RoutineRater') {
                        iconName = focused ? 'flask' : 'flask-outline';
                    } else if (route.name === 'ProductScanner') {
                        iconName = focused ? 'barcode' : 'barcode-outline';
                    }

                    return (
                        <Ionicons
                            name={iconName}
                            size={24}
                            color={focused ? '#a24cc3' : '#FFF'}
                        />
                    );
                },
                tabBarLabel: ({ focused }) => {
                    const labelMap = {
                        RoutineRater: 'Routine',
                        ImageAnalyzer: 'Analyze',
                        ProductScanner: 'Scan',
                    };

                    return (
                        <Text
                            style={{
                                color: focused ? '#a24cc3' : '#FFF',
                                fontSize: 12,
                            }}
                        >
                            {labelMap[route.name]}
                        </Text>
                    );
                },
            })}
        >
            <Tab.Screen name="RoutineRater" component={RoutineRater} />
            <Tab.Screen name="ImageAnalyzer" component={FaceAnalyzer} />
            <Tab.Screen name="ProductScanner" component={ProductScanner} />
        </Tab.Navigator>
    );
};

export default BottomTabs;

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        zIndex: 10,
        bottom: 20,
        backgroundColor: '#1e1e1e',
        borderRadius: 15,
        height: 60,
        marginHorizontal: 20,
        marginBottom: 10,
        borderTopWidth: 0,
    },
});
